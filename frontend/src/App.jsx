import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import { NotificationProvider } from './components/NotificationContext';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import DashboardHome from './pages/DashboardHome';
import UsersList from './pages/UsersList';
import AuditLogs from './pages/AuditLogs';
import DocumentsList from './pages/DocumentsList';
import DocumentDetail from './pages/DocumentDetail';
import ChatWorkspace from './pages/ChatWorkspace';

// Import Fonts
import '@fontsource/outfit';
import '@fontsource/inter';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard/documents" element={<DocumentsList />} />
                  <Route path="/dashboard/documents/:id" element={<DocumentDetail />} />
                  <Route path="/dashboard/chat" element={<ChatWorkspace />} />
                  
                  {/* Admin Only Route */}
                  <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                    <Route path="/dashboard/users" element={<UsersList />} />
                  </Route>
                  
                  {/* Admin and Manager Only Route */}
                  <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']} />}>
                    <Route path="/dashboard/audit" element={<AuditLogs />} />
                  </Route>
                </Route>
              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
