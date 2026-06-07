# 📚 LibraryPro — Digital Library Fee Management System

Track student fees, due dates, and send WhatsApp reminders.

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Install Node.js
Download from https://nodejs.org → install LTS version

### Step 2 — Install project dependencies
Open terminal in this folder and run:
```bash
npm install
```

### Step 3 — Set up Firebase
1. Go to https://firebase.google.com → sign in with Google
2. Click "Create a project" → name it `library-fee-system`
3. Go to Firestore Database → Create database → Production mode → Region: asia-south1
4. Go to Project Settings → Add App → Web
5. Copy your config values

### Step 4 — Create your .env file
Copy `.env.example` to `.env` and fill in your Firebase values:
```
REACT_APP_FIREBASE_API_KEY=your_actual_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 5 — Run locally
```bash
npm start
```
Opens at http://localhost:3000

---

## 🌐 Deploy to Vercel (Free Hosting)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/library-fee-system.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com → sign in with GitHub
2. Click "Add New Project" → import your repo
3. Go to Settings → Environment Variables
4. Add all REACT_APP_FIREBASE_* variables from your .env file
5. Click Deploy → your app is live! 🎉

---

## 📱 WhatsApp Reminder (wa.me — Free)

Click the 📲 button next to any student → WhatsApp opens with a pre-filled message.
You just press Send. No API needed.

**To upgrade to automatic sending later:**
- Sign up at https://aisensy.com (₹999/month)
- Replace the openWhatsApp function in src/utils.js with AiSensy API call

---

## 📁 Project Structure

```
src/
├── App.js              ← main dashboard + Firebase logic
├── firebase.js         ← Firebase connection
├── utils.js            ← helper functions
└── components/
    ├── MetricCards.js  ← summary numbers at top
    ├── StudentTable.js ← student list with actions
    ├── AddStudentModal.js ← add/edit student form
    └── WAReminder.js   ← WhatsApp message preview
```

---

## ✅ Features

- Add / edit / delete students
- Admission date → auto fee due date calculation
- Live status: Paid / Due soon / Overdue
- Search by name, phone, student ID
- Filter by status and plan
- WhatsApp reminder with pre-filled message (wa.me)
- Bulk remind all overdue students
- Mark fee as paid
- Export all data to CSV
- Real-time sync with Firebase (changes reflect instantly)

---

## 🔒 Security Note

Before sharing the app publicly, add Firebase Authentication
so only your client can log in and access student data.
Contact your developer to add login functionality.
