// pages/UsersPage.tsx (or wherever you place it)
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineUserGroup, HiOutlineBadgeCheck, HiOutlineShieldCheck } from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'restaurant' | 'delivery';
  verified: boolean;
}

interface NewUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'customer' | 'restaurant' | 'delivery';
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8084/api/admin/users', newUser);
      await fetchUsers();
      setIsAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
      });
      toast.success('User added successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to add user');
      } else {
        toast.error('Failed to add user');
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      await axios.put(
        `http://localhost:8084/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { 'Content-Type': 'application/json' } }
      );
      await fetchUsers();
      toast.success('Role updated successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update role');
      } else {
        toast.error('Failed to update role');
      }
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      await axios.put(
        `http://localhost:8084/api/admin/users/${userId}/verify`,
        { isVerified: verified },
        { headers: { 'Content-Type': 'application/json' } }
      );
      await fetchUsers();
      toast.success('Verification status updated');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update verification');
      } else {
        toast.error('Failed to update verification');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:8084/api/admin/users/${userId}`);
      await fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('User Management Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const data = users.map(user => [
      user.name,
      user.email,
      user.phone,
      user.role.charAt(0).toUpperCase() + user.role.slice(1),
      user.verified ? 'Verified' : 'Unverified'
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Role', 'Status']],
      body: data,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] }
    });

    doc.save('users-report.pdf');
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 ">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-indigo-200 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-indigo-700">{users.length}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg">
            <HiOutlineUserGroup className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-green-200 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 mb-1">Verified Users</p>
            <p className="text-3xl font-bold text-green-700">{users.filter(user => user.verified).length}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <HiOutlineBadgeCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-blue-200 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 mb-1">Admins</p>
            <p className="text-3xl font-bold text-blue-700">{users.filter(user => user.role === 'admin').length}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <HiOutlineShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={generateReport} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
            Generate Report
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Verified</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400">
            {currentUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phone}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                    className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleVerifyUser(user.id, !user.verified)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.verified ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {user.verified ? 'Verified' : 'Unverified'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
