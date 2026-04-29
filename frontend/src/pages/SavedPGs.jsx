import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PGCard from '../components/PGCard';
import { Heart } from 'lucide-react';

const SavedPGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE}/pgs/saved`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPgs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="bg-gray-50 min-h-[80vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-4">
          <Heart size={28} className="text-red-500 fill-red-500" />
          <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-primary pl-4">Saved Properties</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : pgs.length > 0 ? (
          <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
            {pgs.map(pg => (
              <PGCard key={pg._id} pg={pg} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Properties</h3>
            <p className="text-gray-500 mb-6 font-medium">You haven't bookmarked any PG accommodations yet.</p>
            <button onClick={() => navigate('/pgs')} className="bg-primary hover:bg-[#c71e24] text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
              Explore PGs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPGs;
