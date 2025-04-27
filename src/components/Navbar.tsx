import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
          <Link 
              to="/" 
              className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent"
            >
              Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                      {user?.name ? (
                        <span className="font-medium text-indigo-600">
                          {user.name[0].toUpperCase()}
                        </span>
                      ) : (
                        <FaRegUserCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                            } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm gap-2`}
                          >
                            <FiUser className="w-4 h-4" />
                            Profile Settings
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-gray-50 text-red-600' : 'text-gray-700'
                            } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm gap-2`}
                          >
                            <FiLogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-indigo-600 font-medium rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;