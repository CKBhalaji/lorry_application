import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Navbar from './Pages/Navbar';
import Footer from './Pages/Footer';
import Login from './components/auth/Login';
import Login_old from './components/auth/Login_old';
import AdminLogin from './components/auth/AdminLogin';
import SignUpDriver from './components/auth/SignUpDriver';
import SignUpGoodsOwner from './components/auth/SignUpGoodsOwner';
import DriverDashboard from './components/driver/DriverDashboard';
import GoodsOwnerDashboard from './components/goods-owner/GODashboard';
import AdminDashboard from './components/admin/Admin_Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import AboutUs from './components/common/AboutUs';
import Contact from './components/common/Contact';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import TermsOfService from './components/common/TermsOfService';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="app">
          {/* <Navbar userType={userType} username={username} /> */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login-old" element={<Login_old />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/signup-driver" element={<SignUpDriver />} />
              <Route path="/signup-goods-owner" element={<SignUpGoodsOwner />} />
              <Route path="/driver/*" element={<ProtectedRoute allowedUserTypes={['driver']} />}> 
                <Route path="dashboard" element={<DriverDashboard />} />
                <Route path="" element={<DriverDashboard />} />
              </Route>
              <Route path="/goods-owner/*" element={<ProtectedRoute allowedUserTypes={['goodsOwner']} />}> 
                <Route path="dashboard" element={<GoodsOwnerDashboard />} />
                <Route path="" element={<GoodsOwnerDashboard />} />
              </Route>
              <Route path="/admin/*" element={<ProtectedRoute allowedUserTypes={['admin']} />}> 
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="" element={<AdminDashboard />} />
              </Route>
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// return (
//   <div>
//     {/* Your component logic using userType */}
//   </div>
// );
// }

