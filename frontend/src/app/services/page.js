'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', area: '', search: '' });
  const [smartSort, setSmartSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchServices = async (useSmartSort) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.area) params.area = filters.area;
      if (filters.search) params.search = filters.search;
      if (useSmartSort) params.sort = 'smart';

      const res = await api.get('/services', { params });
      setServices(res.data.services);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(smartSort);
  }, []);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices(smartSort);
  };

  const toggleSmartSort = () => {
    const next = !smartSort;
    setSmartSort(next);
    fetchServices(next);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white p-4 sm:p-6 md:p-12 w-full">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2">Explore Services</h1>
          <p className="text-gray-500 text-sm sm:text-base">Find the right professional for your needs.</p>
        </div>

        {/* Search + filters */}
        <form onSubmit={handleSearch} className="mb-6">
          {/* Search bar row */}
          <div className="flex gap-2 mb-3">
            <input
              name="search"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange}
              suppressHydrationWarning
              className="flex-1 border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
            {/* Toggle filters on mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden border border-gray-200 rounded-lg px-3 py-3 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              aria-label="Toggle filters"
            >
              ⚙
            </button>
            <button
              type="submit"
              className="bg-black text-white rounded-lg px-5 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category + Area filters — always visible on md, toggleable on mobile */}
          <div className={`gap-3 grid grid-cols-2 md:flex ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <input
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
              suppressHydrationWarning
              className="border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all w-full md:w-36"
            />
            <input
              name="area"
              placeholder="Area"
              value={filters.area}
              onChange={handleFilterChange}
              suppressHydrationWarning
              className="border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all w-full md:w-36"
            />
          </div>
        </form>

        {/* Count + smart sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 font-medium">{services.length} services found</p>
          <button
            onClick={toggleSmartSort}
            className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              smartSort ? 'bg-black text-white' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
            }`}
          >
            {smartSort ? '★ Smart Match ON' : 'Smart Match'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service) => (
              <a
                key={service._id}
                href={`/services/${service._id}`}
                className="group block border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-black hover:shadow-sm transition-all duration-200 bg-white active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded uppercase tracking-wider">
                    {service.category}
                  </span>
                  <p className="font-bold text-lg text-black">₹{service.price}</p>
                </div>

                <h2 className="font-semibold text-xl text-black mb-1 group-hover:text-blue-600 transition-colors">{service.title}</h2>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">{service.area}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{service.provider?.name}</span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <span className="text-sm font-medium text-black">★ {service.avgRating?.toFixed(1) || 'New'}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{service.totalBookings} bookings</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
