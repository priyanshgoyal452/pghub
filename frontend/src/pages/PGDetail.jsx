import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, IndianRupee, Phone, CheckCircle2, User, Mail, ShieldCheck, Share2, Heart, Award, ImageIcon, Star } from 'lucide-react';
import { mockPGs } from '../data/mockData';
import PGCard from '../components/PGCard';

const PGDetail = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [similarPGs, setSimilarPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [review, setReview] = useState({ userName: '', rating: 5, comment: '' });

  const studentToken = localStorage.getItem('studentToken');
  const studentData = JSON.parse(localStorage.getItem('studentData') || 'null');
  const [isSaved, setIsSaved] = useState(studentData?.savedPGs?.some(savedId => String(savedId) === String(id)));

  const toggleSave = async () => {
    if (!studentToken) {
       alert('Please Login or Register to save properties!');
       window.location.href = '/login';
       return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/save-pg`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ pgId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(!isSaved);
        if (studentData) {
            studentData.savedPGs = data.savedPGs;
            localStorage.setItem('studentData', JSON.stringify(studentData));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: pg?.name || 'Property',
          text: `Check out this property on PGhub!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.userName || !review.comment) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      const data = await res.json();
      if (res.ok) {
        setPg(data);
        setReview({ userName: '', rating: 5, comment: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = (phone, pgName) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const msg = encodeURIComponent(`Hi! I'm interested in your property "${pgName}" that I found on PGhub.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}`)
      .then(res => res.json())
      .then(data => {
        setPg(data);
        setLoading(false);
        // Fetch similar properties
        fetch(`${import.meta.env.VITE_API_BASE}/pgs/${id}/similar`)
          .then(res => res.json())
          .then(simData => setSimilarPGs(simData))
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pg) {
    return <div className="text-center py-20 text-xl font-bold">Property not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Top Banner section */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-6 mb-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 border border-green-200">
                           <ShieldCheck size={14}/> Verified
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border border-blue-200">
                           {pg.gender} ONLY
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{pg.name}</h1>
                      <p className="text-gray-600 flex items-center gap-1.5 text-base font-medium">
                        <MapPin size={18} className="text-gray-400" />
                        {pg.address}
                      </p>
                  </div>
                  <div className="text-left md:text-right bg-red-50 p-4 rounded-xl border border-red-100 min-w-[200px]">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Monthly Rent</p>
                      <div className="flex items-baseline md:justify-end gap-1">
                          <span className="text-4xl font-extrabold text-gray-900">₹{pg.rent}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Includes all taxes</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Images Gallery */}
        {pg.images && pg.images.length > 0 ? (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 h-64 md:h-[400px]">
              <div className="md:col-span-2 h-full rounded-2xl overflow-hidden cursor-pointer group relative">
                  <img 
                    src={pg.images[0]} 
                    alt={pg.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="hidden md:flex flex-col gap-4 h-full">
                  <div className="flex-1 rounded-2xl overflow-hidden cursor-pointer relative group">
                      <img 
                        src={pg.images[1] || pg.images[0]} 
                        alt="Room" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden cursor-pointer relative group bg-gray-100">
                      {pg.images[2] ? (
                        <img 
                          src={pg.images[2]} 
                          alt="Living Area" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <ImageIcon className="text-gray-300 opacity-50 w-16 h-16"/>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center group-hover:bg-gray-900/40 transition-colors">
                          <span className="text-white font-bold text-lg">+ View All Photos</span>
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <div className="mb-8 h-64 md:h-80 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
             <ImageIcon size={48} className="mb-3 opacity-60 text-gray-400" />
             <span className="text-lg font-bold text-gray-500">No Property Images Provided</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-[65%] space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Property Highlights</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 -mx-2">
                <div className="flex flex-col px-2">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Tenant Type</span>
                  <span className="font-bold text-gray-900 flex items-center gap-2"><User size={18} className="text-primary" /> {pg.gender}</span>
                </div>
                <div className="flex flex-col border-l border-gray-100 px-4">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Listed By</span>
                  <span className="font-bold text-gray-900 flex items-center gap-2"><Award size={18} className="text-primary" /> Owner</span>
                </div>
                <div className="flex flex-col border-l border-gray-100 px-4">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Furnishing</span>
                  <span className="font-bold text-gray-900">{pg.furnishing || 'Fully Furnished'}</span>
                </div>
                <div className="flex flex-col border-l border-gray-100 px-4">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Room / Sharing</span>
                  <span className="font-bold text-gray-900">{pg.roomType || 'Single Room'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 mt-4">
                 <h3 className="text-xl font-bold text-gray-900 mb-6">Top Amenities</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                   {pg.facilities.map((facility, idx) => (
                     <div key={idx} className="flex items-center gap-3 text-gray-700">
                       <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <CheckCircle2 size={20} className="text-green-500" />
                       </div>
                       <span className="font-medium text-[15px]">{facility}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Description</h2>
               <div className="prose max-w-none text-gray-600 space-y-4">
                  {pg.description ? (
                     <p className="whitespace-pre-line leading-relaxed">{pg.description}</p>
                  ) : (
                    <>
                      <p>
                         This beautiful PG accommodation offers a premium lifestyle specifically tailored for {pg.gender}. Ideally positioned in {pg.location}, you enjoy excellent access to nearby colleges and tech parks. 
                      </p>
                      <p>
                         The property is thoroughly maintained, extremely clean, and provides all the modern conveniences you need. The rent of ₹{pg.rent}/month encompasses all building utilities, ensuring you have no hidden costs. With a strong focus on security and community, this home is the perfect starting point for making the most out of your city life.
                      </p>
                    </>
                  )}
               </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Student Reviews</h2>
               
               <div className="space-y-6 mb-8">
                 {pg.reviews && pg.reviews.length > 0 ? (
                   pg.reviews.map((r, idx) => (
                     <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                             {r.userName.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900 text-sm">{r.userName}</p>
                             <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="flex gap-1 mb-2">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                           ))}
                        </div>
                        <p className="text-gray-700 text-sm">{r.comment}</p>
                     </div>
                   ))
                 ) : (
                   <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                 )}
               </div>

               <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                  {!studentToken ? (
                     <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-4">Please log in to share your experience about this PG.</p>
                        <a href="/login" className="bg-primary hover:bg-[#c71e24] text-white px-6 py-2.5 rounded-lg font-bold transition-colors inline-block">
                           Log In to Review
                        </a>
                     </div>
                  ) : (
                     <form onSubmit={submitReview} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                           <input 
                              type="text" 
                              placeholder="Your Name" 
                              required 
                              value={review.userName}
                              onChange={e => setReview({...review, userName: e.target.value})}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                           />
                           <select 
                              value={review.rating} 
                              onChange={e => setReview({...review, rating: Number(e.target.value)})}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                           >
                              <option value="5">5 - Excellent</option>
                              <option value="4">4 - Very Good</option>
                              <option value="3">3 - Average</option>
                              <option value="2">2 - Poor</option>
                              <option value="1">1 - Terrible</option>
                           </select>
                        </div>
                        <textarea 
                           rows="3" 
                           placeholder="Share details of your experience at this PG" 
                           required
                           value={review.comment}
                           onChange={e => setReview({...review, comment: e.target.value})}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        ></textarea>
                        <button type="submit" className="bg-primary hover:bg-[#c71e24] text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                           Submit Review
                        </button>
                     </form>
                  )}
               </div>
            </div>

          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-[35%] relative">
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 sticky top-24">
              
              <div className="flex gap-4 mb-6 border-b border-gray-100 pb-6">
                 <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shadow-sm border-2 border-white flex-shrink-0 relative">
                    <img src="https://ui-avatars.com/api/?name=Owner&background=random" alt="Owner" className="w-full h-full object-cover"/>
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Property Owner</h3>
                    <p className="text-sm text-gray-500">Member since 2023</p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-xs font-bold bg-accent/20 text-yellow-800 px-2 py-0.5 rounded">Super Host</span>
                    </div>
                 </div>
              </div>

              {!showContact ? (
                 <div>
                    <p className="text-sm text-gray-600 mb-4 font-medium text-center">Contact the owner directly to arrange a physical visit or to book immediately.</p>
                    <button 
                      onClick={() => setShowContact(true)}
                      className="w-full bg-primary hover:bg-[#c71e24] text-white py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(216,35,42,0.39)] text-lg mb-3"
                    >
                      Get Owner Details
                    </button>
                    <div className="flex gap-3 mt-4">
                        <button onClick={toggleSave} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-bold text-gray-700 transition shadow-sm">
                            <Heart size={18} className={isSaved ? "fill-red-500 text-red-500 transition-colors" : "text-gray-400"}/> {isSaved ? 'Saved' : 'Save'}
                        </button>
                        <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-bold text-gray-700 transition shadow-sm">
                            <Share2 size={18} className="text-gray-400"/> Share
                        </button>
                    </div>
                 </div>
              ) : (
                <div className="animate-fade-in bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 text-center">Owner Contact Actions</h4>
                  <div className="flex flex-col gap-3">
                      <a href={`tel:${pg.contactDetails.phone}`} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl hover:border-primary group transition-colors">
                          <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2.5 rounded-lg group-hover:bg-primary/20 transition-colors"><Phone size={20} className="text-primary" /></div>
                              <div>
                                 <p className="text-xs text-gray-500 font-bold uppercase">Call Now</p>
                                 <p className="font-extrabold text-gray-900">{pg.contactDetails.phone}</p>
                              </div>
                          </div>
                      </a>
                      
                      {pg.contactDetails.email && (
                          <a href={`mailto:${pg.contactDetails.email}`} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl hover:border-primary group transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors"><Mail size={20} className="text-blue-600" /></div>
                                  <div className="truncate">
                                     <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                     <p className="font-extrabold text-gray-900 truncate">{pg.contactDetails.email}</p>
                                  </div>
                              </div>
                          </a>
                      )}

                      <button onClick={() => handleWhatsApp(pg.contactDetails.phone, pg.name)} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 mt-2 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2">
                         <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                         WhatsApp Chat
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarPGs.length > 0 && (
           <div className="mt-16 pt-10 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <Star className="text-primary fill-primary"/> Properties You Might Also Like
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                 {similarPGs.map(simPg => (
                    <div key={simPg._id} className="flex-1 min-w-0">
                       <PGCard pg={simPg} compact={true} />
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default PGDetail;
