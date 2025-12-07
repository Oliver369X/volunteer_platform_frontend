import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para ajustar el mapa cuando cambian las ubicaciones
function MapBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    const bounds = L.latLngBounds(
      locations.map((loc) => [parseFloat(loc.latitude), parseFloat(loc.longitude)])
    );
    
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [locations, map]);

  return null;
}

const VolunteerMap = ({ locations = [] }) => {
  const mapRef = useRef(null);

  // Crear iconos personalizados según el estado
  const createIcon = (status) => {
    const color = status === 'ACTIVE' ? 'green' : status === 'IDLE' ? 'yellow' : 'red';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Centro por defecto (Santa Cruz, Bolivia)
  const defaultCenter = [-17.8146, -63.1561];
  const defaultZoom = 13;

  if (locations.length === 0) {
    return (
      <div className="bg-gray-200 rounded h-96 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="mb-2">🗺️ No hay voluntarios activos en este evento</p>
          <p className="text-sm">El mapa se mostrará cuando haya ubicaciones registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds locations={locations} />

        {locations.map((location) => {
          const minutesAgo = Math.floor(
            (new Date() - new Date(location.recordedAt)) / 60000
          );
          const status = minutesAgo < 10 ? 'ACTIVE' : minutesAgo < 30 ? 'IDLE' : 'INACTIVE';

          return (
            <Marker
              key={location.id}
              position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
              icon={createIcon(status)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{location.volunteer?.fullName || 'Voluntario'}</p>
                  <p className="text-gray-600">{location.task?.title || 'Sin tarea'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Última actualización: {minutesAgo} min ago
                  </p>
                  <p className="text-xs text-gray-500">
                    📍 {parseFloat(location.latitude).toFixed(4)}, {parseFloat(location.longitude).toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default VolunteerMap;

