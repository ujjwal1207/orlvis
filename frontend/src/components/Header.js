import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  User,
  LogOut,
  Upload,
  BarChart3,
  FileText,
  Menu,
  X
} from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = path => {
    return location.pathname === path
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='header'>
      <div className='header-container'>
        {/* Logo */}
        <Link to='/dashboard' className='header-logo'>
          <div className='logo-icon'>
            <FileText size={24} />
          </div>
          <span className='logo-text'>OralVis</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className='header-nav desktop-nav'>
          {user?.role === 'patient' ? (
            <>
              <Link
                to='/dashboard'
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                Dashboard
              </Link>
              <Link
                to='/upload'
                className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
              >
                <Upload size={18} />
                Upload
              </Link>
            </>
          ) : (
            <>
              <Link
                to='/dashboard'
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className='header-user'>
          <div className='user-info'>
            <span className='user-name'>{user?.name}</span>
            <span className='user-role'>{user?.role}</span>
          </div>

          <div className='user-menu'>
            <button className='user-menu-button'>
              <User size={20} />
            </button>

            <div className='user-menu-dropdown'>
              <Link to='/profile' className='dropdown-item'>
                <User size={16} />
                Profile
              </Link>
              <button onClick={handleLogout} className='dropdown-item'>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className='mobile-menu-button' onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className='mobile-nav'>
          {user?.role === 'patient' ? (
            <>
              <Link
                to='/dashboard'
                className={`mobile-nav-link ${
                  isActive('/dashboard') ? 'active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 size={18} />
                Dashboard
              </Link>
              <Link
                to='/upload'
                className={`mobile-nav-link ${
                  isActive('/upload') ? 'active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload size={18} />
                Upload
              </Link>
            </>
          ) : (
            <>
              <Link
                to='/dashboard'
                className={`mobile-nav-link ${
                  isActive('/dashboard') ? 'active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 size={18} />
                Dashboard
              </Link>
            </>
          )}

          <div className='mobile-nav-divider'></div>

          <Link
            to='/profile'
            className='mobile-nav-link'
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={18} />
            Profile
          </Link>

          <button
            onClick={() => {
              handleLogout()
              setIsMenuOpen(false)
            }}
            className='mobile-nav-link'
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      )}

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1.25rem;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: var(--primary-color);
          color: white;
          border-radius: var(--radius-md);
        }

        .logo-text {
          color: var(--primary-color);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--primary-color);
          background-color: var(--bg-tertiary);
        }

        .nav-link.active {
          color: var(--primary-color);
          background-color: rgb(44 90 160 / 0.1);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-menu-button:hover {
          background-color: var(--primary-color);
          color: white;
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          min-width: 160px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .user-menu:hover .user-menu-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          border: none;
          background: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: var(--bg-tertiary);
        }

        .dropdown-item:first-child {
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }

        .dropdown-item:last-child {
          border-radius: 0 0 var(--radius-md) var(--radius-md);
        }

        .mobile-menu-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-nav {
          display: none;
          flex-direction: column;
          background-color: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          padding: 1rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 500;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          border-radius: var(--radius-md);
          transition: background-color 0.2s ease;
        }

        .mobile-nav-link:hover {
          background-color: var(--bg-tertiary);
        }

        .mobile-nav-link.active {
          color: var(--primary-color);
          background-color: rgb(44 90 160 / 0.1);
        }

        .mobile-nav-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.5rem 0;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .user-info {
            display: none;
          }

          .mobile-menu-button {
            display: flex;
          }

          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </header>
  )
}

export default Header
