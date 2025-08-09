import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Globe, 
  PenTool, 
  Home,
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavigationProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isCollapsed = false, onToggle }) => {
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
    <motion.nav 
      className={`h-screen bg-white/70 backdrop-blur-lg border-r border-primary-200/50 shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-primary-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              >
                Mythos
              </motion.span>
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
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-primary-200/50">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium text-gray-700 truncate"
                >
                  {user?.name}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500 truncate"
                >
                  {user?.email}
                </motion.p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;