import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import MetricCards from './components/MetricCards';
import StudentTable from './components/StudentTable';
import AddStudentModal from './components/AddStudentModal';
import WAReminder from './components/WAReminder';
import Login from './components/Login';
import { generateStudentId, computeStatus, buildWAMessage, openWhatsApp, formatDate } from './utils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('lib_auth') === 'true');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState(null);
  const [waStudent, setWAStudent] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!isLoggedIn) return;
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => {
        const s = { id: d.id, ...d.data() };
        s.status = computeStatus(s.nextDue, s.manualStatus);
        return s;
      });
      setStudents(data);
      setLoading(false);
    });
    return unsub;
  }, [isLoggedIn]);

  const handleLogin = () => {
    localStorage.setItem('lib_auth', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lib_auth');
    setIsLoggedIn(false);
    setStudents([]);
    setLoading(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editData && editData.id) {
        const { id, ...rest } = formData;
        await updateDoc(doc(db, 'students', editData.id), { ...rest, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'students'), {
          ...formData,
          studentCode: generateStudentId(students.length),
          manualStatus: null,
          totalPaid: 0,
          createdAt: new Date().toISOString(),
        });
      }
      setShowAdd(false);
      setEditData(null);
    } catch (err) {
      alert('Error saving student: ' + err.message);
    }
  };

  const handleMarkPaid = async (student) => {
    try {
      await updateDoc(doc(db, 'students', student.id), {
        manualStatus: 'paid',
        totalPaid: (student.totalPaid || 0) + Number(student.fee),
        lastPaidAt: new Date().toISOString(),
      });
    } catch (err) {
      alert('Error updating: ' + err.message);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Remove ${student.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'students', student.id));
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleBulkRemind = () => {
    const overdue = students.filter(s => s.status === 'overdue');
    if (!overdue.length) { alert('No overdue students right now! 🎉'); return; }
    if (!window.confirm(`Send WhatsApp reminders to ${overdue.length} overdue student(s)?\n\nThis will open WhatsApp for each one.`)) return;
    overdue.forEach((s, i) => {
      setTimeout(() => openWhatsApp(s.phone, buildWAMessage(s)), i * 1500);
    });
  };

  const exportPDF = () => {
    const rows = students.map(s => ({
      name: s.name || '',
      admNo: s.studentCode || '',
      mobile: s.phone || '',
      joinDate: formatDate(s.admissionDate),
      fee: `Rs.${Number(s.fee).toLocaleString('en-IN')}`,
      plan: s.plan || '',
      lastPaid: s.lastPaidAt ? formatDate(s.lastPaidAt) : '-',
      nextDue: formatDate(s.nextDue),
      amountDue: s.status === 'overdue' || s.status === 'due' ? `Rs.${Number(s.fee).toLocaleString('en-IN')}` : 'Rs.0',
      status: s.status === 'paid' ? 'Paid' : s.status === 'due' ? 'Due' : 'Overdue',
      remarks: s.remarks || '-',
    }));

    const cols = [
      { label: 'Student Name', key: 'name', w: 100 },
      { label: 'Admission No.', key: 'admNo', w: 70 },
      { label: 'Mobile No.', key: 'mobile', w: 80 },
      { label: 'Join Date', key: 'joinDate', w: 65 },
      { label: 'Fee/Month', key: 'fee', w: 60 },
      { label: 'Plan', key: 'plan', w: 55 },
      { label: 'Last Payment Date', key: 'lastPaid', w: 80 },
      { label: 'Next Due Date', key: 'nextDue', w: 75 },
      { label: 'Amount Due', key: 'amountDue', w: 65 },
      { label: 'Status', key: 'status', w: 55 },
      { label: 'Remarks', key: 'remarks', w: 70 },
    ];

    const pageW = 841.89, pageH = 595.28;
    const margin = 24;
    const tableW = pageW - margin * 2;
    const totalColW = cols.reduce((a, c) => a + c.w, 0);
    const headerH = 32, rowH = 24;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', pageW);
    svg.setAttribute('height', pageH);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', pageW); bg.setAttribute('height', pageH); bg.setAttribute('fill', '#fff');
    svg.appendChild(bg);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', pageW / 2); title.setAttribute('y', 18);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-family', 'Arial, sans-serif');
    title.setAttribute('font-size', '13'); title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#0C447C');
    title.textContent = `LibraryPro - Student Fee Report | ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    svg.appendChild(title);

    const tableY = 26;
    let x = margin;

    cols.forEach((col) => {
      const colW = (col.w / totalColW) * tableW;

      const hRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hRect.setAttribute('x', x); hRect.setAttribute('y', tableY);
      hRect.setAttribute('width', colW); hRect.setAttribute('height', headerH);
      hRect.setAttribute('fill', '#0C447C');
      hRect.setAttribute('stroke', '#fff'); hRect.setAttribute('stroke-width', '0.5');
      svg.appendChild(hRect);

      const words = col.label.split(' ');
      const lines = words.length > 2
        ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
        : [col.label];
      lines.forEach((line, li) => {
        const ht = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ht.setAttribute('x', x + colW / 2);
        ht.setAttribute('y', tableY + (lines.length === 1 ? headerH / 2 + 4 : 10 + li * 12));
        ht.setAttribute('text-anchor', 'middle');
        ht.setAttribute('font-family', 'Arial, sans-serif');
        ht.setAttribute('font-size', '8.5'); ht.setAttribute('font-weight', 'bold');
        ht.setAttribute('fill', '#fff');
        ht.textContent = line;
        svg.appendChild(ht);
      });

      rows.forEach((row, ri) => {
        const ry = tableY + headerH + ri * rowH;
        const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rowBg.setAttribute('x', x); rowBg.setAttribute('y', ry);
        rowBg.setAttribute('width', colW); rowBg.setAttribute('height', rowH);
        const statusColor = row.status === 'Paid' ? '#f0fdf4' : row.status === 'Due' ? '#fffbeb' : '#fff5f5';
        rowBg.setAttribute('fill', ri % 2 === 0 ? (col.key === 'status' ? statusColor : '#f8f9fa') : '#fff');
        rowBg.setAttribute('stroke', '#e0e0e0'); rowBg.setAttribute('stroke-width', '0.4');
        svg.appendChild(rowBg);

        let textColor = '#333';
        if (col.key === 'status') {
          textColor = row.status === 'Paid' ? '#166534' : row.status === 'Due' ? '#854F0B' : '#991b1b';
        }

        const td = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        td.setAttribute('x', x + colW / 2);
        td.setAttribute('y', ry + rowH / 2 + 3.5);
        td.setAttribute('text-anchor', 'middle');
        td.setAttribute('font-family', 'Arial, sans-serif');
        td.setAttribute('font-size', '8'); td.setAttribute('fill', textColor);
        if (col.key === 'status') td.setAttribute('font-weight', 'bold');
        let val = String(row[col.key]);
        if (val.length > 14 && colW < 90) val = val.slice(0, 13) + '...';
        td.textContent = val;
        svg.appendChild(td);
      });

      x += colW;
    });

    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    border.setAttribute('x', margin); border.setAttribute('y', tableY);
    border.setAttribute('width', tableW);
    border.setAttribute('height', headerH + rows.length * rowH);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', '#0C447C'); border.setAttribute('stroke-width', '1');
    svg.appendChild(border);

    const footer = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    footer.setAttribute('x', pageW / 2);
    footer.setAttribute('y', tableY + headerH + rows.length * rowH + 14);
    footer.setAttribute('text-anchor', 'middle');
    footer.setAttribute('font-family', 'Arial, sans-serif');
    footer.setAttribute('font-size', '8'); footer.setAttribute('fill', '#999');
    footer.textContent = `Total: ${rows.length}  |  Paid: ${rows.filter(r => r.status === 'Paid').length}  |  Due: ${rows.filter(r => r.status === 'Due').length}  |  Overdue: ${rows.filter(r => r.status === 'Overdue').length}`;
    svg.appendChild(footer);

    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fee-report-${new Date().toISOString().slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Report downloaded!\n\nTo save as PDF:\n1. Open the downloaded file in Chrome\n2. Press Ctrl+P\n3. Choose "Save as PDF" and click Save');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const matchQ = !q || s.name?.toLowerCase().includes(q) || s.phone?.includes(q) || s.studentCode?.toLowerCase().includes(q);
      const matchS = !filterStatus || s.status === filterStatus;
      const matchP = !filterPlan || s.plan === filterPlan;
      return matchQ && matchS && matchP;
    });
  }, [students, search, filterStatus, filterPlan]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const inputStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: '#0C447C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📚</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>LibraryPro</div>
              <div style={{ fontSize: 11, color: '#999' }}>Fee management system</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={exportPDF} style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}>⬇ Export PDF</button>
            <button onClick={() => { setEditData(null); setShowAdd(true); }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0C447C', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ Add student</button>
            <button onClick={handleLogout} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff0f0', color: '#b91c1c', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🔓 Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading students...</div>
        ) : (
          <>
            <MetricCards students={students} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1, minWidth: 200 }}
                placeholder="🔍 Search by name, phone, ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <select style={inputStyle} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All status</option>
                <option value="paid">Paid</option>
                <option value="due">Due soon</option>
                <option value="overdue">Overdue</option>
              </select>
              <select style={inputStyle} value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
                <option value="">All plans</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
              <button onClick={handleBulkRemind}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #25D366', background: '#f0fdf4', color: '#3B6D11', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 'auto' }}>
                📲 Remind all overdue
              </button>
            </div>
            <StudentTable
              students={paginated}
              onEdit={s => { setEditData(s); setShowAdd(true); }}
              onDelete={handleDelete}
              onMarkPaid={handleMarkPaid}
              onWA={setWAStudent}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13, color: '#888' }}>
              <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...inputStyle, cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ ...inputStyle, cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      <AddStudentModal open={showAdd} onClose={() => { setShowAdd(false); setEditData(null); }} onSave={handleSave} editData={editData} />
      <WAReminder student={waStudent} onClose={() => setWAStudent(null)} />
    </div>
  );
}
