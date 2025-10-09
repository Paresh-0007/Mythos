import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Characters from "./pages/Characters";
import WorldBuilder from "./pages/WorldBuilder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/editor/:projectId" 
              element={isAuthenticated ? <Editor /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/characters/:projectId" 
              element={isAuthenticated ? <Characters /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/world/:projectId" 
              element={isAuthenticated ? <WorldBuilder /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
