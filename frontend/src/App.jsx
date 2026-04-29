import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import PGListings from './pages/PGListings';
import PGDetail from './pages/PGDetail';
import AddPG from './pages/AddPG';
import Admin from './pages/Admin';
import Inquiry from './pages/Inquiry';
import Flatmates from './pages/Flatmates';

import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import SavedPGs from './pages/SavedPGs';

import OwnerLogin from './pages/OwnerLogin';
import OwnerRegister from './pages/OwnerRegister';
import OwnerDashboard from './pages/OwnerDashboard';

import Marketplace from './pages/Marketplace';
import AddItem from './pages/AddItem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="pgs" element={<PGListings />} />
          <Route path="pgs/:id" element={<PGDetail />} />
          <Route path="add-pg" element={<AddPG />} />
          <Route path="inquiry" element={<Inquiry />} />
          <Route path="flatmates" element={<Flatmates />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="saved" element={<SavedPGs />} />
          <Route path="owner/login" element={<OwnerLogin />} />
          <Route path="owner/register" element={<OwnerRegister />} />
          <Route path="owner/dashboard" element={<OwnerDashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="add-item" element={<AddItem />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
