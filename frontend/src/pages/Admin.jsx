import { useState, useEffect } from 'react';
import { getAllBooks, addBook, deleteBook, getAllRentals } from '../services/api';

function Admin() {
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', genre: '', description: '', totalCopies: 1 });
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('books');

  useEffect(() => { fetchBooks(); fetchRentals(); }, []);

  const fetchBooks = async () => { const res = await getAllBooks(); setBooks(res.data); };
  const fetchRentals = async () => { const res = await getAllRentals(); setRentals(res.data); };

  const handleAddBook = async () => {
    try {
      await addBook(form);
      setMessage('Book added successfully!');
      setForm({ title: '', author: '', genre: '', description: '', totalCopies: 1 });
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteBook(id); fetchBooks(); } catch (err) { console.error(err); }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Admin Panel</h2>
        <p style={s.subtitle}>Manage books and monitor rentals</p>
      </div>

      <div style={s.content}>
        {message && <div style={s.toast}>✅ {message}</div>}

        <div style={s.statsRow}>
          <div style={s.stat}><span style={s.statNum}>{books.length}</span><span style={s.statLabel}>Total Books</span></div>
          <div style={s.stat}><span style={s.statNum}>{rentals.filter(r => r.status === 'borrowed').length}</span><span style={s.statLabel}>Active Rentals</span></div>
          <div style={s.stat}><span style={s.statNum}>{rentals.length}</span><span style={s.statLabel}>Total Rentals</span></div>
        </div>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'books' ? s.activeTab : {}) }} onClick={() => setTab('books')}>📚 Manage Books</button>
          <button style={{ ...s.tab, ...(tab === 'add' ? s.activeTab : {}) }} onClick={() => setTab('add')}>➕ Add Book</button>
          <button style={{ ...s.tab, ...(tab === 'rentals' ? s.activeTab : {}) }} onClick={() => setTab('rentals')}>📋 All Rentals</button>
        </div>

        {tab === 'add' && (
          <div style={s.formCard}>
            <h3 style={s.cardTitle}>Add New Book</h3>
            <div style={s.formGrid}>
              <div style={s.field}><label style={s.label}>Title</label><input style={s.input} placeholder="Book title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div style={s.field}><label style={s.label}>Author</label><input style={s.input} placeholder="Author name" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div style={s.field}><label style={s.label}>Genre</label><input style={s.input} placeholder="Fiction, Science..." value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} /></div>
              <div style={s.field}><label style={s.label}>Total Copies</label><input style={s.input} type="number" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} /></div>
              <div style={{ ...s.field, gridColumn: 'span 2' }}><label style={s.label}>Description</label><input style={s.input} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <button style={s.addBtn} onClick={handleAddBook}>Add Book</button>
          </div>
        )}

        {tab === 'books' && (
          <div style={s.tableCard}>
            <h3 style={s.cardTitle}>All Books ({books.length})</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Title', 'Author', 'Genre', 'Available', 'Action'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id} style={s.tr}>
                    <td style={s.td}><strong>{book.title}</strong></td>
                    <td style={{ ...s.td, color: '#f0c040' }}>{book.author}</td>
                    <td style={s.td}><span style={s.genreBadge}>{book.genre}</span></td>
                    <td style={s.td}><span style={{ color: book.availableCopies > 0 ? '#2ecc71' : '#e74c3c' }}>{book.availableCopies}/{book.totalCopies}</span></td>
                    <td style={s.td}><button style={s.deleteBtn} onClick={() => handleDelete(book._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'rentals' && (
          <div style={s.tableCard}>
            <h3 style={s.cardTitle}>All Rentals ({rentals.length})</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Book', 'User', 'Borrowed On', 'Due Date', 'Status'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rentals.map(rental => (
                  <tr key={rental._id} style={s.tr}>
                    <td style={s.td}><strong>{rental.bookTitle}</strong></td>
                    <td style={{ ...s.td, color: '#f0c040' }}>{rental.userName}</td>
                    <td style={s.td}>{new Date(rental.borrowedAt).toDateString()}</td>
                    <td style={s.td}>{new Date(rental.dueDate).toDateString()}</td>
                    <td style={s.td}><span style={{ ...s.statusBadge, background: rental.status === 'borrowed' ? '#1e2a1e' : '#1a1d2e', color: rental.status === 'borrowed' ? '#2ecc71' : '#8888aa', border: `1px solid ${rental.status === 'borrowed' ? '#2ecc71' : '#3a3d5a'}` }}>{rental.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  statsRow: { display: 'flex', gap: '20px', marginBottom: '32px' },
  stat: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#f0c040' },
  statLabel: { color: '#8888aa', fontSize: '13px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '10px 20px', backgroundColor: '#1a1d2e', color: '#8888aa', border: '1px solid #2a2d4a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  activeTab: { backgroundColor: '#f0c040', color: '#0f1117', borderColor: '#f0c040' },
  formCard: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '28px' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#eaeaea', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#aaaacc', fontSize: '12px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { padding: '11px 14px', backgroundColor: '#232640', border: '1px solid #3a3d5a', borderRadius: '8px', color: '#eaeaea', fontSize: '14px', outline: 'none' },
  addBtn: { padding: '12px 28px', backgroundColor: '#f0c040', color: '#0f1117', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  tableCard: { background: '#1a1d2e', border: '1px solid #2a2d4a', borderRadius: '12px', padding: '28px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', color: '#8888aa', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid #2a2d4a' },
  tr: { borderBottom: '1px solid #1e2130' },
  td: { padding: '14px 16px', color: '#eaeaea', fontSize: '14px' },
  genreBadge: { background: '#232640', color: '#aaaacc', fontSize: '11px', padding: '3px 10px', borderRadius: '20px' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px' },
  deleteBtn: { padding: '6px 14px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }
};

export default Admin;