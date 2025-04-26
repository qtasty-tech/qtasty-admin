import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  location: string;
  rating: number;
  verified: boolean;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
}

interface NewRestaurant {
  name: string;
  owner: string;
  location: string;
}
interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
  }

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState<NewRestaurant>({
    name: '',
    owner: '',
    location: ''
  });
  const [mapRestaurant, setMapRestaurant] = useState<Restaurant | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const geocodeLocation = async (location: string) => {
      setIsGeocoding(true);
      try {
        const response = await axios.get<NominatimResult[]>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
          {
            headers: {
              'User-Agent': 'YourApp/1.0 (contact@yourdomain.com)' // Replace with your app's info
            }
          }
        );

        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setMapCoordinates([parseFloat(lat), parseFloat(lon)]);
        } else {
          toast.error('Location not found');
          setMapCoordinates(null);
        }
      } catch (error) {
        toast.error('Failed to fetch location data');
        setMapCoordinates(null);
      } finally {
        setIsGeocoding(false);
      }
    };

    if (mapRestaurant) {
      geocodeLocation(mapRestaurant.location);
    }
  }, [mapRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/admin/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) return;
    try {
      const response = await axios.get(`http://localhost:8084/api/admin/users/search?name=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Failed to search users');
    }
  };

  const handleVerifyRestaurant = async (id: string, verified: boolean) => {
    try {
      await axios.put(`http://localhost:8084/api/admin/restaurants/${id}/verify`,{ isVerified: verified },
        { headers: { 'Content-Type': 'application/json' } });
      await fetchRestaurants();
      toast.success('Verification status updated');
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await axios.delete(`http://localhost:8084/api/admin/restaurants/${id}`);
      await fetchRestaurants();
      toast.success('Restaurant deleted successfully');
    } catch (error) {
      toast.error('Failed to delete restaurant');
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8084/api/admin/restaurants', newRestaurant);
      await fetchRestaurants();
      setIsAddModalOpen(false);
      setNewRestaurant({ name: '', owner: '', location: '' });
      toast.success('Restaurant added successfully');
    } catch (error) {
      toast.error('Failed to add restaurant');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRestaurants = restaurants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(restaurants.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">Total Restaurants</h3>
          <p className="text-3xl font-bold text-indigo-600">{restaurants.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">Verified Restaurants</h3>
          <p className="text-3xl font-bold text-green-600">
            {restaurants.filter(r => r.verified).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-blue-600">
          {(restaurants.reduce((acc, curr) => acc + curr.rating, 0) / restaurants.length || 0).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold text-gray-800">Restaurant Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Restaurant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Verified</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRestaurants.map(restaurant => (
              <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{restaurant.name}</td>
                <td className="px-6 py-4">{restaurant.owner}</td>
                <td className="px-6 py-4">{restaurant.location}</td>
                <td className="px-6 py-4">{restaurant.rating}/5</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleVerifyRestaurant(restaurant.id, !restaurant.verified)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      restaurant.verified 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {restaurant.verified ? 'Verified' : 'Unverified'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => setMapRestaurant(restaurant)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                  >
                    View Map
                  </button>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4 bg-gray-50">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Restaurant</h2>
            <form onSubmit={handleAddRestaurant}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto">
                        {searchResults.map(user => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setNewRestaurant(prev => ({...prev, owner: user.id}));
                              setSearchResults([]);
                              setSearchQuery(user.name);
                            }}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {user.name} ({user.id})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRestaurant.location}
                    onChange={(e) => setNewRestaurant(prev => ({...prev, location: e.target.value}))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* map */}
      {mapRestaurant && (
    <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">{mapRestaurant.name} Location</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          {isGeocoding ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : mapCoordinates ? (
            <MapContainer
              center={mapCoordinates}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={mapCoordinates}>
                <Popup>
                  <div className="font-semibold">{mapRestaurant.name}</div>
                  <div>{mapRestaurant.location}</div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-red-500">
              Could not find coordinates for this location
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setMapRestaurant(null);
              setMapCoordinates(null);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default RestaurantsPage;