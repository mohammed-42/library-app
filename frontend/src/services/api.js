import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001'
});

const BOOK_API = axios.create({
  baseURL: 'http://localhost:5002'
});

const RENTAL_API = axios.create({
  baseURL: 'http://localhost:5003'
});

// Attach token to every request
const addToken = (req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
};

API.interceptors.request.use(addToken);
BOOK_API.interceptors.request.use(addToken);
RENTAL_API.interceptors.request.use(addToken);

// Auto refresh token on 401
const refreshAndRetry = async (error, instance) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const res = await axios.post('http://localhost:5001/api/users/refresh', { refreshToken });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance(originalRequest);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

API.interceptors.response.use(res => res, err => refreshAndRetry(err, API));
BOOK_API.interceptors.response.use(res => res, err => refreshAndRetry(err, BOOK_API));
RENTAL_API.interceptors.response.use(res => res, err => refreshAndRetry(err, RENTAL_API));

export const registerUser = (data) => API.post('/api/users/register', data);
export const loginUser = (data) => API.post('/api/users/login', data);
export const logoutUser = (data) => API.post('/api/users/logout', data);

export const getAllBooks = (params) => BOOK_API.get('/api/books', { params });
export const getBookById = (id) => BOOK_API.get(`/api/books/${id}`);
export const addBook = (data) => BOOK_API.post('/api/books', data);
export const deleteBook = (id) => BOOK_API.delete(`/api/books/${id}`);

export const borrowBook = (data) => RENTAL_API.post('/api/rentals/borrow', data);
export const returnBook = (id) => RENTAL_API.put(`/api/rentals/return/${id}`);
export const getUserRentals = (userId) => RENTAL_API.get(`/api/rentals/user/${userId}`);
export const getAllRentals = () => RENTAL_API.get('/api/rentals');