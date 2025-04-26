import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
  <Sidebar />
  <div className="flex-1 p-8 bg-gray-100">
    <Outlet />
  </div>
</div>

  );
};

export default DashboardLayout;