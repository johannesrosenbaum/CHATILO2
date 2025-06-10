import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

interface HeaderProps {
  onMenuToggle: () => void;
  locationName: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null; // CHANGE to accept null
  } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, locationName, user, onLogout }) => {
  const { socket } = useSocket();
  
  console.log('🔄 Header rendered with:', { locationName, user: user?.username });

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/chat">Chatilo</Link>
        </div>
        <div className="location-name">{locationName || 'Standort wird ermittelt...'}</div>
        <div className="user-info">
          {user ? (
            <div className="user-details">
              <span className="username">{user.username}</span>
              <button className="logout-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
        <button className="menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;