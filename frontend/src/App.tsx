import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Verify } from './pages/Verify';
import { Dashboard } from './pages/Dashboard';
import { Appointments } from './pages/Appointments';
import { Articles } from './pages/Articles';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Therapists } from './pages/Therapists';
import { Availability } from './pages/Availability';
import { MainLayout } from './components/Layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Navigate to="/dashboard" replace />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/articles"
          element={
            <ProtectedRoute>
              <Articles />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/therapists"
          element={
            <ProtectedRoute>
              <Therapists />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;



