import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState<string>(user?.firstName || '');
  const [lastName, setLastName] = useState<string>(user?.lastName || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ firstName, lastName, phone });
    setSaving(false);
  };

  return (
    <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8">
      <h2 className="font-serif text-2xl font-bold text-white mb-2">Profile & Preferences</h2>
      <p className="text-xs text-espresso-400 mb-6">
        Update your personal details and contact information.
      </p>

      <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-espresso-300 block mb-1 font-semibold">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-espresso-300 block mb-1 font-semibold">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-espresso-300 block mb-1 font-semibold">Email Address (Read-Only)</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full bg-espresso-950/50 border border-espresso-800 rounded-xl px-3.5 py-2.5 text-xs text-espresso-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs text-espresso-300 block mb-1 font-semibold">Contact Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all mt-2"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
