import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const OwnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/owner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ownerToken', data.token);
        localStorage.setItem('ownerData', JSON.stringify(data.owner));
        navigate('/owner/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/owner/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ownerToken', data.token);
        localStorage.setItem('ownerData', JSON.stringify(data.owner));
        navigate('/owner/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error with Google services');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 border-b-4 border-indigo-500 pb-2 inline-block mx-auto">Landlord Portal</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Registered Email address" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Password" />
          </div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold transition-colors shadow-md">Sign In as Owner</button>
        </form>

        <div className="mt-8 flex flex-col items-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 font-bold mb-4">Or sign in to Landlord Portal using Google</p>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In Failed')}
            theme="outline"
            size="large"
            shape="pill"
          />
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Want to list your property? <Link to="/owner/register" className="font-bold text-indigo-600 hover:text-indigo-800">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default OwnerLogin;
