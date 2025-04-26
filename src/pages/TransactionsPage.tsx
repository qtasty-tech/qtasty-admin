import { Link, Outlet } from 'react-router-dom';

const TransactionsPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Transaction Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="view" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700">View Transactions</h2>
            <p className="text-gray-500 mt-2">Browse all transactions</p>
          </Link>
          <Link to="report" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700">Generate Reports</h2>
            <p className="text-gray-500 mt-2">Create detailed transaction reports</p>
          </Link>
          <Link to="disputes" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700">Manage Disputes</h2>
            <p className="text-gray-500 mt-2">Handle transaction disputes</p>
          </Link>
        </div>
  
        <Outlet />
      </div>
    );
  };
  
  export default TransactionsPage;