import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRentals from './pages/MyRentals';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;