import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await registerUser(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.icon}>📚</span>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.subtitle}>Join our library community</p>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <div style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} placeholder="Mohammed Mustafa" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          
          <button style={s.btn} onClick={handleSubmit}>Create Account</button>
        </div>
        <p style={s.footer}>Already have an account? <Link to="/login" style={s.footerLink}>Sign In</Link></p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 40%, #1a1d2e 0%, #0f1117 100%)' },
  card: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '16px', padding: '48px', width: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  icon: { fontSize: '40px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#f0c040', marginTop: '8px' },
  subtitle: { color: '#8888aa', fontSize: '14px', marginTop: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#aaaacc', fontSize: '13px', fontWeight: '500', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', backgroundColor: '#232640', border: '1px solid #3a3d5a', borderRadius: '8px', color: '#eaeaea', fontSize: '15px', outline: 'none' },
  btn: { padding: '13px', backgroundColor: '#f0c040', color: '#0f1117', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
  error: { background: '#2d1a1a', border: '1px solid #e74c3c', color: '#e74c3c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  footer: { textAlign: 'center', marginTop: '24px', color: '#8888aa', fontSize: '13px' },
  footerLink: { color: '#f0c040', textDecoration: 'none', fontWeight: '600' }
};

export default Register;