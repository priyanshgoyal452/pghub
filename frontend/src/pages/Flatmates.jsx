import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, MapPin, IndianRupee, Clock, ArrowRight, Filter, Trash2, Phone } from 'lucide-react';

const initialDummies = [
  { _id: '1', studentName: 'Rohan Sharma', contactNumber: '+91 9988776655', budget: 12000, preferredArea: 'North Campus', sharingType: 'Shared', gender: 'Boys', createdAt: new Date().toISOString() },
  { _id: '2', studentName: 'Priya Patel', contactNumber: '+91 8877665544', budget: 18000, preferredArea: 'Koramangala', sharingType: 'Single', gender: 'Girls', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '3', studentName: 'Aman Gupta', contactNumber: '+91 7766554433', budget: 10000, preferredArea: 'Sector 62', sharingType: 'Shared', gender: 'Boys', createdAt: new Date(Date.now() - 172800000).toISOString() }
];

const Flatmates = () => {
  const [inquiries, setInquiries] = useState([]);
  const [baseInquiries, setBaseInquiries] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [genderFilter, setGenderFilter] = useState(searchParams.get('gender') || '');
  const [sharingFilter, setSharingFilter] = useState(searchParams.get('sharingType') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  
  const studentData = JSON.parse(localStorage.getItem('studentData') || 'null');
  const studentId = studentData?.id || studentData?._id;
  const token = localStorage.getItem('studentToken');

  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this requirement?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setBaseInquiries(prev => prev.filter(i => i._id !== id));
        setInquiries(prev => prev.filter(i => i._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting requirement');
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/inquiries/public`)
      .then(res => res.json())
      .then(data => {
        setBaseInquiries(data);
        setInquiries(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let result = [...baseInquiries];
    const newParams = new URLSearchParams();

    if (genderFilter) {
      result = result.filter(r => r.gender === genderFilter);
      newParams.append('gender', genderFilter);
    }
    if (sharingFilter) {
      result = result.filter(r => r.sharingType === sharingFilter);
      newParams.append('sharingType', sharingFilter);
    }
    if (locationFilter) {
      result = result.filter(r => r.preferredArea && r.preferredArea.toLowerCase().includes(locationFilter.toLowerCase()));
      newParams.append('location', locationFilter);
    }
    
    setInquiries(result);
    setSearchParams(newParams, { replace: true });
  }, [genderFilter, sharingFilter, locationFilter, baseInquiries]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-primary pl-4">Find Flatmates</h1>
               <p className="text-gray-500 mt-2 pl-4 text-base font-medium">Connect with students looking for accommodation in your area.</p>
            </div>
            <button onClick={() => navigate('/inquiry')} className="bg-accent text-gray-900 text-sm font-extrabold px-6 py-3 rounded-xl hover:bg-[#e0a218] transition-colors shadow-sm flex items-center gap-2">
                Post Your Requirement <ArrowRight size={16} />
            </button>
         </div>

         {/* Filters Box */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex items-center gap-2 text-gray-600 font-bold lg:border-r border-gray-100 pr-4 mr-2">
               <Filter size={20} className="text-primary"/> Filters
            </div>

            <input 
              type="text"
              placeholder="Search Area / Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full lg:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white font-medium text-gray-700"
            />

            <select 
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white font-medium text-gray-700"
            >
              <option value="">Any Gender</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Co-ed">Co-ed</option>
            </select>
            
            <select 
              value={sharingFilter}
              onChange={(e) => setSharingFilter(e.target.value)}
              className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white font-medium text-gray-700"
            >
              <option value="">Any Sharing Type</option>
              <option value="Single">Single Room</option>
              <option value="Shared">Shared Room</option>
            </select>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inquiries.map(inq => (
              <div key={inq._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                 <div className="p-6 flex-grow">
                    <div className="flex items-center gap-4 mb-5">
                       <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-primary border-2 border-primary/10">
                          <User size={24} />
                       </div>
                       <div>
                          <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{inq.studentName}</h3>
                          <div className="flex gap-2 mt-1">
                              <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded tracking-wide uppercase">
                                 {inq.gender || 'Any'}
                              </span>
                              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded tracking-wide uppercase">
                                 {inq.sharingType}
                              </span>
                          </div>
                       </div>
                       {studentId && inq.studentId == studentId && (
                           <button 
                             onClick={() => handleDelete(inq._id)} 
                             className="ml-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                             title="Delete Requirement"
                           >
                              <Trash2 size={20} />
                           </button>
                       )}
                    </div>
                    
                    <div className="space-y-4 mb-6 text-sm">
                       <div className="flex items-center gap-3 text-gray-600 font-medium">
                          <MapPin size={18} className="text-gray-400" />
                          <span>Prefers: <span className="text-gray-900 font-bold">{inq.preferredArea}</span></span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-600 font-medium">
                          <IndianRupee size={18} className="text-gray-400" />
                          <span>Budget: <span className="text-gray-900 font-extrabold">₹{inq.budget}</span>/mo</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-600 font-medium">
                          <Phone size={18} className="text-gray-400" />
                          <span>Contact: <span className="text-gray-900 font-bold">{inq.contactNumber}</span></span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-600 font-medium">
                          <Clock size={18} className="text-gray-400" />
                          <span>Posted: {new Date(inq.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 border-t border-gray-100 p-4 flex gap-2">
                    <a href={`tel:${inq.contactNumber}`} className="flex-1 block text-center bg-white border border-gray-200 text-gray-800 font-bold py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors cursor-pointer">
                       Call
                    </a>
                    <button onClick={() => {
                        let cleanPhone = inq.contactNumber.replace(/\D/g, '');
                        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
                        const msg = encodeURIComponent(`Hi ${inq.studentName.split(' ')[0]}, I saw your flatmate requirement for ${inq.preferredArea} on PGhub.`);
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                    }} className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-1 font-bold py-2.5 rounded-lg transition-colors cursor-pointer text-sm">
                       WhatsApp
                    </button>
                 </div>
              </div>
            ))}
            
            {inquiries.length === 0 && (
                <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500 font-medium">
                    No flatmates found for the selected filters.
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Flatmates;
