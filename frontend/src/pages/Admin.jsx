import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MapPin, LogOut, Trash2, Download } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUrl';

const Admin = () => {
  const [pgs, setPgs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('pgs');
  const navigate = useNavigate();

  const publicInquiries = inquiries.filter(inq => inq.consentToPublish === true || inq.consentToPublish === 1);
  const primeInquiries = inquiries.filter(inq => inq.consentToPublish === false || inq.consentToPublish === 0);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleExport = () => {
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/admin/export-pgs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pghub_properties.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(err => alert('Failed to export data: ' + err.message));
  };

  const fetchPGs = (token) => {
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { handleLogout(); throw new Error('Unauthorized'); }
        return res.json();
      })
      .then(data => setPgs(data))
      .catch(err => console.error(err));
  };

  const fetchInquiries = (token) => {
    fetch(`${import.meta.env.VITE_API_BASE}/inquiries/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setInquiries(data))
      .catch(err => console.error(err));
  };

  const fetchItems = (token) => {
    fetch(`${import.meta.env.VITE_API_BASE}/items/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  };

  const fetchReviews = (token) => {
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/admin/reviews`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPGs(token);
    fetchInquiries(token);
    fetchItems(token);
    fetchReviews(token);
  }, [navigate]);

  const handleStatusChange = (id, newStatus) => {
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => {
        setPgs(pgs.map(pg => pg._id === id ? { ...pg, status: newStatus } : pg));
      })
      .catch(err => console.error(err));
  };

  const handleDeletePG = (id) => {
    if (!window.confirm("Are you sure you want to delete this PG?")) return;
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setPgs(pgs.filter(pg => pg._id !== id)))
      .catch(err => console.error(err));
  };

  const handleDeleteItem = (id) => {
    if (!window.confirm("Are you sure you want to delete this Marketplace Item?")) return;
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setItems(items.filter(item => item._id !== id)))
      .catch(err => console.error(err));
  };

  const handleDeleteInquiry = (id) => {
    if (!window.confirm("Are you sure you want to delete this Inquiry?")) return;
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/inquiries/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setInquiries(inquiries.filter(inq => inq._id !== id)))
      .catch(err => console.error(err));
  };

  const handleDeleteReview = (id) => {
    if (!window.confirm("Are you sure you want to delete this property review?")) return;
    const token = localStorage.getItem('adminToken');
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setReviews(reviews.filter(rev => rev.id !== id)))
      .catch(err => console.error(err));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-primary pl-4">Admin Hub</h1>
            <p className="text-gray-500 mt-2 ml-5 text-sm font-medium">Manage properties, students, and marketplace goods.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2.5 rounded-xl transition-colors border border-green-200"
            >
              <Download size={16} /> Export Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors border border-red-100"
            >
              <LogOut size={16} /> Logout Portal
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
          <button 
            className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === 'pgs' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pgs')}
          >
            PG LISTINGS ({pgs.length})
          </button>
          <button 
            className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === 'items' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('items')}
          >
            MARKETPLACE ({items.length})
          </button>
          <button 
            className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === 'inquiries' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('inquiries')}
          >
            STUDENT INQUIRIES & FLATMATES ({publicInquiries.length})
          </button>
          <button 
            className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === 'prime' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('prime')}
          >
            PRIME REQUIREMENTS ({primeInquiries.length})
          </button>
          <button 
            className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reviews')}
          >
            PROPERTY REVIEWS ({reviews.length})
          </button>
        </div>

        {/* Content PGs */}
        {activeTab === 'pgs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rent / Config</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pgs.map(pg => (
                    <tr key={pg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-lg object-cover" src={pg.images[0] ? getFullImageUrl(pg.images[0]) : 'https://via.placeholder.com/40'} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{pg.name}</div>
                            <div className="text-xs font-bold text-primary mt-0.5">By: {pg.owner_name || 'Unknown Owner'}</div>
                            {pg.owner_email && <div className="text-xs text-gray-500 mt-0.5">{pg.owner_email}</div>}
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {pg.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold text-primary">₹{pg.rent}</div>
                        <div className="text-sm text-gray-500">{pg.gender} • {pg.roomType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${pg.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : pg.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : pg.status === 'Sold' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                          {pg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          {pg.status === 'Pending' && (
                            <>
                              <button onClick={() => handleStatusChange(pg._id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors">
                                <Check size={18} />
                              </button>
                              <button onClick={() => handleStatusChange(pg._id, 'Rejected')} className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition-colors">
                                <X size={18} />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeletePG(pg._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2 rounded-lg transition-colors ml-2" title="Delete Property">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pgs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No property listings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Items */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller Identity</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-lg object-cover" src={item.images[0] ? getFullImageUrl(item.images[0]) : 'https://via.placeholder.com/40'} alt="" />
                          <div className="ml-4 max-w-[200px]">
                            <div className="text-sm font-bold text-gray-900 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.category} • {item.condition}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-600">₹{item.price}</div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${item.status === 'Available' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                           {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{item.sellerId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{item.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2 rounded-lg transition-colors inline-flex justify-center items-center" title="Delete Item">
                           <Trash2 size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No marketplace items posted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicInquiries.map(inq => (
              <div key={inq._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                <button 
                  onClick={() => handleDeleteInquiry(inq._id)} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-lg"
                  title="Delete Inquiry"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex justify-between items-start mb-4 pr-10">
                  <h3 className="text-lg font-bold text-gray-900">{inq.studentName}</h3>
                </div>
                <div className="flex gap-2 mb-4">
                   <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded font-bold border border-primary/20">{inq.gender || 'Any'}</span>
                   <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded font-bold border border-blue-200">{inq.sharingType}</span>
                </div>
                <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="flex justify-between"><span className="font-bold text-gray-800">Phone:</span> <span>{inq.contactNumber}</span></p>
                  <p className="flex justify-between"><span className="font-bold text-gray-800">Budget:</span> <span className="text-green-600 font-bold">₹{inq.budget}</span></p>
                  <p className="flex justify-between"><span className="font-bold text-gray-800">Area:</span> <span>{inq.preferredArea}</span></p>
                </div>
                <p className="text-xs text-gray-400 mt-4 font-medium text-right">{new Date(inq.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {publicInquiries.length === 0 && (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500 font-medium">
                No public student inquiries yet.
              </div>
            )}
          </div>
        )}

        {/* Content Prime */}
        {activeTab === 'prime' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {primeInquiries.map(inq => (
              <div key={inq._id} className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow relative group">
                <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Prime</div>
                <button 
                  onClick={() => handleDeleteInquiry(inq._id)} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-lg"
                  title="Delete Requirement"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex justify-between items-start mb-4 pr-10">
                  <h3 className="text-lg font-bold text-gray-900">{inq.studentName}</h3>
                </div>
                <div className="flex gap-2 mb-4">
                   <span className="bg-white text-primary text-xs px-2.5 py-1 rounded font-bold border border-primary/20">{inq.gender || 'Any'}</span>
                   <span className="bg-white text-blue-700 text-xs px-2.5 py-1 rounded font-bold border border-blue-200">{inq.sharingType}</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700 bg-white p-4 rounded-xl border border-yellow-100">
                  <p className="flex justify-between"><span className="font-bold text-gray-900">Phone:</span> <span>{inq.contactNumber}</span></p>
                  <p className="flex justify-between"><span className="font-bold text-gray-900">Budget:</span> <span className="text-green-600 font-bold">₹{inq.budget}</span></p>
                  <p className="flex justify-between"><span className="font-bold text-gray-900">Area:</span> <span>{inq.preferredArea}</span></p>
                </div>
                <p className="text-xs text-gray-500 mt-4 font-medium text-right">{new Date(inq.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {primeInquiries.length === 0 && (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500 font-medium">
                No Prime requirements yet.
              </div>
            )}
          </div>
        )}

        {/* Content Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reviewer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating & Comment</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map(rev => (
                    <tr key={rev.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{rev.pgName}</div>
                        <div className="text-xs text-gray-500">ID: {rev.pgId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{rev.userName}</div>
                        <div className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 mb-1 text-yellow-400">
                          <span className="text-sm font-bold text-gray-900 mr-1">{rev.rating}</span>
                          ★
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">{rev.comment}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button onClick={() => handleDeleteReview(rev.id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2 rounded-lg transition-colors inline-flex justify-center items-center" title="Delete Review">
                           <Trash2 size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No reviews posted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
