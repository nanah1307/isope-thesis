'use client';
import { useEffect, useState, FC } from 'react';
import Link from 'next/link';
import { BellIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/database';

// Org Card
const OrgCard: FC<{ org: any }> = ({ org }) => {
  const [progress] = useState(() => Math.floor(Math.random() * 80) + 10);

  // Circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">

      {/* card */}
      <Link
        href={`./dashboard/orgs/${org.username}`}
        className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full cursor-pointer"
      >
        <div className="flex flex-col items-center text-center mt-6">

          {/* === Progress Circle Surrounding Avatar === */}
          <div className="relative flex items-center justify-center mb-6">

        {/* Progress Circle */}
        <svg width="120" height="120" className="absolute">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth="6"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            stroke="#2563eb"
            fill="transparent"
            strokeWidth="6"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.35s',
            }}
            r={radius}
            cx="60"
            cy="60"
          />
        </svg>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-3xl relative z-10">
          {org.avatar || org.name[0]}
        </div>

        {/* === Progress num % Bottom-Right === */}
        <div className="absolute bottom-1 right-1 bg-white shadow-sm rounded-full px-2 py-1 text-xs font-semibold text-blue-600 z-20">
          {progress}%
        </div>
      </div>


          {/* Org Name (underline on card hover) */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:underline">
            {org.name}
          </h2>
        </div>
      </Link>

      {/* Notification Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="cursor-pointer absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center w-10 h-10 transition"
      >
        <BellIcon className="w-6 h-6" />
      </button>

      {/* Dues Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="cursor-pointer absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center w-10 h-10 transition"
      >
        <DocumentIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

// Create Organization Modal
const CreateOrgModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, email: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (name.trim() && email.trim()) {
      onCreate(name, email);
      setName('');
      setEmail('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Create Organization</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Organization Email */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Organization Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="cursor-pointer text-black px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="cursor-pointer text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard
const OrgsDashboard: FC = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, error } = await supabase.from('orgs').select('*');
      if (error) console.error('Error fetching orgs:', error.message);
      else setOrgs(data);
      setLoading(false);
    };
    fetchOrgs();
  }, []);

  const handleCreateOrg = (name: string, email: string) => {
    const newOrg = {
      id: Date.now(),
      name,
      username: name.toLowerCase(),
      avatar: '',
      email,
    };
    setOrgs([...orgs, newOrg]);
  };

  if (loading) return <div className="p-4 text-black">Loading organizations...</div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">DASHBOARD</h1>
          <p className="text-black">Hello, user</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create Organization
        </button>
      </div>

      {orgs.length === 0 ? (
        <p className="text-black">No organizations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((org) => (
            <OrgCard key={org.username} org={org} />
          ))}
        </div>
      )}

      <CreateOrgModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateOrg}
      />
    </div>
  );
};

export default OrgsDashboard;
