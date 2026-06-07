import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ✏️ Change these credentials to whatever your client wants
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'library@2024';

  const handleLogin = () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('lib_auth', 'true');
        onLogin();
      } else {
        setError('❌ Incorrect username or password.');
      }
      setLoading(false);
    }, 600);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const inp = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid #dde1e7',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f9fafb',
    color: '#111',
    transition: 'border 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0C447C 0%, #1a6bb5 50%, #0e3d6e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '40px 36px',
        width: 380,
        maxWidth: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, background: '#0C447C', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 14px',
          }}>📚</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>LibraryPro</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Admin login — fee management system</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Username</label>
          <input
            style={inp}
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inp}
              type={showPass ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="current-password"
            />
            <button
              onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888' }}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: loading ? '#93c5fd' : '#0C447C', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 20 }}>
          Only authorized admin can access this system
        </p>
      </div>
    </div>
  );
}
