// Generate next due date from admission date
// Logic: due date is always on the same day of month as admission
// e.g. admitted 8 May → due 8 Jun → due 8 Jul → etc.
export function getNextDueDate(admissionDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const adm = new Date(admissionDate);
  const dayOfMonth = adm.getDate();

  // Find the next due date on or after today
  let due = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

  // If this month's due date has already passed, move to next month
  if (due < now) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }

  return due.toISOString().slice(0, 10);
}

// Compute status based on next due date
// - overdue: due date has passed
// - due: within 7 days of due date
// - paid: more than 7 days away (fee not yet due)
export function computeStatus(nextDue, manualStatus) {
  if (manualStatus === 'paid') return 'paid';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(nextDue);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due - now) / 86400000); // days until due
  if (diff < 0) return 'overdue';   // past due date
  if (diff <= 7) return 'due';      // within 7 days → show "Due soon"
  return 'paid';                     // more than 7 days away → not due yet
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
