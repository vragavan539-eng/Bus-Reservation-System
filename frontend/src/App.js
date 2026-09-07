import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrackBusPage from './pages/TrackBusPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminBuses from './pages/AdminBuses';
import AdminRoutes from './pages/AdminRoutes';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';

const WithLayout = ({ children }) => <><Navbar/>{children}<Footer/></>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style:{ background:'#1e2d50',color:'#f1f5f9',border:'1px solid rgba(249,115,22,0.3)' }}}/>
        <Routes>
          <Route path="/" element={<WithLayout><HomePage/></WithLayout>}/>
          <Route path="/search" element={<WithLayout><SearchPage/></WithLayout>}/>
          <Route path="/track" element={<WithLayout><TrackBusPage/></WithLayout>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/booking/:routeId" element={<PrivateRoute><WithLayout><BookingPage/></WithLayout></PrivateRoute>}/>
          <Route path="/booking/confirm/:id" element={<PrivateRoute><WithLayout><BookingConfirmPage/></WithLayout></PrivateRoute>}/>
          <Route path="/my-bookings" element={<PrivateRoute><WithLayout><MyBookingsPage/></WithLayout></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><WithLayout><ProfilePage/></WithLayout></PrivateRoute>}/>
          <Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
          <Route path="/admin/buses" element={<AdminRoute><AdminBuses/></AdminRoute>}/>
          <Route path="/admin/routes" element={<AdminRoute><AdminRoutes/></AdminRoute>}/>
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings/></AdminRoute>}/>
          <Route path="/admin/users" element={<AdminRoute><AdminUsers/></AdminRoute>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;