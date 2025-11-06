
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          SlotSwapper
        </Link>
        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">
              My Events
            </Link>
            <Link to="/marketplace" className="navbar-link">
              Marketplace
            </Link>
            <Link to="/requests" className="navbar-link">
              Requests
            </Link>
            <div className="navbar-user">
              <span>{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;