import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/products': return 'Products';
      case '/sales': return 'Sales';
      case '/suppliers': return 'Suppliers';
      case '/invoices': return 'Invoices';
      case '/analytics': return 'Analytics';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
        
        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.displayName || user?.email || 'User'}</span>
              <span className="user-role">Business Owner</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;