import { Tag, User, ShieldCheck, Trash2 } from 'lucide-react';

const ItemCard = ({ item, onDelete }) => {
  const studentData = JSON.parse(localStorage.getItem('studentData') || 'null');
  const studentId = studentData?.id || studentData?._id;
  const handleWhatsApp = (e) => {
    e.preventDefault();
    const cleanPhone = item.phone ? item.phone.replace(/\D/g, '') : "0000000000";
    const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const sellerName = item.seller?.name || item.sellerId?.name || 'Student';
    const msg = encodeURIComponent(`Hi ${sellerName}, I am interested in buying your ${item.title} listed on PGhub Marketplace.`);
    window.open(`https://wa.me/${finalPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 group hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-200">No Image</div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
            <Tag size={12}/> {item.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
            {item.condition}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
          <span className="text-xl font-extrabold text-indigo-600">₹{item.price}</span>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 mt-auto">{item.description}</p>
        
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <User size={14} className="text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900 leading-none truncate max-w-[130px]">{item.seller?.name || item.sellerId?.name || 'Student'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-[11px] text-gray-700 font-bold">{item.phone}</p>
                  <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><ShieldCheck size={10}/> Verified</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {studentId && item.seller && item.seller.id == studentId && (
                <button onClick={() => onDelete(item._id)} className="px-2 py-2 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-colors" title="Delete Item">
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={handleWhatsApp} className="px-3 py-2 bg-gray-50 border border-gray-200 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white text-gray-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1">
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
