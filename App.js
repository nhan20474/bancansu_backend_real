import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import ProfileForm from './components/ProfileForm';
// Import các components khác

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/profile" element={<ProfileForm />} />
            {/* Thêm các routes khác của ứng dụng */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
