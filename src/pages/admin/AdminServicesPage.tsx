import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { useStoreData, DataStore } from '../../lib/store';
import { Service } from '../../types';

export const AdminServicesPage: React.FC = () => {
  const { services, categories } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: categories[0]?.id || 'cat-cleaning',
    price: 499,
    originalPrice: 799,
    durationMinutes: 60,
    shortDescription: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    isPopular: false,
    isActive: true,
    includedItems: 'Thorough inspection\nDeep vacuuming\nHygiene mist spray',
  });

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return q === '' || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormData({
      title: '',
      slug: '',
      categoryId: categories[0]?.id || 'cat-cleaning',
      price: 499,
      originalPrice: 799,
      durationMinutes: 60,
      shortDescription: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
      isPopular: false,
      isActive: true,
      includedItems: 'Thorough inspection\nDeep vacuuming\nHygiene mist spray',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingServiceId(service.id);
    setFormData({
      title: service.title,
      slug: service.slug,
      categoryId: service.categoryId,
      price: service.price,
      originalPrice: service.originalPrice || service.price + 300,
      durationMinutes: service.durationMinutes,
      shortDescription: service.shortDescription,
      description: service.description,
      imageUrl: service.imageUrl,
      isPopular: service.isPopular || false,
      isActive: service.isActive !== false,
      includedItems: service.includedItems?.join('\n') || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await DataStore.deleteService(id);
      await DataStore.syncWithBackend();
    }
  };

  const handleToggleActive = async (service: Service) => {
    await DataStore.updateService(service.id, { isActive: !service.isActive });
    await DataStore.syncWithBackend();
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCategory = categories.find((c) => c.id === formData.categoryId);
    const generatedSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const includedList = formData.includedItems
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingServiceId) {
      await DataStore.updateService(editingServiceId, {
        title: formData.title,
        slug: generatedSlug,
        categoryId: formData.categoryId,
        categorySlug: selectedCategory?.slug,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        durationMinutes: Number(formData.durationMinutes),
        shortDescription: formData.shortDescription,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        includedItems: includedList,
      });
    } else {
      await DataStore.addService({
        title: formData.title,
        slug: generatedSlug,
        categoryId: formData.categoryId,
        categorySlug: selectedCategory?.slug,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        durationMinutes: Number(formData.durationMinutes),
        shortDescription: formData.shortDescription,
        description: formData.description,
        imageUrl: formData.imageUrl,
        rating: 4.85,
        reviewCount: 0,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        includedItems: includedList,
        excludedItems: [],
        faqList: [],
      });
    }

    await DataStore.syncWithBackend();
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Services Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add new home services, configure rate cards, manage durations, and toggle catalog visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Plus size={15} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog services..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Services: <strong className="text-slate-900">{filteredServices.length}</strong>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] bg-slate-50 font-semibold">
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredServices.map((service) => {
                const category = categories.find((c) => c.id === service.categoryId);
                return (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="max-w-xs">
                          <div className="font-semibold text-slate-900 line-clamp-1">{service.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{service.shortDescription}</div>
                          {service.isPopular && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 mt-1">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                        {category?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {BRAND_CONFIG.currency.symbol}{service.price}
                      {service.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through font-normal">
                          {BRAND_CONFIG.currency.symbol}{service.originalPrice}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {service.durationMinutes} mins
                    </td>

                    <td className="py-3.5 px-4 font-medium text-amber-700">
                      ★ {service.rating} ({service.reviewCount})
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          service.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {service.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{service.isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit Service"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id, service.title)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-0.5">
              {editingServiceId ? 'Edit Service Details' : 'Add New Home Service'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in pricing, duration, features, and photographic asset details.
            </p>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chimney & Hob Deep Cleaning"
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. chimney-deep-cleaning"
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Short Description</label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief 1-sentence synopsis"
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    What is Included (One item per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.includedItems}
                    onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span>Highlight as Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span>Active in Public Catalog</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                >
                  {editingServiceId ? 'Save Changes' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
