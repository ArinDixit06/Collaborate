import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/userActions';
import { 
  FaTachometerAlt, 
  FaFolder, 
  FaUsers, 
  FaTasks, 
  FaCog, 
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTh
} from 'react-icons/fa';

const Sidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    onCollapseChange(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-item active' : 'nav-item';
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        <FaTh className="logo-icon" />
        <h1 className="logo-text">UniSync</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={getNavLinkClass}>
          <FaTachometerAlt className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </NavLink>
        <NavLink to="/projects/ongoing" className={getNavLinkClass}>
          <FaFolder className="nav-icon" />
          <span className="nav-text">Projects</span>
        </NavLink>
        <NavLink to="/teams" className={getNavLinkClass}>
          <FaUsers className="nav-icon" />
          <span className="nav-text">Teams</span>
        </NavLink>
        <NavLink to="/tasks" className={getNavLinkClass}>
          <FaTasks className="nav-icon" />
          <span className="nav-text">My Tasks</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {userInfo && (
          <div className="user-profile">
            <div className="user-avatar">{userInfo.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{userInfo.name}</span>
              <span className="user-email">{userInfo.email}</span>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={logoutHandler}>
          <FaSignOutAlt className="nav-icon" />
          <span className="nav-text">Logout</span>
        </button>
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <FaChevronRight className="nav-icon" /> : <FaChevronLeft className="nav-icon" />}
          <span className="nav-text">Collapse</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
