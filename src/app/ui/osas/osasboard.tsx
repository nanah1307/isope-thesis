'use client';
import { useState, FC } from 'react';
import Link from 'next/link';
import { orgProp } from '@/app/lib/definitions';

interface OrgCardProps {
  org: orgProp;
  onView?: (org: orgProp) => void;
}

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, email: string) => void;
}

// Org Card Component
const OrgCard: FC<OrgCardProps> = ({ org, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 relative">
      {/* Left Notifications */}
      <div className="absolute left-4 top-4">
        <div 
          className="relative inline-flex items-center justify-center cursor-pointer"
          onClick={() => alert(`${org.name}\n\nYou have ${org.leftNotifications} alert${org.leftNotifications !== 1 ? 's' : ''}`)}
        >
          <div className="bg-blue-600 rounded-full p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          {org.leftNotifications > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {org.leftNotifications > 10 ? '9+' : org.leftNotifications}
            </div>
          )}
        </div>
      </div>

      {/* Right Notifications */}
      <div className="absolute right-4 top-4">
        <div 
          className="relative inline-flex items-center justify-center cursor-pointer"
          onClick={() => alert(`${org.name}\n\nYou have ${org.rightNotifications} due${org.rightNotifications !== 1 ? 's' : ''}`)}
        >
          <div className="bg-blue-600 rounded-full p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          {org.rightNotifications > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {org.rightNotifications}
            </div>
          )}
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

        <Link
         href={`/${org.name}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
        >
          View Organization
        </Link>
      </div>
    </div>
  );
};

// Create Organization Modal
const CreateOrgModal: FC<CreateOrgModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  if (!isOpen) return null;

  const handleCreate = () => {
    if (formData.name.trim()) {
      onCreate(formData.name, formData.email);
      setFormData({ name: '', email: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Organization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrgsDashboard: FC = () => {
  const [orgs, setOrgs] = useState<orgProp[]>([
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
      progress: 1,
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

  const handleCreateOrg = (name: string, email: string) => {
    const newOrg: orgProp = {
      id: Math.max(...orgs.map(o => o.id), 0) + 1,
      name: name,
      avatar: '',
      leftNotifications: 0,
      progress: 0,
      rightNotifications: 0,
      members: 0
    };
    setOrgs([...orgs, newOrg]);
    setShowModal(false);
  };

  const handleViewOrg = (org: orgProp) => {
    alert(
      `Viewing ${org.name}\n\n` +
      `Members: ${org.members}\n` +
      `Progress: ${org.progress}%\n` +
      `Alerts: ${org.leftNotifications}\n` +
      `Dues: ${org.rightNotifications}\n` +
      `Total Notifications: ${org.leftNotifications + org.rightNotifications}`
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-full min-h-screen p-4 sm:p-6 lg:p-8 lg:pr-[22rem] xl:pr-[26rem]">
      {/* Header with Create Org Button */}
      <div className="flex justify-between items-center mb-6 lg:mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Hello, OSAS</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-colors shadow-lg text-sm lg:text-base cursor-pointer"
        >
          Create Organization
        </button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {orgs.map((org) => (
          <OrgCard 
            key={org.id} 
            org={org} 
            onView={handleViewOrg}
          />
        ))}
      </div>

      {/* Create Organization Modal */}
      <CreateOrgModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateOrg}
      />
    </div>
  );
};

export default OrgsDashboard;