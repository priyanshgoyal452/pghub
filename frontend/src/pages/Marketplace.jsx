import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Plus } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchItems = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);
    
    fetch(`${import.meta.env.VITE_API_BASE}/items?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    const token = localStorage.getItem('studentToken');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting item');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-indigo-900 py-16 relative overflow-hidden border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="bg-indigo-800 text-indigo-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block border border-indigo-700 shadow-sm">Peer-to-Peer Campus Store</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Student Marketplace</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-8">Buy and sell second-hand coolers, study tables, books, and essentials directly with verified peers securely.</p>
          
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
            <div className="flex-1 bg-white rounded-xl p-2 flex items-center shadow-lg border-2 border-transparent focus-within:border-indigo-400">
              <Search className="text-gray-400 ml-3" size={24} />
              <input 
                type="text" 
                placeholder="Search items (e.g. Mattress, Router...)" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
              />
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition hidden md:block">Search</button>
            </div>
            <button type="submit" className="bg-indigo-600 text-white w-full px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition md:hidden mt-2">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 gap-4 mb-8">
          <div className="flex overflow-x-auto w-full xl:w-auto gap-2 pb-2 xl:pb-0 scrollbar-hide">
            {['All', 'Furniture', 'Electronics', 'Appliances', 'Books', 'Vehicles', 'Other'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${category === cat || (cat === 'All' && !category) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Link to="/add-item" className="w-full xl:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Plus size={18}/> Post a Free Ad
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <ItemCard key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto mt-12">
            <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShoppingBag size={40} className="text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-500 mb-6 font-medium">Looks like the campus store is out of stock for this specific search or category.</p>
            <button onClick={() => {setCategory(''); setSearch('');}} className="text-indigo-600 font-bold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
