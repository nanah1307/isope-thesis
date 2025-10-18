'use client';

import { useState } from 'react';

export default function OrgsDashboard() {
  const [orgs, setOrgs] = useState([
    {
      id: 1,
      name: "Central Student Organization",
      avatar: "",
      leftNotifications: 2,
      progress: 85,
      rightNotifications: 1,
      members: 245
    },
    {
      id: 2,
      name: "Compile",
      avatar: "",
      leftNotifications: 3,
      progress: 72,
      rightNotifications: 2,
      members: 156
    },
    {
      id: 3,
      name: "Optics",
      avatar: "",
      leftNotifications: 1,
      progress: 60,
      rightNotifications: 0,
      members: 98
    },
    {
      id: 4,
      name: "Pikzel Graphic Design",
      avatar: "",
      leftNotifications: 2,
      progress: 78,
      rightNotifications: 3,
      members: 187
    },
    {
      id: 5,
      name: "Rhythm",
      avatar: "",
      leftNotifications: 99,
      progress: 91,
      rightNotifications: 1,
      members: 203
    },
    {
      id: 6,
      name: "Elix Esports",
      avatar: "",
      leftNotifications: 4,
      progress: 65,
      rightNotifications: 2,
      members: 412
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', avatar: '' });

  const handleCreateOrg = () => {
    if (formData.name.trim()) {
      const newOrg = {
        id: Math.max(...orgs.map(o => o.id), 0) + 1,
        name: formData.name,
        avatar: '',
        leftNotifications: 0,
        progress: 0,
        rightNotifications: 0,
        members: 0
      };
      setOrgs([...orgs, newOrg]);
      setFormData({ name: '', avatar: '' });
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Create Org Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Hello, OSAS</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            Create Organization
          </button>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 relative"
            >
              {/* Left Notifications */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                  {org.leftNotifications}
                </div>
              </div>

              {/* Center Content */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-blue-100 flex items-center justify-center text-3xl">
                    {org.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-green-500">
                    <span className="text-xs font-bold text-green-600">{org.progress}%</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">{org.name}</h2>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
                  View Organization
                </button>
              </div>

              {/* Right Notifications */}
              <div className="absolute right-4 top-4 flex flex-col gap-2 items-end">
                <div className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                  {org.rightNotifications}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Organization</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateOrg()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Email:
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="Enter image URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrg}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}