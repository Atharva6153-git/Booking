'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', area: '', search: '' });
  const [smartSort, setSmartSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchServices = async (useSmartSort, currentFilters) => {
    setLoading(true);
    try {
      const f = currentFilters || filters;
      const params = {};
      if (f.category) params.category = f.category;
      if (f.area) params.area = f.area;
      if (f.search) params.search = f.search;
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
    fetchServices(false);

    // Real-time: auto-refresh when any provider creates/updates a service
    const socket = getSocket();
    const handleServicesUpdated = () => fetchServices(smartSort);
    socket.on('servicesUpdated', handleServicesUpdated);
    return () => socket.off('servicesUpdated', handleServicesUpdated);
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

  const inputCls = "border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950 p-4 sm:p-6 md:p-12 w-full">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white mb-2">Explore Services</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Find the right professional for your needs.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              name="search"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange}
              suppressHydrationWarning
              className={`flex-1 ${inputCls}`}
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-3 text-sm font-medium text-black dark:text-white bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle filters"
            >
              ⚙
            </button>
            <button
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-5 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Search
            </button>
          </div>

          <div className={`gap-3 grid grid-cols-2 md:flex ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <input name="category" placeholder="Category" value={filters.category} onChange={handleFilterChange} suppressHydrationWarning className={`w-full md:w-36 ${inputCls}`} />
            <input name="area" placeholder="Area" value={filters.area} onChange={handleFilterChange} suppressHydrationWarning className={`w-full md:w-36 ${inputCls}`} />
          </div>
        </form>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{services.length} services found</p>
          <button
            onClick={toggleSmartSort}
            className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              smartSort
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800'
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
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service) => (
              <a
                key={service._id}
                href={`/services/${service._id}`}
                className="group block border border-gray-100 dark:border-neutral-800 rounded-xl p-4 sm:p-5 hover:border-black dark:hover:border-white hover:shadow-sm transition-all duration-200 bg-white dark:bg-neutral-900 active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-2 py-1 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded uppercase tracking-wider">{service.category}</span>
                  <p className="font-bold text-lg text-black dark:text-white">₹{service.price}</p>
                </div>
                <h2 className="font-semibold text-xl text-black dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{service.area}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{service.provider?.name}</span>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-neutral-800">
                  <span className="text-sm font-medium text-black dark:text-white">★ {service.avgRating?.toFixed(1) || 'New'}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{service.totalBookings} bookings</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
