import { useState, useEffect } from 'react';
import { getUserRentals, returnBook } from '../services/api';

function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchRentals(); }, []);

  const fetchRentals = async () => {
    try {
      const res = await getUserRentals(user._id);
      setRentals(res.data);
    } catch (err) { console.error(err); }
  };

  const handleReturn = async (rentalId) => {
    try {
      await returnBook(rentalId);
      setMessage('Book returned successfully!');
      fetchRentals();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Return failed');
    }
  };

  const active = rentals.filter(r => r.status === 'borrowed');
  const returned = rentals.filter(r => r.status === 'returned');

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>My Rentals</h2>
        <p style={s.subtitle}>Track your borrowed books</p>
      </div>

      <div style={s.content}>
        {message && <div style={s.toast}>✅ {message}</div>}

        <div style={s.statsRow}>
          <div style={s.stat}><span style={s.statNum}>{active.length}</span><span style={s.statLabel}>Currently Borrowed</span></div>
          <div style={s.stat}><span style={s.statNum}>{returned.length}</span><span style={s.statLabel}>Returned</span></div>
          <div style={s.stat}><span style={s.statNum}>{rentals.length}</span><span style={s.statLabel}>Total Rentals</span></div>
        </div>

        {rentals.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p style={{ color: '#8888aa', marginTop: '12px' }}>No rentals yet. Go borrow a book!</p>
          </div>
        ) : (
          <div style={s.grid}>
            {rentals.map(rental => (
              <div key={rental._id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={{ fontSize: '36px' }}>📖</span>
                  <span style={{ ...s.statusBadge, background: rental.status === 'borrowed' ? '#1e2a1e' : '#1a1d2e', color: rental.status === 'borrowed' ? '#2ecc71' : '#8888aa', border: `1px solid ${rental.status === 'borrowed' ? '#2ecc71' : '#3a3d5a'}` }}>
                    {rental.status === 'borrowed' ? '● Active' : '✓ Returned'}
                  </span>
                </div>
                <h3 style={s.bookTitle}>{rental.bookTitle}</h3>
                <div style={s.dateRow}>
                  <div style={s.dateItem}><span style={s.dateLabel}>Borrowed</span><span style={s.dateVal}>{new Date(rental.borrowedAt).toDateString()}</span></div>
                  <div style={s.dateItem}><span style={s.dateLabel}>Due Date</span><span style={{ ...s.dateVal, color: rental.status === 'borrowed' ? '#f0c040' : '#8888aa' }}>{new Date(rental.dueDate).toDateString()}</span></div>
                </div>
                {rental.status === 'borrowed' && (
                  <button style={s.returnBtn} onClick={() => handleReturn(rental._id)}>Return Book</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f1117' },
  header: { background: 'linear-gradient(135deg, #1a1d2e 0%, #232640 100%)', padding: '48px', borderBottom: '1px solid #2a2d4a' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '40px', color: '#eaeaea' },
  subtitle: { color: '#8888aa', marginTop: '8px' },
  content: { padding: '40px 48px' },
  toast: { background: '#1a2e1a', border: '1px solid #2ecc71', color: '#2ecc71', padding: '12px 18px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '36px' },
  stat: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#f0c040' },
  statLabel: { color: '#8888aa', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '80px', background: '#1a1d2e', borderRadius: '12px', border: '1px solid #2a2d4a' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  card: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px' },
  bookTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#eaeaea' },
  dateRow: { display: 'flex', gap: '20px' },
  dateItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  dateLabel: { color: '#8888aa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  dateVal: { color: '#eaeaea', fontSize: '13px', fontWeight: '500' },
  returnBtn: { padding: '11px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }
};

export default MyRentals;