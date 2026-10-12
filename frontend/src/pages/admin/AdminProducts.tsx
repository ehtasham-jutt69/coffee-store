import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { IProduct, ICategory } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Single Origin');
  const [roastLevel, setRoastLevel] = useState<string>('Medium');
  const [origin, setOrigin] = useState<string>('Ethiopia');
  const [price, setPrice] = useState<number>(18.50);
  const [salePrice, setSalePrice] = useState<string>('');
  const [inventory, setInventory] = useState<number>(45);
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tastingNotes, setTastingNotes] = useState<string>('Jasmine, Bergamot, Peach');
  const [imageUrl, setImageUrl] = useState<string>('/images/arab-mol-product.jpg');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories()
      ]);
      if (prodRes.success && prodRes.products) setProducts(prodRes.products);
      if (catRes.success && catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Single Origin');
    setRoastLevel('Medium');
    setOrigin('Ethiopia');
    setPrice(19.00);
    setSalePrice('');
    setInventory(50);
    setShortDescription('Fresh micro-lot with radiant acidity and honey sweetness.');
    setDescription('Direct trade lot sourced from high altitude smallholder cooperatives.');
    setTastingNotes('Black Cherry, Cocoa Nib, Honey');
    setImageUrl('/images/arab-mol-product.jpg');
    setIsModalOpen(true);
  };

  const openEditModal = (p: IProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setRoastLevel(p.roastLevel || 'Medium');
    setOrigin(p.origin || '');
    setPrice(p.price);
    setSalePrice(p.salePrice ? String(p.salePrice) : '');
    setInventory(p.inventory);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setTastingNotes(p.tastingNotes ? p.tastingNotes.join(', ') : '');
    setImageUrl(p.images[0] || '/images/arab-mol-product.jpg');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        name,
        category,
        roastLevel,
        origin,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        inventory: Number(inventory),
        shortDescription,
        description,
        tastingNotes: tastingNotes.split(',').map(n => n.trim()).filter(Boolean),
        images: [imageUrl]
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct._id, payload);
        if (res.success && res.product) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.product : p));
          showToast(`Updated product "${res.product.name}".`);
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success && res.product) {
          setProducts([res.product, ...products]);
          showToast(`Added new coffee "${res.product.name}" to catalog.`);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from roastery records?`)) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        showToast(`Removed "${prodName}".`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.origin?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Coffee Catalog & Stock</h1>
          <p className="text-xs text-espresso-400 mt-1">Manage bag specifications, roast matrices, origin lots, and inventory levels.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Coffee
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coffee name or origin..."
          className="bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-espresso-500 min-w-[240px] focus:outline-none focus:border-amber-500"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-200 focus:outline-none focus:border-amber-500"
        >
          <option value="">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <span className="text-xs text-espresso-400 ml-auto">
          Showing <strong className="text-amber-400">{filteredProducts.length}</strong> coffees
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-espresso-400">Loading catalog offerings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950/80 border-b border-espresso-800 text-espresso-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Coffee</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Roast Level</th>
                  <th className="py-3 px-4 font-semibold">Origin</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-850">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-espresso-850/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || '/images/arab-mol-product.jpg'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-espresso-950 border border-espresso-800 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-[10px] text-espresso-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-espresso-300">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-espresso-950 text-amber-300 border border-espresso-800">
                        {p.roastLevel || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-espresso-300">{p.origin || 'Micro-Lots'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.inventory > 10 ? 'bg-emerald-500/20 text-emerald-300' :
                        p.inventory > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {p.inventory} bags
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ${p.price.toFixed(2)}
                      {p.salePrice && <span className="text-amber-400 text-[10px] block">Sale: ${p.salePrice}</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1 bg-espresso-800 hover:bg-espresso-750 text-espresso-200 hover:text-white rounded text-[11px] border border-espresso-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="px-2.5 py-1 text-rose-400 hover:bg-rose-500/10 rounded text-[11px]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-espresso-900 border border-espresso-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Coffee to Roastery'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-espresso-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Coffee Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Guji Highland Ethiopian Heirloom"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Single Origin">Single Origin</option>
                    <option value="Artisanal Blends">Artisanal Blends</option>
                    <option value="Dark Roasts">Dark Roasts</option>
                    <option value="Flavored Roasts">Flavored Roasts</option>
                    <option value="Cold Brew">Cold Brew</option>
                    <option value="Decaf & Rare">Decaf & Rare</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Roast Profile</label>
                  <select
                    value={roastLevel}
                    onChange={(e) => setRoastLevel(e.target.value)}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Light">Light Roast</option>
                    <option value="Medium-Light">Medium-Light Roast</option>
                    <option value="Medium">Medium Roast</option>
                    <option value="Medium-Dark">Medium-Dark Roast</option>
                    <option value="Dark">Dark Roast</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Origin Terroir</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Yirgacheffe, Ethiopia"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Inventory (Bags)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventory}
                    onChange={(e) => setInventory(Number(e.target.value))}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Sale Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="e.g. 16.50"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Cupping Notes (Comma-separated)</label>
                  <input
                    type="text"
                    value={tastingNotes}
                    onChange={(e) => setTastingNotes(e.target.value)}
                    placeholder="e.g. Jasmine, Wild Honey, Meyer Lemon"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Image Asset Path</label>
                  <select
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="/images/arab-mol-product.jpg">Signature Arabica Bag (Single Origin)</option>
                    <option value="/images/dark-espresso-shot-bag.jpg">Dark Espresso Shot Bag</option>
                    <option value="/images/hazelnut-brew-bag.jpg">Toasted Hazelnut Blend Bag</option>
                    <option value="/images/french-vanilla-bag.jpg">French Vanilla Infusion Bag</option>
                    <option value="/images/espresso-extraction.jpg">Espresso Extraction Art</option>
                    <option value="/images/cappuccino-latte-art.jpg">Cappuccino Cup Display</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Short Headline</label>
                  <input
                    type="text"
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Short punchy roast tagline"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-espresso-300 block mb-1 font-semibold">Full Terroir Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-espresso-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-espresso-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Coffee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
