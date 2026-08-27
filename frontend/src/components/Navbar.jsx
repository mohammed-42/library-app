import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { await logoutUser({ refreshToken }); } catch (err) {}
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={s.brandIcon}>📚</span>
        <span style={s.brandText}>LibraryApp</span>
      </Link>
      <div style={s.links}>
        <Link to="/" style={s.link}>Home</Link>
        {user ? (
          <>
            {user.role !== 'admin' && <Link to="/my-rentals" style={s.link}>My Rentals</Link>}
            {user.role === 'admin' && <Link to="/admin" style={s.link}>Admin</Link>}
            <span style={s.userBadge}>👤 {user.name}</span>
            <button onClick={logout} style={s.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.link}>Login</Link>
            <Link to="/register" style={s.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px', height: '68px', backgroundColor: '#1a1d2e', borderBottom: '1px solid #2a2d4a', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  brandIcon: { fontSize: '26px' },
  brandText: { fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: '#f0c040', letterSpacing: '0.5px' },
  links: { display: 'flex', alignItems: 'center', gap: '28px' },
  link: { color: '#aaaacc', textDecoration: 'none', fontSize: '14px', fontWeight: '500', letterSpacing: '0.3px', transition: 'color 0.2s' },
  userBadge: { color: '#f0c040', fontSize: '14px', fontWeight: '500' },
  logoutBtn: { backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  registerBtn: { backgroundColor: '#f0c040', color: '#0f1117', padding: '7px 18px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }
};

export default Navbar;