import { Link } from 'react-router-dom';
import { User, Menu, X, Building, Home, CreditCard, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const studentData = JSON.parse(localStorage.getItem('studentData') || 'null');
  const ownerData = JSON.parse(localStorage.getItem('ownerData') || 'null');

  const navLinks = [
    { name: 'PGs & Hostels', path: '/pgs' },
    { name: 'Flatmates', path: '/flatmates' },
    { name: 'Marketplace', path: '/marketplace' }
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="PGhub Logo" className="h-12 w-auto" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/inquiry?type=prime" className="text-sm font-bold text-gray-700 hover:text-primary flex items-center gap-1 bg-accent/20 px-3 py-1.5 rounded-full">
              <CreditCard size={16} className="text-accent" /> Prime
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            {ownerData ? (
              <Link to="/owner/dashboard" className="text-sm font-bold border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors">
                 Owner Portal
              </Link>
            ) : (
              <Link to="/owner/login" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                 For Partners
              </Link>
            )}
            <div className="h-6 w-px bg-gray-300"></div>
            {studentData && studentData.name ? (
              <div className="flex items-center gap-4">
                 <Link to="/saved" className="text-sm font-bold text-gray-700 flex items-center gap-1 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                   <Heart size={16} className="text-red-500 fill-red-500"/> Saved ({studentData.savedPGs ? studentData.savedPGs.length : 0})
                 </Link>
                 <span className="text-sm font-bold text-gray-700 flex items-center gap-1 border-l pl-4 border-gray-300">
                   <User size={18} className="text-primary"/> {studentData.name.split(' ')[0]}
                 </span>
                 <button onClick={() => {
                     localStorage.removeItem('studentToken');
                     localStorage.removeItem('studentData');
                     window.location.href = '/';
                 }} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase">
                    Logout
                 </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-primary">
                Login <User size={18} />
              </Link>
            )}
            <Link 
              to="/add-pg" 
              className="ml-2 text-sm font-bold bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm"
            >
              Post Property <span className="bg-accent text-gray-900 text-[10px] px-1.5 py-0.5 rounded uppercase ml-1">Free</span>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-4">
            {(!studentData || !studentData.name) && !ownerData && (
              <Link to="/login" className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center gap-1 px-3 py-1.5 rounded-lg">
                Login <User size={14} />
              </Link>
            )}
            {studentData && studentData.name && (
               <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                 {studentData.name.charAt(0).toUpperCase()}
               </div>
            )}
            {ownerData && ownerData.name && (
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                 {ownerData.name.charAt(0).toUpperCase()}
               </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-gray-600 hover:text-primary hover:bg-red-50 block px-3 py-3 rounded-md font-medium transition-colors border-b border-gray-100 last:border-0"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {ownerData ? (
               <Link to="/owner/dashboard" onClick={() => setIsOpen(false)} className="text-indigo-600 hover:bg-indigo-50 block px-3 py-3 rounded-md font-bold transition-colors border-b border-gray-100">
                  Owner Portal
               </Link>
            ) : (
               <Link to="/owner/login" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-3 rounded-md font-bold transition-colors border-b border-gray-100">
                  For Partners
               </Link>
            )}

            {studentData && studentData.name ? (
              <>
                 <Link to="/saved" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-2 px-3 py-3 rounded-md font-bold transition-colors border-b border-gray-100">
                   <Heart size={18} className="text-red-500 fill-red-500"/> Saved Properties ({studentData.savedPGs ? studentData.savedPGs.length : 0})
                 </Link>
                 <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <User size={18} className="text-primary"/> {studentData.name}
                    </span>
                    <button onClick={() => {
                        localStorage.removeItem('studentToken');
                        localStorage.removeItem('studentData');
                        setIsOpen(false);
                        window.location.href = '/';
                    }} className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded uppercase hover:bg-red-100">
                       Logout
                    </button>
                 </div>
              </>
            ) : null}

            <Link 
              to="/add-pg" 
              onClick={() => setIsOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 text-sm font-bold bg-primary text-white px-4 py-3 rounded-md transition-colors shadow-sm w-full"
            >
              Post Property <span className="bg-accent text-gray-900 text-[10px] px-1.5 py-0.5 rounded uppercase">Free</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
