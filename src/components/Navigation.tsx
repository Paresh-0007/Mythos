import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Globe, 
  PenTool, 
  Home,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type NavigationProps = {
  isCollapsed?: boolean;
  onToggle?: () => void;  // <-- optional
};

const Navigation = ({ isCollapsed = false, onToggle }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const currentProjectId = location.pathname.split('/')[2];

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: `/editor/${currentProjectId}`, icon: PenTool, label: 'Editor', disabled: !currentProjectId },
    { path: `/characters/${currentProjectId}`, icon: Users, label: 'Characters', disabled: !currentProjectId },
    { path: `/world/${currentProjectId}`, icon: Globe, label: 'World', disabled: !currentProjectId },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-blue-600">
                Mythos
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.disabled ? '#' : item.path}
                className={`flex items-center gap-3 p-3 rounded transition-all ${
                  item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;