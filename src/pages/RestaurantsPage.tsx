import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HiOutlineOfficeBuilding, HiOutlineBadgeCheck, HiOutlineStar } from "react-icons/hi"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  address: string;
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


  const generateVerificationEmailHTML = (restaurant: Restaurant, isVerified: boolean) => {
    const statusColor = isVerified ? "#059669" : "#dc2626";
    const statusText = isVerified ? "Verified" : "Unverified";
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background-color: ${statusColor};
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content { 
              padding: 30px;
              background-color: #f8fafc;
              border-radius: 0 0 8px 8px;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              background-color: ${isVerified ? "#dcfce7" : "#fee2e2"};
              color: ${isVerified ? "#166534" : "#991b1b"};
            }
            .details-table {
              width: 100%;
              margin-top: 20px;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .details-table td:first-child {
              font-weight: bold;
              width: 30%;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Restaurant Verification Update</h1>
            </div>
            <div class="content">
              <p class="status">${statusText}</p>
              
              <table class="details-table">
                <tr>
                  <td>Restaurant Name</td>
                  <td>${restaurant.name}</td>
                </tr>
                <tr>
                  <td>Owner ID</td>
                  <td>${restaurant.owner}</td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>${restaurant.address}</td>
                </tr>
                <tr>
                  <td>Verification Date</td>
                  <td>${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
              
              <p style="margin-top: 25px; color: #64748b;">
                ${isVerified 
                  ? "Your restaurant is now verified and visible to all users!" 
                  : "Your restaurant verification has been removed. Please contact support for more information."}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
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
  const generateReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Restaurant Management Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Prepare the data
    const data = restaurants.map(restaurant => [
      restaurant.name,
      restaurant.owner,
      restaurant.address,
      `${restaurant.rating.toFixed(1)}/5`,
      restaurant.verified ? 'Verified' : 'Unverified',
      new Date(restaurant.createdAt).toLocaleDateString()
    ]);
    
    // Create the table
    autoTable(doc, {
      head: [['Name', 'Owner ID', 'Address', 'Rating', 'Status', 'Created At']],
      body: data,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    
    // Save the PDF
    doc.save('restaurants-report.pdf');
  };
  
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
      geocodeLocation(mapRestaurant.address);
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

        const restaurant = restaurants.find(r => r.id === id);
        if (restaurant) {
          const htmlContent = generateVerificationEmailHTML(restaurant, verified);
          await axios.post('http://localhost:8085/api/notifications/send-verification', {
            userId: restaurant.owner,
            htmlContent,
            subject: `Restaurant ${verified ? 'Verified' : 'Unverified'} - ${restaurant.name}`
          });
        }
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
  <div className="bg-indigo-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-indigo-600 mb-1">Total Restaurants</p>
      <p className="text-3xl font-bold text-indigo-700">{restaurants.length}</p>
    </div>
    <div className="bg-indigo-100 p-3 rounded-lg">
      <HiOutlineOfficeBuilding className="w-8 h-8 text-indigo-600" />
    </div>
  </div>

  <div className="bg-green-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-green-600 mb-1">Verified Restaurants</p>
      <p className="text-3xl font-bold text-green-700">
        {restaurants.filter(r => r.verified).length}
      </p>
    </div>
    <div className="bg-green-100 p-3 rounded-lg">
      <HiOutlineBadgeCheck className="w-8 h-8 text-green-600" />
    </div>
  </div>

  <div className="bg-blue-50 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-sm text-blue-600 mb-1">Average Rating</p>
      <p className="text-3xl font-bold text-blue-700">
        {(restaurants.reduce((acc, curr) => acc + curr.rating, 0) / restaurants.length || 0).toFixed(1)}
      </p>
    </div>
    <div className="bg-blue-100 p-3 rounded-lg">
      <HiOutlineStar className="w-8 h-8 text-blue-600" />
    </div>
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
      <div className="flex items-center gap-4 mb-4">
      <div className="relative w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        
   
  </div>
  <button
      onClick={() => generateReport()}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      Generate Report
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
          {currentRestaurants
  .filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map(restaurant => (
              <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{restaurant.name}</td>
                <td className="px-6 py-4">{restaurant.owner}</td>
                <td className="px-6 py-4">{restaurant.address}</td>
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
                  <div>{mapRestaurant.address}</div>
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