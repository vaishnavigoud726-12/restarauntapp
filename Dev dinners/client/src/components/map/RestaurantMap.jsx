import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Star, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom modern SVG marker icons for Leaflet
const createPinIcon = (color = '#f97316') =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const userPinIcon = L.divIcon({
  className: 'user-map-pin',
  html: `
    <div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function RestaurantMap({
  restaurants = [],
  userLocation = { lat: 17.4486, lng: 78.3846 },
  onSelectRestaurant,
}) {
  const center = [userLocation.lat || 17.4486, userLocation.lng || 78.3846];

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Pin */}
        <Marker position={center} icon={userPinIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800">
              📍 Your Location
            </div>
          </Popup>
        </Marker>

        {/* Restaurant Pins */}
        {restaurants.map((rest) => {
          const coords = rest.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          const pos = [coords[1], coords[0]]; // Leaflet takes [lat, lng]

          return (
            <Marker
              key={rest._id}
              position={pos}
              icon={createPinIcon('#ea580c')}
            >
              <Popup className="cravewise-popup">
                <div className="w-56 p-1 space-y-2">
                  <img
                    src={rest.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}
                    alt={rest.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {rest.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-500" />
                      {rest.address?.area || 'Hyderabad'}
                      {rest.distanceKm && (
                        <span className="font-bold text-brand-600">
                          • {rest.distanceKm} km
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      ★ {rest.averageRating?.toFixed(1) || '4.5'}
                    </span>
                    <span className="text-slate-600 font-semibold">
                      ₹{rest.priceForTwo} for 2
                    </span>
                  </div>

                  {rest.featuredOffer && (
                    <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 truncate">
                      <Tag className="w-3 h-3" />
                      {rest.featuredOffer}
                    </div>
                  )}

                  <Link
                    to={`/restaurants/${rest._id}`}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    <span>View Menu & Reserve</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

