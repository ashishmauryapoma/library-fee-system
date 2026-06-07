import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import MetricCards from './components/MetricCards';
import StudentTable from './components/StudentTable';
import AddStudentModal from './components/AddStudentModal';
import WAReminder from './components/WAReminder';
import { generateStudentId, computeStatus, buildWAMessage, openWhatsApp } from './utils';

export default function App() {
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

  // Live sync from Firebase
  useEffect(() => {
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
  }, []);

  // Add student
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

  // Mark as paid
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

  // Delete student
  const handleDelete = async (student) => {
    if (!window.confirm(`Remove ${student.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'students', student.id));
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Bulk WhatsApp reminder to all overdue
  const handleBulkRemind = () => {
    const overdue = students.filter(s => s.status === 'overdue');
    if (!overdue.length) { alert('No overdue students right now! 🎉'); return; }
    if (!window.confirm(`Send WhatsApp reminders to ${overdue.length} overdue student(s)?\n\nThis will open WhatsApp for each one.`)) return;
    overdue.forEach((s, i) => {
      setTimeout(() => {
        openWhatsApp(s.phone, buildWAMessage(s));
      }, i * 1500);
    });
  };

  // Export CSV
  const exportCSV = () => {
    const hdr = 'Student Code,Name,Phone,Admission Date,Fee,Plan,Seat,Status,Next Due,Total Paid';
    const rows = students.map(s =>
      [s.studentCode, s.name, s.phone, s.admissionDate, s.fee, s.plan, s.seat, s.status, s.nextDue, s.totalPaid || 0].join(',')
    );
    const csv = [hdr, ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `students_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // Filter + search
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
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
            <button onClick={exportCSV} style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}>⬇ Export CSV</button>
            <button onClick={() => { setEditData(null); setShowAdd(true); }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0C447C', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ Add student</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading students...</div>
        ) : (
          <>
            <MetricCards students={students} />

            {/* Controls */}
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

            {/* Pagination */}
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

      {/* Modals */}
      <AddStudentModal open={showAdd} onClose={() => { setShowAdd(false); setEditData(null); }} onSave={handleSave} editData={editData} />
      <WAReminder student={waStudent} onClose={() => setWAStudent(null)} />
    </div>
  );
}
