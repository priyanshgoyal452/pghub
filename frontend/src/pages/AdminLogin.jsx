import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed. Incorrect password.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-50 text-primary flex items-center justify-center rounded-full mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your master password to access the dashboard</p>
        </div>

        {error && <div className="bg-red-50 text-primary p-3 rounded-lg text-sm font-bold mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="password" 
              placeholder="Master Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center font-bold tracking-widest text-lg bg-white"
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-[#c71e24] text-white font-bold py-3 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(216,35,42,0.39)]">
             Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
