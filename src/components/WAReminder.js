import React from 'react';
import { buildWAMessage, openWhatsApp, formatDate } from '../utils';

export default function WAReminder({ student, onClose }) {
  if (!student) return null;
  const message = buildWAMessage(student);

  const handleSend = () => {
    openWhatsApp(student.phone, message);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 420, maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: '#111' }}>📲 WhatsApp reminder</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>
          Sending to <strong>{student.name}</strong> — +91 {student.phone}
        </p>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.7, color: '#111', whiteSpace: 'pre-wrap', marginBottom: 14 }}>
          {message}
        </div>

        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#854F0B', marginBottom: 18 }}>
          💡 This opens WhatsApp with the message pre-filled. You just press <strong>Send</strong>.
          Upgrade to AiSensy later for fully automatic sending.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSend} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Open WhatsApp ↗
          </button>
        </div>
      </div>
    </div>
  );
}
