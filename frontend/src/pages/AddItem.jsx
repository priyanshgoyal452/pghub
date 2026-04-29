import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Tag } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagesBase64, setImagesBase64] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Furniture',
    condition: 'Good',
    phone: ''
  });

  useEffect(() => {
    const studentToken = localStorage.getItem('studentToken');
    if (!studentToken) {
       alert("You must be logged in as a Student to post an advertisement.");
       navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const studentToken = localStorage.getItem('studentToken');

    fetch(`${import.meta.env.VITE_API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ ...formData, imagesBase64 })
    })
      .then(async res => {
        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.error || 'Failed to submit');
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => navigate('/marketplace'), 2000);
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
        setLoading(false);
      });
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
           <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Advertisement Posted!</h2>
        <p className="text-gray-500 font-medium">Your item is now live on the student marketplace.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 border-b border-gray-100 pb-6 flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl"><Tag size={28}/></div>
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 border-l-0">Sell an Item</h1>
               <p className="text-gray-500 mt-1 font-medium text-sm">Post a free ad to sell your second-hand goods completely securely to peers.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title</label>
              <input required type="text" name="title" placeholder="e.g. Symphony Cooler 40L, Good Condition" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                <input required type="number" name="price" placeholder="4500" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select name="category" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white font-medium text-gray-700">
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Appliances">Appliances (Cooler/AC)</option>
                  <option value="Books">Books</option>
                  <option value="Vehicles">Vehicles (Bikes/Cycles)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                <div className="flex gap-4">
                   {['Like New', 'Good', 'Fair'].map(cond => (
                      <label key={cond} className={`flex-1 flex justify-center items-center py-3 border rounded-lg cursor-pointer transition-all ${formData.condition === cond ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50 font-medium'}`}>
                         <input type="radio" name="condition" value={cond} checked={formData.condition === cond} onChange={handleChange} className="hidden" />
                         {cond}
                      </label>
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Contact</label>
                <input required type="tel" name="phone" placeholder="10-digit number" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Description</label>
              <textarea required name="description" rows="4" placeholder="How old is it? Any defects? Detail the features..." onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Images (Max 3)</label>
              <ImageUploader onImagesChange={setImagesBase64} maxImages={3} accent="indigo" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition-colors shadow-md disabled:bg-indigo-400 mt-4 text-lg"
            >
              {loading ? 'Processing...' : 'Post Advertisement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
