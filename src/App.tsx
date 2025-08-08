import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
          <AnimatePresence mode="wait">
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
          </AnimatePresence>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;