import { NavLink } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiPackage, FiMail } from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`sticky top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-6">
        <div className={`text-2xl font-bold ${!isExpanded && 'hidden'}`}>
          Admin Panel
        </div>
      </div>
      
      <nav className="mt-8">
        <NavLink 
          to="/users" 
          className={({ isActive }) => 
            `flex items-center p-4 hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800' : ''
            } ${!isExpanded ? 'justify-center' : ''}`
          }
        >
          <FiUsers className={`text-xl ${isExpanded ? 'mr-4' : ''}`} />
          <span className={`${!isExpanded && 'hidden'}`}>Manage Users</span>
        </NavLink>

        <NavLink 
          to="/transactions" 
          className={({ isActive }) => 
            `flex items-center p-4 hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800' : ''
            } ${!isExpanded ? 'justify-center' : ''}`
          }
        >
          <FiDollarSign className={`text-xl ${isExpanded ? 'mr-4' : ''}`} />
          <span className={`${!isExpanded && 'hidden'}`}>Transactions</span>
        </NavLink>

        <NavLink 
          to="/restaurants" 
          className={({ isActive }) => 
            `flex items-center p-4 hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800' : ''
            } ${!isExpanded ? 'justify-center' : ''}`
          }
        >
          <FiPackage className={`text-xl ${isExpanded ? 'mr-4' : ''}`} />
          <span className={`${!isExpanded && 'hidden'}`}>Restaurants</span>
        </NavLink>

        <NavLink 
          to="/newsletter" 
          className={({ isActive }) => 
            `flex items-center p-4 hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800' : ''
            } ${!isExpanded ? 'justify-center' : ''}`
          }
        >
          <FiMail className={`text-xl ${isExpanded ? 'mr-4' : ''}`} />
          <span className={`${!isExpanded && 'hidden'}`}>Newsletter</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;