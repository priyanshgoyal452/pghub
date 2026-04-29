import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Inquiry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPrime = searchParams.get('type') === 'prime';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    contactNumber: '',
    budget: '',
    preferredArea: '',
    sharingType: 'Single',
    gender: 'Boys',
    consentToPublish: !isPrime
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  useEffect(() => {
    const studentToken = localStorage.getItem('studentToken');
    if (!studentToken) {
       alert("Please login as a Student to post an Inquiry.");
       navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const studentToken = localStorage.getItem('studentToken');

    fetch(`${import.meta.env.VITE_API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setLoading(false);
        setSuccess(true);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Sent!</h2>
        <p className="text-gray-600">We will notify you when matching PGs are found.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-primary font-bold hover:underline">Submit another inquiry</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">{isPrime ? 'Prime PG Request' : 'Student Requirements'}</h1>
            <p className="text-gray-500 mt-2">{isPrime ? 'Get priority assistance finding the perfect PG.' : "Can't find what you're looking for? Let us know!"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input required type="text" name="studentName" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
              <input required type="tel" name="contactNumber" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Budget (₹)</label>
                <input required type="number" name="budget" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sharing Type</label>
                <select name="sharingType" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="Single">Single</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Area</label>
                <input required type="text" name="preferredArea" placeholder="e.g. North Campus" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <select name="gender" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>
            </div>

            {!isPrime && (
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <input 
                   type="checkbox" 
                   id="consentToPublish" 
                   name="consentToPublish" 
                   checked={formData.consentToPublish} 
                   onChange={handleChange} 
                   className="mt-1 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" 
                />
                <label htmlFor="consentToPublish" className="text-sm text-gray-700 cursor-pointer">
                  <strong>Show my requirement publicly:</strong> I agree to display my name, budget, and contact details on the 'Find Flatmates' page so others can connect with me. If unchecked, your details will only be visible to PGhub admins.
                </label>
              </div>
            )}
            
            {isPrime && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium">
                  <strong>Privacy Note:</strong> As a Prime request, your details will remain completely private and will only be shared with PGhub administrators.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-primary/50"
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
