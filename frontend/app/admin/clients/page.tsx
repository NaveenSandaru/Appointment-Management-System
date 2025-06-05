"use client";
import React, { useState, useEffect } from 'react';
import { Search, User, Plus } from 'lucide-react';
import axios from 'axios';

interface Client {
  email: string;
  name: string;
  phone_number: string;
  profile_picture: string | null;
  age?: number;
  gender?: 'M' | 'F';
  address?: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseURL}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone_number.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">View client database</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Search Bar */}
        <div className="p-4 border-b">
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
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Demographics</th>
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
                          {client.age !== undefined && <span>Age: {client.age}</span>}
                          {client.age !== undefined && client.gender && <span> • </span>}
                          {client.gender && <span>{client.gender === 'M' ? 'Male' : 'Female'}</span>}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;