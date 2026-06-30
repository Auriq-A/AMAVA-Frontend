// Zero-style register page (to be designed later).
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuth, API_BASE } from '../lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (r.ok && d.api_key) { setAuth(d.api_key, d.email); nav('/'); }
      else setErr(d.message || 'Registration failed.');
    } catch { setErr(`Could not reach the server at ${API_BASE}.`); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password (min 6 chars)</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {err && <p style={{ color: 'red' }}>{err}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
