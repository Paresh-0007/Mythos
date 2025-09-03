import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Characters from './pages/Characters';
import WorldBuilder from './pages/WorldBuilder';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {isAuthenticated && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/editor/:projectId" element={<Editor />} />
                <Route path="/characters/:projectId" element={<Characters />} />
                <Route path="/world/:projectId" element={<WorldBuilder />} />
              </>
            )}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;