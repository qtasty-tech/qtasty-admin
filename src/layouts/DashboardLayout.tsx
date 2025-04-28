import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
  <Sidebar />
  <div className="flex-1 bg-gradient-to-br from-emerald-30 to-green-100 min-h-screen">
    <Outlet />
  </div>
</div>

  );
};

export default DashboardLayout;