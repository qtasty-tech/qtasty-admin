import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DashboardLayout from './layouts/DashboardLayout';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import RestaurantsPage from './pages/RestaurantsPage';
import NotificationPage from './pages/NotificationPage';



function App() {


  return (
    <Router>
      <Navbar />
      <Routes>
      
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="newsletter" element={<NotificationPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
