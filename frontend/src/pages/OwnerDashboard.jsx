import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Plus, LogOut, ChartBar } from 'lucide-react';
import PGCard from '../components/PGCard';

const OwnerDashboard = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const ownerToken = localStorage.getItem('ownerToken');
  const ownerData = JSON.parse(localStorage.getItem('ownerData') || '{}');

  useEffect(() => {
    if (!ownerToken) {
      navigate('/owner/login');
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE}/owner/my-pgs`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setPgs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [ownerToken, navigate]);

  const handleMarkAsSold = async (id) => {
    if (!window.confirm("Are you sure you want to mark this property as Sold? It will be removed from public listings.")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}/sold`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${ownerToken}` }
      });
      if (res.ok) {
        setPgs(pgs.map(pg => pg._id === id ? { ...pg, status: 'Sold' } : pg));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('ownerData');
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-[90vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-indigo-600 pl-4">Welcome, {ownerData.name}</h1>
            <p className="text-gray-500 mt-2 ml-5">Manage your property listings directly from the Owner Portal.</p>
          </div>
          <div className="flex gap-4">
             <Link to="/add-pg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
                <Plus size={20}/> Post New Property
             </Link>
             <button onClick={handleLogout} className="border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2">
                <LogOut size={20}/> Logout
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
             <div className="bg-indigo-100 p-4 rounded-xl"><Building size={24} className="text-indigo-600"/></div>
             <div>
                <p className="text-gray-500 font-bold uppercase text-xs">Total Properties</p>
                <p className="text-3xl font-extrabold text-gray-900">{pgs.length}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
             <div className="bg-green-100 p-4 rounded-xl"><ChartBar size={24} className="text-green-600"/></div>
             <div>
                <p className="text-gray-500 font-bold uppercase text-xs">Approved Listings</p>
                <p className="text-3xl font-extrabold text-gray-900">{pgs.filter(p => p.status === 'Approved').length}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
             <div className="bg-yellow-100 p-4 rounded-xl"><ChartBar size={24} className="text-yellow-600"/></div>
             <div>
                <p className="text-gray-500 font-bold uppercase text-xs">Pending Review</p>
                <p className="text-3xl font-extrabold text-gray-900">{pgs.filter(p => p.status === 'Pending').length}</p>
             </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Properties</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : pgs.length > 0 ? (
          <div className="flex flex-col space-y-6 max-w-4xl">
            {pgs.map(pg => (
              <div key={pg._id} className="relative">
                 {/* Visual Badge for Status */}
                 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                       pg.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : 
                       pg.status === 'Repealed' || pg.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' : 
                       pg.status === 'Sold' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                       {pg.status}
                    </span>
                    {pg.status === 'Approved' && (
                       <button onClick={() => handleMarkAsSold(pg._id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-sm transition-colors">
                          Mark as Sold
                       </button>
                    )}
                 </div>
                 <PGCard pg={pg} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm max-w-4xl">
            <Building size={48} className="mx-auto text-indigo-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Listed</h3>
            <p className="text-gray-500 mb-6 font-medium">You haven't uploaded any PG accommodations to the network yet.</p>
            <Link to="/add-pg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors inline-block">
              Listing Form
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
