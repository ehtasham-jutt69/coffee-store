import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IAddress } from '../../types';

export const Addresses: React.FC = () => {
  const { user, addAddress, deleteAddress } = useAuth();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [apartment, setApartment] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('WA');
  const [postalCode, setPostalCode] = useState<string>('');
  const [country, setCountry] = useState<string>('United States');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: IAddress = {
      fullName,
      phone,
      street,
      apartment,
      city,
      state,
      postalCode,
      country,
      isDefault
    };

    const success = await addAddress(newAddr);
    if (success) {
      setIsAdding(false);
      setFullName('');
      setPhone('');
      setStreet('');
      setApartment('');
      setCity('');
      setPostalCode('');
    }
  };

  return (
    <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Shipping Destinations</h2>
          <p className="text-xs text-espresso-400 mt-0.5">Manage delivery locations for coffee orders.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
          >
            + Add New Address
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-8 p-6 bg-espresso-950 rounded-2xl border border-espresso-750 space-y-4">
          <h3 className="font-serif text-base font-bold text-white mb-2">New Delivery Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Recipient Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marcus Romero"
                className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Street Address *</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Pike St"
                className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Apartment / Suite (Optional)</label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Ste 400"
                className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Seattle"
                className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-espresso-300 block mb-1 font-semibold">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="WA"
                  className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-espresso-300 block mb-1 font-semibold">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="98101"
                  className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <label htmlFor="isDefaultCheck" className="text-xs text-espresso-300 cursor-pointer">
              Set as primary default address
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs text-espresso-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!user?.addresses || user.addresses.length === 0) ? (
          <p className="text-xs text-espresso-400 col-span-2">No saved addresses yet.</p>
        ) : (
          user.addresses.map((addr) => (
            <div key={addr._id} className="p-5 bg-espresso-950 rounded-xl border border-espresso-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-xs">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-espresso-300 leading-relaxed">
                  {addr.street} {addr.apartment && `, ${addr.apartment}`}<br />
                  {addr.city}, {addr.state} {addr.postalCode}<br />
                  {addr.country}
                </p>
                <p className="text-[11px] text-espresso-400 mt-2 font-mono">{addr.phone}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-espresso-850 flex justify-end">
                {addr._id && (
                  <button
                    onClick={() => deleteAddress(addr._id!)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
