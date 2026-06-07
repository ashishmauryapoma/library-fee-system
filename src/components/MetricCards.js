import React from 'react';

export default function MetricCards({ students }) {
  const total = students.length;
  const paid = students.filter(s => s.status === 'paid').length;
  const due = students.filter(s => s.status === 'due').length;
  const overdue = students.filter(s => s.status === 'overdue').length;
  const revenue = students.reduce((a, s) => a + (s.status !== 'overdue' ? Number(s.fee) : 0), 0);

  const cards = [
    { label: 'Total students', value: total, color: '#185FA5', bg: '#E6F1FB', icon: '👥' },
    { label: 'Paid this month', value: paid, color: '#3B6D11', bg: '#EAF3DE', icon: '✅' },
    { label: 'Due soon', value: due, color: '#854F0B', bg: '#FAEEDA', icon: '🕐' },
    { label: 'Overdue', value: overdue, color: '#A32D2D', bg: '#FCEBEB', icon: '⚠️' },
    { label: 'Monthly revenue', value: `₹${revenue.toLocaleString('en-IN')}`, color: '#534AB7', bg: '#EEEDFE', icon: '💰' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>{c.icon} {c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: c.color }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
