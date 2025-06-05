"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, User } from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([
    {
      email: 'john.smith@email.com',
      name: 'John Smith',
      phone_number: '+1-555-0201',
      profile_picture: null,
      age: 35,
      gender: 'M',
      address: '123 Main St, City, State',
      password: '******', // Hidden for security
      totalAppointments: 12,
      lastAppointment: '2024-05-15',
      joinDate: '2024-03-01',
      status: 'active'
    },
    {
      email: 'lisa.chen@email.com',
      name: 'Lisa Chen',
      phone_number: '+1-555-0202',
      profile_picture: null,
      age: 28,
      gender: 'F',
      address: '456 Oak Ave, City, State',
      password: '******',
      totalAppointments: 8,
      lastAppointment: '2024-05-20',
      joinDate: '2024-01-20',
      status: 'active'
    },
    {
      email: 'robert.davis@email.com',
      name: 'Robert Davis',
      phone_number: '+1-555-0203',
      profile_picture: null,
      age: 42,
      gender: 'M',
      address: '789 Pine St, City, State',
      password: '******',
      totalAppointments: 3,
      lastAppointment: '2024-04-10',
      joinDate: '2023-12-15',
      status: 'suspended'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone_number.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setSelectedClient(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = (email) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all their appointments.')) {
      setClients(prev => prev.filter(c => c.email !== email));
    }
  };

  const handleStatusChange = (email, newStatus) => {
    setClients(prev => prev.map(c => 
      c.email === email ? { ...c, status: newStatus } : c
    ));
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ClientModal = () => {
    const [formData, setFormData] = useState(selectedClient || {
      email: '',
      name: '',
      phone_number: '',
      age: '',
      gender: '',
      address: '',
      password: ''
    });

    const handleSubmit = () => {
      if (modalMode === 'add') {
        const newClient = {
          ...formData,
          profile_picture: null,
          totalAppointments: 0,
          lastAppointment: null,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setClients(prev => [...prev, newClient]);
      } else if (modalMode === 'edit') {
        setClients(prev => prev.map(c => 
          c.email === selectedClient.email ? { ...c, ...formData } : c
        ));
      }
      
      setShowModal(false);
    };

    if (!showModal) return null;

    const isViewMode = modalMode === 'view';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {modalMode === 'add' ? 'Add New Client' : 
             modalMode === 'edit' ? 'Edit Client' : 'Client Details'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={isViewMode || modalMode === 'edit'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={isViewMode}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone_number || ''}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={isViewMode}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || ''})}
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isViewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={isViewMode}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows="2"
                disabled={isViewMode}
              />
            </div>
            
            {modalMode === 'add' && (
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            )}
            
            {isViewMode && selectedClient && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Appointments:</span>
                  <span className="text-sm font-medium">{selectedClient.totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Appointment:</span>
                  <span className="text-sm font-medium">{selectedClient.lastAppointment || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Join Date:</span>
                  <span className="text-sm font-medium">{selectedClient.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={selectedClient.status} />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Create' : 'Update'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client database</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Demographics</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Appointments</th>
                <th className="text-left p-4 font-medium">Last Visit</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.email} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>{client.phone_number}</div>
                    {client.address && (
                      <div className="text-sm text-gray-600 truncate max-w-32">
                        {client.address}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {client.age && <span>Age: {client.age}</span>}
                      {client.age && client.gender && <span> • </span>}
                      {client.gender && <span>{client.gender === 'M' ? 'Male' : 'Female'}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="p-4">{client.totalAppointments}</td>
                  <td className="p-4">
                    {client.lastAppointment || 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleView(client)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.email)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <select
                        value={client.status}
                        onChange={(e) => handleStatusChange(client.email, e.target.value)}
                        className="text-xs border rounded px-2 py-1 ml-1"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No clients found matching your criteria.
          </div>
        )}
      </div>

      <ClientModal />
    </div>
  );
};

export default ClientsPage;