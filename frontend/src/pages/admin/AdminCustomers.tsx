import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { IUser } from '../../types';

export const AdminCustomers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminUsers();
        if (res.success && res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Roastery Patrons & Members</h1>
        <p className="text-xs text-espresso-400 mt-1">Directory of registered coffee club customers and administrative team members.</p>
      </div>

      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-4 flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patron name or email..."
          className="bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-espresso-500 min-w-[260px] focus:outline-none focus:border-amber-500"
        />
        <span className="text-xs text-espresso-400">
          Total Registered: <strong className="text-amber-400">{filteredUsers.length}</strong>
        </span>
      </div>

      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-espresso-400">Loading patron records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950/80 border-b border-espresso-800 text-espresso-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Patron Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Addresses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-850">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-espresso-850/30 transition-colors">
                    <td className="py-3 px-4 text-white font-semibold flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {u.firstName?.[0] || 'U'}
                      </div>
                      <span>{u.firstName} {u.lastName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-espresso-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role === 'admin' ? 'Roastery Staff' : 'Patron'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-espresso-400">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-espresso-400">{u.addresses?.length || 0} saved</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
