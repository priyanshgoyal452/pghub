import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, PhoneCall, ChevronRight, ImageIcon } from 'lucide-react';

const PGCard = ({ pg, compact = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/pgs/${pg._id}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col ${compact ? '' : 'sm:flex-row'} mb-4 h-full cursor-pointer group`}
    >
      {/* Image Section */}
      <div className={`${compact ? 'w-full h-48 border-b' : 'sm:w-1/3 h-48 sm:h-auto sm:border-r'} relative border-gray-100 cursor-pointer shrink-0`}>
        {pg.images && pg.images.length > 0 ? (
          <img 
            src={pg.images[0]} 
            alt={pg.name}
            className="w-full h-full object-cover bg-gray-100"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
             <ImageIcon size={32} className="mb-2 opacity-50" />
             <span className="text-xs font-bold uppercase tracking-widest text-gray-500">No Image</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
            <span className="bg-black/70 text-white text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                <ShieldCheck size={12} className="text-green-400" /> Verified
            </span>
        </div>
      </div>
      
      {/* Details Section */}
      <div className={`${compact ? 'w-full flex-1' : 'sm:w-2/3'} p-4 md:p-5 flex flex-col justify-between`}>
        <div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="group-hover:text-primary transition-colors">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{pg.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{pg.address}</p>
                </div>
                <div className="text-right ml-4">
                    <span className="text-2xl font-extrabold text-gray-900 whitespace-nowrap">₹ {pg.rent}</span>
                    <span className="block text-xs text-gray-500 font-medium">per month</span>
                </div>
            </div>

            {/* Badges/Configurations */}
            <div className={`flex flex-wrap text-sm border-t border-b border-gray-100 py-3 my-3 gap-y-2 ${compact ? 'gap-x-4' : 'gap-x-6'}`}>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tenant Type</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1"><User size={14} className="text-primary"/> {pg.gender}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Top Facilities</span>
                    <span className="font-medium text-gray-700 truncate w-48">
                        {pg.facilities?.slice(0, 3).join(', ') || 'Standard Amenities'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Listed By</span>
                    <span className="font-bold text-gray-900">Owner</span>
                </div>
            </div>
            
            <p className={`text-sm text-gray-600 line-clamp-2 ${compact ? 'w-full' : 'md:w-3/4'}`}>
                {pg.description || `This property guarantees a comfortable living experience for students and professionals alike, equipped with ${pg.facilities?.slice(0,2).join(' and ') || 'essential amenities'} in a prime location.`}
            </p>
        </div>

        {/* Action Buttons */}
        <div 
          onClick={handleActionClick}
          className={`flex items-center mt-4 ${compact ? 'flex-col items-start gap-4 2xl:flex-row 2xl:justify-between' : 'justify-between'}`}
        >
            <div className="flex items-center shrink-0">
                 <div className="flex -space-x-2">
                     <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm bg-gray-200" src="https://ui-avatars.com/api/?name=Owner&background=random" alt="Owner" />
                 </div>
                 <span className="pl-3 text-xs font-bold text-gray-500 my-auto">Direct Contact</span>
            </div>
            <div className={`flex gap-2 w-full ${compact ? '2xl:w-auto mt-2 2xl:mt-0' : 'sm:w-auto'}`}>
                <Link 
                  to={`/pgs/${pg._id}`}
                  className={`flex items-center justify-center gap-1 text-sm font-bold border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors ${compact ? 'flex-1' : 'hidden md:flex'}`}
                >
                  Details <ChevronRight size={16} />
                </Link>
                <button 
                  className={`flex items-center justify-center gap-1 text-sm font-bold bg-primary text-white border border-primary px-3 py-2 rounded shadow-sm hover:bg-[#c71e24] transition-colors ${compact ? 'flex-1' : ''}`}
                >
                  <PhoneCall size={16} /> Contact
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PGCard;
