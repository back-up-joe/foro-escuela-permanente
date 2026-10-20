import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Foro from './components/Foro';
import MaterialEstudio from './components/MaterialEstudio';
import Informes from './components/Informes';
import Enlaces from './components/Enlaces';
import Cronograma from './components/Cronograma';
import SubNavbar from './components/SubNavbar';
import ChatBot from './components/ChatBot';
import 'bootstrap/dist/css/bootstrap.min.css';

function Layout({ children, user, onLogout, nivelActual, setNivelActual }) {
  return (
    <>
      <SubNavbar />
      {children}
      <ChatBot user={user} />
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [nivelActual, setNivelActual] = useState(1);

  // ✅ Función auxiliar para determinar el nivel inicial
  const getNivelInicial = (userData) => {
    if (!userData || !userData.perfil) return 1;
    
    if (userData.perfil.tipo_acceso === 'tipo2') {
      return 2;
    }
    return 1;
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setIsAuthenticated(true);
      setUser(parsedUser);
      setNivelActual(getNivelInicial(parsedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setNivelActual(getNivelInicial(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
    setNivelActual(1);
  };

  // Props compartidas
  const commonProps = {
    user,
    onLogout: handleLogout,
    nivelActual,
    setNivelActual,
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
            <Layout {...commonProps}>
              <Foro {...commonProps} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/material-estudio" 
          element={
            isAuthenticated ? 
            <Layout {...commonProps}>
              <MaterialEstudio {...commonProps} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/informes" 
          element={
            isAuthenticated ? 
            <Layout {...commonProps}>
              <Informes {...commonProps} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/enlaces" 
          element={
            isAuthenticated ? 
            <Layout {...commonProps}>
              <Enlaces {...commonProps} />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/cronograma" 
          element={
            isAuthenticated ? 
            <Layout {...commonProps}>
              <Cronograma {...commonProps} />
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