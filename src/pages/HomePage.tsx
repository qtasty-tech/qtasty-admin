import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="px-8 py-10">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-4xl font-bold text-gray-800">Profile Overview</h1>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
            
            <div className="flex items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mr-6">
                <span className="text-3xl text-blue-600 font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">Phone</dt>
                    <dd className="font-medium text-gray-900">
                      {user?.phone || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Email</dt>
                    <dd className="font-medium text-gray-900 break-all">{user?.email}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Account Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">Account Status</dt>
                    <dd className="font-medium text-gray-900 capitalize">
                      {/* {user?.isVerified ? 'Verified' : 'Pending Verification'} */}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">User Role</dt>
                    <dd className="font-medium text-gray-900 capitalize">
                      {user?.role?.toLowerCase()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;