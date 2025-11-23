import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Homescreen from './screens/Homescreen';
import RoomDetails from './screens/RoomDetails';
import LoginSignupScreen from './screens/LoginSignupScreen';
import HowItWorks from './screens/HowItWorks';
import Contact from './components/Contact';
import PaymentSuccess from './screens/PaymentSuccess';
import StripePaymentSuccess from './screens/StripePaymentSuccess';
import ProfileScreen from './screens/ProfileScreen';
import ProfileEdit from './components/ProfileEdit';
import AdminScreen from './screens/AdminScreen';
import Loading from './components/Loading';
import AboutPage from './screens/AboutPage';
// import ReviewForm from './components/ReviewForm';
import { useEffect } from 'react';

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/LoginSignupScreen'; 

  return (
    <div className="App">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Homescreen />} />
        <Route path="/stripe-payment-success" element={<StripePaymentSuccess />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/details/:roomid/:fromdate/:todate" element={<RoomDetails />} />
        <Route path="/room/:roomid" element={<RoomDetails />} />
        <Route path="/LoginSignupScreen" element={<LoginSignupScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      
      {/* Remove Footer from here since we only want it on the homepage */}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
