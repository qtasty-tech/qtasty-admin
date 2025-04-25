import { useAuth } from "../contexts/AuthContext";


const HomePage = () => {
  const { user } = useAuth();
  console.log("user", user);
  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Name:</span>
                <span className="text-gray-900">
                  {user?.fname} {user?.lname}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Email:</span>
                {/* <span className="text-gray-900">{user?.email}</span> */}
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">User Type:</span>
                <span className="text-gray-900 capitalize">
                    {/* {user || null} */}
                  {/* {user?.userType.toLowerCase().replace(/_/g, ' ')} */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;