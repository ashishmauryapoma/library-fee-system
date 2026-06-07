import React, { useState, useEffect } from 'react';
import { getNextDueDate } from '../utils';

const FIELD = { name: '', phone: '', admissionDate: '', fee: '500', plan: 'Monthly', seat: '' };

export default function AddStudentModal({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState(FIELD);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) setForm({ ...editData });
    else setForm({ ...FIELD, admissionDate: new Date().toISOString().slice(0, 10) });
    setErrors({});
  }, [editData, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || form.phone.replace(/\D/g,'').length < 10) e.phone = 'Valid 10-digit number required';
    if (!form.admissionDate) e.admissionDate = 'Admission date required';
    if (!form.fee || isNaN(form.fee) || Number(form.fee) <= 0) e.fee = 'Valid fee required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const nextDue = getNextDueDate(form.admissionDate);
    onSave({ ...form, fee: Number(form.fee), nextDue, status: 'due' });
  };

  if (!open) return null;

  const inputStyle = (field) => ({
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: `1px solid ${errors[field] ? '#e24b4a' : '#ddd'}`,
    fontSize: 13, outline: 'none', marginTop: 4, boxSizing: 'border-box'
  });

  const labelStyle = { fontSize: 12, color: '#666', display: 'block' };
  const errStyle = { fontSize: 11, color: '#e24b4a', marginTop: 2 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 440, maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 18, color: '#111' }}>
          {editData ? '✏️ Edit student' : '➕ Add new student'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Full name *</label>
            <input style={inputStyle('name')} placeholder="Ravi Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>
          <div>
            <label style={labelStyle}>WhatsApp number *</label>
            <input style={inputStyle('phone')} placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p style={errStyle}>{errors.phone}</p>}
          </div>
          <div>
            <label style={labelStyle}>Admission date *</label>
            <input type="date" style={inputStyle('admissionDate')} value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} />
            {errors.admissionDate && <p style={errStyle}>{errors.admissionDate}</p>}
          </div>
          <div>
            <label style={labelStyle}>Monthly fee (₹) *</label>
            <input type="number" style={inputStyle('fee')} placeholder="500" value={form.fee} onChange={e => set('fee', e.target.value)} />
            {errors.fee && <p style={errStyle}>{errors.fee}</p>}
          </div>
          <div>
            <label style={labelStyle}>Plan</label>
            <select style={{ ...inputStyle('plan'), background: '#fff' }} value={form.plan} onChange={e => set('plan', e.target.value)}>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Seat / section</label>
            <input style={inputStyle('seat')} placeholder="A-01" value={form.seat} onChange={e => set('seat', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#0C447C', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {editData ? 'Update student' : 'Add student'}
          </button>
        </div>
      </div>
    </div>
  );
}
