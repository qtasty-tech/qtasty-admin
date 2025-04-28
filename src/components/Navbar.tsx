import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-green-500 backdrop-blur-md border-b border-emerald-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-3xl font-bold bg-gradient-to-r from-emerald-100 to-green-50 bg-clip-text text-transparent tracking-tight"
            >
              Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 hover:bg-emerald-700/20 px-3 py-2 rounded-lg transition-all group">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-900/30 flex items-center justify-center ring-1 ring-emerald-600/30">
                      {user?.name ? (
                        <span className="font-medium text-emerald-200">
                          {user.name[0].toUpperCase()}
                        </span>
                      ) : (
                        <FaRegUserCircle className="w-5 h-5 text-emerald-300" />
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-emerald-100">{user.name}</p>
                      <p className="text-xs text-emerald-200/80">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-emerald-300 group-hover:text-emerald-100 transition-colors" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-emerald-200/30 rounded-xl bg-green-100 shadow-2xl shadow-emerald-900/50 ring-1 ring-emerald-700/30 focus:outline-none">
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-emerald-700/40 text-emerald-900' : 'text-emerald-900'
                            } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm gap-2 transition-colors`}
                          >
                            <FiUser className="w-4 h-4 text-emerald-700" />
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
                              active ? 'bg-red-600/20 text-red-800' : 'text-red-800'
                            } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm gap-2 transition-colors`}
                          >
                            <FiLogOut className="w-4 h-4 text-red-700" />
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
                  className="px-4 py-2 text-emerald-200 hover:text-white font-medium rounded-lg transition-colors hover:bg-emerald-700/30"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-emerald-900 font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/40"
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