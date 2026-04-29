import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Configure custom deterministic coordinates for mock positioning around New Delhi
const generateCoordinates = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const lat = 28.6139 + (Math.abs(hash) % 100) / 600; 
  const lng = 77.2090 + ((Math.abs(hash) / 100) % 100) / 600;
  return [lat, lng];
}

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ pgs }) => {
  const navigate = useNavigate();

  if (!pgs || pgs.length === 0) return null;

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-6 z-0 relative">
      <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pgs.map(pg => {
          const position = generateCoordinates(pg._id);
          return (
            <Marker key={pg._id} position={position} icon={customIcon}>
              <Popup>
                <div 
                  className="cursor-pointer min-w-[200px] p-1"
                  onClick={() => navigate(`/pgs/${pg._id}`)}
                >
                  <img src={pg.images[0] || 'https://via.placeholder.com/200'} alt={pg.name} className="w-full h-28 object-cover rounded-lg mb-3 shadow-sm" />
                  <p className="font-extrabold text-gray-900 text-sm mb-1 line-clamp-1">{pg.name}</p>
                  <p className="text-primary font-bold text-lg">₹{pg.rent}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
