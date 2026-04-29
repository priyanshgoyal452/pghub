import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, Home, Users, ArrowRight, Shield, Clock, ThumbsUp } from 'lucide-react';

import { mockPGs } from '../data/mockData';

const HomePage = () => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [gender, setGender] = useState('');
  const [activeTab, setActiveTab] = useState('PG / Hostel');
  const [featuredPGs, setFeaturedPGs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/pgs`)
      .then(res => res.json())
      .then(data => setFeaturedPGs(data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (budget) params.append('budget', budget);
    if (gender) params.append('gender', gender);
    
    if (activeTab === 'Flatmates') {
      navigate(`/flatmates?${params.toString()}`);
    } else {
      navigate(`/pgs?${params.toString()}`);
    }
  };

  const tabs = [
    { name: 'PG / Hostel', icon: <Building size={16} /> },
    { name: 'Flatmates', icon: <Users size={16} /> },
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-28 md:pt-24 md:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* MagicBricks Red Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-[65%] md:h-[75%] bg-gradient-to-r from-[#d8232a] to-[#e42b32] z-0"></div>
        {/* Subtle patterned overlay */}
        <div className="absolute top-0 left-0 w-full h-[65%] md:h-[75%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <div className="text-center mb-10 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Properties to Buy, Rent & PG
            </h1>
            <p className="text-lg md:text-xl text-white/95 font-medium max-w-2xl mx-auto">
              Welcome to India's fastest growing property portal for students.
            </p>
          </div>

          {/* Master Search Box */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-visible border border-gray-100">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-2 sm:px-6">
              {tabs.map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-[3px] transition-all whitespace-nowrap ${
                    activeTab === tab.name 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-600 hover:text-primary hover:bg-gray-50/50'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-b-xl relative z-20">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
                {/* Location Input */}
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={22} className="text-primary group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={`Enter City, Locality or College for ${activeTab}...`}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder-gray-400 text-lg shadow-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-[45%]">
                  {/* Budget Dropdown */}
                  <div className="flex-1 relative shadow-sm rounded-lg hover:shadow transition-shadow">
                    <select
                      className="w-full pl-4 pr-10 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium appearance-none cursor-pointer text-base"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      <option value="" className="text-gray-500">Budget</option>
                      <option value="5000">Up to ₹5,000</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="20000">Up to ₹20,000</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  {/* Gender Dropdown */}
                  <div className="flex-1 relative shadow-sm rounded-lg hover:shadow transition-shadow">
                    <select
                      className="w-full pl-4 pr-10 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium appearance-none cursor-pointer text-base"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Tenant Type</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="Co-ed">Co-ed</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-[#b91e24] text-white px-10 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(216,35,42,0.39)] text-lg md:h-[58px]"
                >
                  <Search size={22} />
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust Badges Section */}
      <section className="py-8 bg-white border-b border-gray-100 relative z-20 mt-[-40px] md:mt-[-80px] pt-16 md:pt-32 shadow-sm rounded-t-3xl md:rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="flex flex-col items-center py-4 md:py-0">
                    <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center mb-4 border border-red-100"><Shield size={32}/></div>
                    <h3 className="font-extrabold text-2xl text-gray-900 mb-1">100% Verified</h3>
                    <p className="text-gray-500 font-medium text-sm">Every property is physically verified</p>
                </div>
                <div className="flex flex-col items-center py-4 md:py-0">
                    <div className="w-16 h-16 bg-yellow-50 text-[#f5990b] rounded-full flex items-center justify-center mb-4 border border-yellow-100"><Clock size={32}/></div>
                    <h3 className="font-extrabold text-2xl text-gray-900 mb-1">Fast Booking</h3>
                    <p className="text-gray-500 font-medium text-sm">Secure your room in just 5 mins</p>
                </div>
                <div className="flex flex-col items-center py-4 md:py-0">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-100"><ThumbsUp size={32}/></div>
                    <h3 className="font-extrabold text-2xl text-gray-900 mb-1">Zero Brokerage</h3>
                    <p className="text-gray-500 font-medium text-sm">Directly contact property owners</p>
                </div>
            </div>
        </div>
      </section>

      {/* Popular PGs Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 border-l-4 border-primary pl-4">Trending Properties</h2>
              <p className="text-gray-500 mt-2 pl-4 text-base font-medium">Handpicked properties just for you in best localities</p>
            </div>
            <button onClick={() => navigate('/pgs')} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 group bg-red-50 px-5 py-2.5 rounded-full transition-colors hidden sm:flex border border-red-100">
              See All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPGs.map((pg, index) => (
              <div key={pg._id} className="cursor-pointer group relative" onClick={() => navigate(`/pgs/${pg._id}`)}>
                 <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative z-10">
                    <div className="relative h-56 overflow-hidden bg-gray-200">
                      <img src={pg.images[0] || `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&rand=${index}`} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/95 text-gray-900 text-[11px] font-extrabold px-2.5 py-1 rounded shadow-sm uppercase tracking-wide">
                          {pg.gender}
                        </span>
                        <span className="bg-[#219653] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm backdrop-blur-sm flex items-center gap-1">
                          ★ 4.8
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                       <div>
                         <h3 className="font-extrabold text-gray-900 text-lg leading-snug line-clamp-1 mb-1.5">{pg.name}</h3>
                         <p className="text-sm text-gray-500 mb-4 flex items-center gap-1 font-medium"><MapPin size={16} className="text-gray-400"/> {pg.location}</p>
                       </div>
                       <div className="font-extrabold text-2xl text-gray-900 border-t border-gray-100 pt-4 flex items-center justify-between">
                         <div>
                            ₹{pg.rent} <span className="text-xs text-gray-500 font-bold uppercase ml-1 tracking-wider">/ Mon</span>
                         </div>
                         <div className="bg-gray-50 text-primary p-2.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors border border-gray-100 group-hover:border-primary">
                            <ArrowRight size={18} />
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => navigate('/pgs')} className="mt-8 w-full block text-center text-sm font-bold text-primary flex items-center justify-center gap-1 bg-red-50 border border-primary/20 px-5 py-3 rounded-xl transition-colors sm:hidden">
            See All Properties <ArrowRight size={16} />
          </button>
        </div>
      </section>
      
      {/* Banner / Promotional */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#fdf9f4] rounded-2xl shadow-sm border border-[#f5ebd8] overflow-hidden flex flex-col md:flex-row relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center relative z-10">
                   <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">Post your Property for <span className="text-accent underline decoration-4 underline-offset-4">Free</span></h2>
                   <p className="text-lg text-gray-600 mb-8 max-w-lg font-medium leading-relaxed">List it on PGhub and get genuine leads. Access to over 10,000+ verified students looking for accommodation across India.</p>
                   <div>
                       <button onClick={() => navigate('/add-pg')} className="bg-accent text-gray-900 text-lg font-extrabold px-10 py-4 rounded-xl hover:bg-[#e0a218] transition-colors whitespace-nowrap shadow-lg flex items-center gap-2">
                           Post Property Now <ArrowRight size={20} />
                       </button>
                   </div>
                </div>
                <div className="hidden md:block w-1/3 min-h-[300px] lg:min-h-[400px] bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1473')] bg-cover bg-center"></div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
