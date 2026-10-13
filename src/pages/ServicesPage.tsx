import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { useStoreData, DataStore } from '../lib/store';
import { ServiceCard } from '../components/common/ServiceCard';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, services, selectedCity } = useStoreData();

  useEffect(() => {
    DataStore.syncWithBackend();
  }, []);

  const categoryQuery = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Filter & sort logic
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        if (!s.isActive) return false;

        if (selectedCategory !== 'all') {
          if (s.categoryId !== selectedCategory && s.categorySlug !== selectedCategory) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchDesc = s.description.toLowerCase().includes(q);
          const matchCat = s.categorySlug?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [services, selectedCategory, searchQuery, sortBy]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Realistic Verified Service Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-8 text-white shadow-sm">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80"
              alt="HomeEase Junagadh Verified Service Specialists"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-8 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-3">
              <ShieldCheck size={13} />
              <span>100% Background-Verified Professionals in Junagadh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Home Services Catalog
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Book certified specialists for {selectedCity} and across Gujarat. Equipped with specialized machinery, eco-friendly supplies, and guaranteed upfront flat rates.
            </p>
          </div>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service name or keyword..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
              <ArrowUpDown size={12} />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6">
          <button
            type="button"
            onClick={() => handleCategoryClick('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Results Counter and Filter Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
          <div>
            Showing <strong className="text-slate-800">{filteredServices.length}</strong> available services
          </div>
          {(selectedCategory !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <X size={12} />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Filter size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No services match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Try adjusting your search query or selecting a different category.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
