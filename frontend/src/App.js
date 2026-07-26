import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Foro from './components/Foro';
import MaterialEstudio from './components/MaterialEstudio';

import Informes from './components/Informes';
import Enlaces from './components/Enlaces';
import Cronograma from './components/Cronograma';
import SubNavbar from './components/SubNavbar';

import 'bootstrap/dist/css/bootstrap.min.css';

// Componente Layout para páginas con SubNavbar
// function Layout({ children, user, onLogout }) {

function Layout({ children}) {
  return (
    <>
      <SubNavbar />
      {children}
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/foro" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/foro" 
          element={
            isAuthenticated ? 
            <Layout user={user} onLogout={handleLogout}>
              <Foro user={user} onLogout={handleLogout} />
            </Layout>:
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/material-estudio" 
          element={
            isAuthenticated ?
            <Layout user={user} onLogout={handleLogout}>
              <MaterialEstudio user={user} onLogout={handleLogout} />
            </Layout>: 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/informes" 
          element={
            isAuthenticated ? 
            <Layout user={user} onLogout={handleLogout}>
              <Informes user={user} onLogout={handleLogout} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/enlaces" 
          element={
            isAuthenticated ? 
            <Layout user={user} onLogout={handleLogout}>
              <Enlaces user={user} onLogout={handleLogout} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/cronograma" 
          element={
            isAuthenticated ? 
            <Layout user={user} onLogout={handleLogout}>
              <Cronograma user={user} onLogout={handleLogout} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        /> 
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;