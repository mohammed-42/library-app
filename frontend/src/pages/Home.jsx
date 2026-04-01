import { useState, useEffect } from 'react';
import { getAllBooks, borrowBook } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [borrowDays, setBorrowDays] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async (params = {}) => {
    try {
      const res = await getAllBooks(params);
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = () => {
    const params = {};
    if (search) params.title = search;
    if (genre) params.genre = genre;
    fetchBooks(params);
  };

  const handleBorrow = async (bookId, bookTitle) => {
    if (!user) return navigate('/login');
    const days = borrowDays[bookId] || 7;
    try {
      await borrowBook({ userId: user._id, bookId, userName: user.name, email: user.email, days });
      setMessageType('success');
      setMessage(`"${bookTitle}" borrowed successfully! Due in ${days} days.`);
      fetchBooks();
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Borrow failed');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Discover Your Next<br /><span style={s.heroGold}>Great Read</span></h1>
        <p style={s.heroSub}>Browse thousands of books and borrow instantly</p>
        <div style={s.searchBar}>
          <input style={s.searchInput} placeholder="🔍  Search by title..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <input style={s.searchInput} placeholder="🏷️  Genre..." value={genre}
            onChange={e => setGenre(e.target.value)} />
          <button style={s.searchBtn} onClick={handleSearch}>Search</button>
          <button style={s.resetBtn} onClick={() => { setSearch(''); setGenre(''); fetchBooks(); }}>Reset</button>
        </div>
      </div>

      <div style={s.content}>
        {message && (
          <div style={{ ...s.toast, background: messageType === 'success' ? '#1a2e1a' : '#2d1a1a', borderColor: messageType === 'success' ? '#2ecc71' : '#e74c3c', color: messageType === 'success' ? '#2ecc71' : '#e74c3c' }}>
            {messageType === 'success' ? '✅' : '❌'} {message}
          </div>
        )}

        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>All Books</h2>
          <span style={s.count}>{books.length} books found</span>
        </div>

        <div style={s.grid}>
          {books.map((book, i) => (
            <div key={book._id} style={{ ...s.card, animationDelay: `${i * 0.05}s` }}>
              <div style={s.cardTop}>
                <div style={s.bookIcon}>📖</div>
                <span style={{ ...s.badge, background: book.availableCopies > 0 ? '#1a2e1a' : '#2d1a1a', color: book.availableCopies > 0 ? '#2ecc71' : '#e74c3c', border: `1px solid ${book.availableCopies > 0 ? '#2ecc71' : '#e74c3c'}` }}>
                  {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
                </span>
              </div>
              <h3 style={s.bookTitle}>{book.title}</h3>
              <p style={s.bookAuthor}>by {book.author}</p>
              <span style={s.genreBadge}>{book.genre}</span>
              <p style={s.bookDesc}>{book.description}</p>
              {user?.role !== 'admin' && (
                <div style={s.borrowSection}>
                  <div style={s.daysRow}>
                    <label style={s.daysLabel}>Borrow Duration</label>
                    <div style={s.daysOptions}>
                      {[3, 7, 14, 30].map(d => (
                        <button
                          key={d}
                          onClick={() => setBorrowDays({ ...borrowDays, [book._id]: d })}
                          style={{ ...s.dayChip, ...(( borrowDays[book._id] || 7) === d ? s.dayChipActive : {}) }}>
                          {d}d
                        </button>
                      ))}
                      <input
                        type="number"
                        min="1"
                        max="60"
                        placeholder="Custom"
                        style={s.daysInput}
                        onChange={e => setBorrowDays({ ...borrowDays, [book._id]: parseInt(e.target.value) || 7 })}
                      />
                    </div>
                  </div>
                  <button
                    style={{ ...s.borrowBtn, opacity: book.availableCopies > 0 ? 1 : 0.4, cursor: book.availableCopies > 0 ? 'pointer' : 'not-allowed' }}
                    disabled={book.availableCopies <= 0}
                    onClick={() => handleBorrow(book._id, book.title)}>
                    {book.availableCopies > 0 ? `Borrow for ${borrowDays[book._id] || 7} days` : 'Not Available'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f1117' },
  hero: { background: 'linear-gradient(135deg, #1a1d2e 0%, #232640 100%)', padding: '64px 48px', borderBottom: '1px solid #2a2d4a' },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: '52px', lineHeight: 1.2, color: '#eaeaea', marginBottom: '12px' },
  heroGold: { color: '#f0c040' },
  heroSub: { color: '#8888aa', fontSize: '16px', marginBottom: '32px' },
  searchBar: { display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '700px' },
  searchInput: { padding: '12px 16px', backgroundColor: '#0f1117', border: '1px solid #3a3d5a', borderRadius: '8px', color: '#eaeaea', fontSize: '14px', outline: 'none', width: '220px' },
  searchBtn: { padding: '12px 24px', backgroundColor: '#f0c040', color: '#0f1117', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  resetBtn: { padding: '12px 20px', backgroundColor: 'transparent', color: '#8888aa', border: '1px solid #3a3d5a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  content: { padding: '40px 48px' },
  toast: { padding: '14px 20px', borderRadius: '8px', border: '1px solid', marginBottom: '24px', fontSize: '14px', fontWeight: '500' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#eaeaea' },
  count: { color: '#8888aa', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.2s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bookIcon: { fontSize: '32px' },
  badge: { fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.3px' },
  bookTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#eaeaea', lineHeight: 1.3 },
  bookAuthor: { color: '#f0c040', fontSize: '13px', fontWeight: '500' },
  genreBadge: { display: 'inline-block', background: '#232640', color: '#aaaacc', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', width: 'fit-content' },
  bookDesc: { color: '#8888aa', fontSize: '13px', lineHeight: 1.6, flexGrow: 1 },
  borrowSection: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' },
  daysRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  daysLabel: { color: '#aaaacc', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  daysOptions: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  dayChip: { padding: '5px 10px', backgroundColor: '#232640', color: '#aaaacc', border: '1px solid #3a3d5a', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  dayChipActive: { backgroundColor: '#2a2e1a', color: '#f0c040', borderColor: '#f0c040' },
  daysInput: { padding: '5px 8px', backgroundColor: '#232640', border: '1px solid #3a3d5a', borderRadius: '6px', color: '#eaeaea', fontSize: '12px', outline: 'none', width: '65px' },
  borrowBtn: { padding: '11px', backgroundColor: '#f0c040', color: '#0f1117', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', transition: 'opacity 0.2s' }
};

export default Home;