// Generate next due date from admission date
export function getNextDueDate(admissionDate) {
  const now = new Date();
  const adm = new Date(admissionDate);
  const dayOfMonth = adm.getDate();
  const due = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (due <= now) due.setMonth(due.getMonth() + 1);
  return due.toISOString().slice(0, 10);
}

// Compute status based on next due date and paid flag
export function computeStatus(nextDue, manualStatus) {
  if (manualStatus === 'paid') return 'paid';
  const now = new Date();
  const due = new Date(nextDue);
  const diff = Math.floor((due - now) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff <= 5) return 'due';
  return 'paid';
}

// Get initials from name
export function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// Avatar color based on name
const COLORS = ['#185FA5','#3B6D11','#854F0B','#993556','#534AB7','#0F6E56','#993C1D'];
export function avatarColor(name) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

// Format date for display
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// Build WhatsApp message
export function buildWAMessage(student) {
  const due = formatDate(student.nextDue);
  const isOverdue = student.status === 'overdue';
  return `Dear ${student.name},\n\nThis is a reminder from *LibraryPro Digital Library*.\n\nYour monthly fee of *₹${student.fee}* is ${isOverdue ? '*overdue*' : `due on *${due}*`}.\n\nPlease make the payment at your earliest convenience to continue using library services.\n\nStudent ID: ${student.id}\nSeat: ${student.seat || '—'}\n\nThank you!\n– Library Management`;
}

// Open WhatsApp link
export function openWhatsApp(phone, message) {
  const clean = phone.replace(/\D/g, '');
  const number = clean.startsWith('91') ? clean : '91' + clean;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Generate unique student ID
export function generateStudentId(count) {
  return 'LIB' + String(count + 1).padStart(3, '0');
}
