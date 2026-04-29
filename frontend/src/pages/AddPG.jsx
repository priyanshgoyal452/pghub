import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AddPG = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const ownerToken = localStorage.getItem('ownerToken');
    if (!ownerToken) {
       alert("You must be logged in as a Landlord to post a property.");
       navigate('/owner/login');
    }
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagesBase64, setImagesBase64] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: '',
    rent: '',
    gender: 'Boys',
    furnishing: 'Fully Furnished',
    roomType: 'Single Room',
    phone: '',
    email: '',
    facilities: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE}/pgs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`
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
        setTimeout(() => navigate('/owner/dashboard'), 2000);
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
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
        <p className="text-gray-600">Your PG has been submitted for admin approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">List Your PG</h1>
            <p className="text-gray-500 mt-2">Reach thousands of students looking for accommodation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">PG Name</label>
                <input required type="text" name="name" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location/Area</label>
                <input required type="text" name="location" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
              <textarea required name="address" rows="2" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (₹)</label>
                <input required type="number" name="rent" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender Preference</label>
                <select name="gender" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Furnishing</label>
                <select name="furnishing" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Room Type / Sharing</label>
                <select name="roomType" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="Single Room">Single Room</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="1 RK / Attached Washroom">1 RK / Attached Washroom</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <input required type="tel" name="phone" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Optional)</label>
                <input type="email" name="email" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Facilities (comma separated)</label>
              <input type="text" name="facilities" placeholder="e.g. WiFi, AC, Food, Laundry" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Property Images (Max 5)</label>
              <ImageUploader onImagesChange={setImagesBase64} maxImages={5} accent="primary" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Property Description</label>
              <textarea name="description" rows="4" placeholder="Tell students about your property, nearby landmarks, and rules..." onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-primary/50"
            >
              {loading ? 'Submitting...' : 'Submit PG Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPG;
