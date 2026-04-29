import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PGCard from '../components/PGCard';
import { Filter, Map } from 'lucide-react';
import MapComponent from '../components/MapComponent';

import { mockPGs } from '../data/mockData';

const PGListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const [filters, setFilters] = useState({
    budget: searchParams.get('budget') || '',
    gender: searchParams.get('gender') || '',
    location: searchParams.get('location') || ''
  });

  const executeSearch = (currentFilters) => {
    setLoading(true);
    const query = new URLSearchParams();
    if (currentFilters.budget) query.append('budget', currentFilters.budget);
    if (currentFilters.gender) query.append('gender', currentFilters.gender);
    if (currentFilters.location) query.append('location', currentFilters.location);
    
    fetch(`${import.meta.env.VITE_API_BASE}/pgs?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPgs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const newParams = new URLSearchParams();
    if (currentFilters.budget) newParams.append('budget', currentFilters.budget);
    if (currentFilters.gender) newParams.append('gender', currentFilters.gender);
    if (currentFilters.location) newParams.append('location', currentFilters.location);
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    executeSearch(filters);
  }, []); // Run only on initial mount based on URL arguments

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    executeSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters = { budget: '', gender: '', location: '' };
    setFilters(emptyFilters);
    executeSearch(emptyFilters);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <Filter size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location / Area</label>
                  <input 
                    type="text" 
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g. North Campus"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary mb-6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Budget (₹)</label>
                  <input 
                    type="number" 
                    name="budget"
                    value={filters.budget}
                    onChange={handleFilterChange}
                    placeholder="e.g. 15000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred For</label>
                  <select 
                    name="gender"
                    value={filters.gender}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="">Any</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-ed">Co-ed</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleApply}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    Apply Filters
                  </button>
                  <button 
                    onClick={handleClear}
                    className="w-full text-sm text-gray-500 hover:text-primary font-medium mt-3"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="w-full md:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Available PGs</h1>
                <p className="text-gray-500">{pgs.length} accommodations found</p>
              </div>
              <button 
                onClick={() => setShowMap(!showMap)} 
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                <Map size={18} /> {showMap ? 'Hide Map View' : 'Show Map View'}
              </button>
            </div>

            {showMap && <MapComponent pgs={pgs} />}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pgs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {pgs.map(pg => (
                  <PGCard key={pg._id} pg={pg} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <Filter size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No PGs found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                <button 
                  onClick={handleClear}
                  className="mt-6 bg-primary/10 text-primary px-6 py-2 rounded-full font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGListings;
