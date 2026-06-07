import React from 'react';
import { getInitials, avatarColor, formatDate, buildWAMessage, openWhatsApp } from '../utils';

const STATUS_BADGE = {
  paid: { bg: '#EAF3DE', color: '#27500A', label: '✓ Paid' },
  due: { bg: '#FAEEDA', color: '#633806', label: '🕐 Due soon' },
  overdue: { bg: '#FCEBEB', color: '#791F1F', label: '⚠ Overdue' },
};

export default function StudentTable({ students, onEdit, onDelete, onMarkPaid, onWA }) {
  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', border: '1px dashed #ddd', borderRadius: 12 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>No students found</p>
        <p style={{ fontSize: 13 }}>Add your first student or adjust your search filters</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['Student', 'Admission', 'Fee/month', 'Plan', 'Next due', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#666', borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const badge = STATUS_BADGE[s.status] || STATUS_BADGE.due;
              return (
                <tr key={s.id || i} style={{ borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(s.name) + '22', color: avatarColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{s.id} · {s.seat || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{formatDate(s.admissionDate)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111' }}>₹{Number(s.fee).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{s.plan}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{formatDate(s.nextDue)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{badge.label}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn title="WhatsApp reminder" color="#25D366" onClick={() => onWA(s)}>📲</ActionBtn>
                      {s.status !== 'paid' && <ActionBtn title="Mark as paid" color="#3B6D11" onClick={() => onMarkPaid(s)}>✓</ActionBtn>}
                      <ActionBtn title="Edit student" color="#185FA5" onClick={() => onEdit(s)}>✏️</ActionBtn>
                      <ActionBtn title="Delete" color="#A32D2D" onClick={() => onDelete(s)}>🗑</ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ title, color, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #eee', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = color + '18'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#eee'; }}
    >
      {children}
    </button>
  );
}
