'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', area: '', search: '' });
  const [smartSort, setSmartSort] = useState(false);

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
    <div className="min-h-[calc(100vh-73px)] bg-white p-6 md:p-12 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black mb-2">Explore Services</h1>
            <p className="text-gray-500">Find the right professional for your needs.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
            <input
              name="search"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleFilterChange}
              className="border border-gray-200 rounded-md p-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all flex-1 min-w-[200px]"
            />
            <input
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border border-gray-200 rounded-md p-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all hidden md:block w-32"
            />
            <input
              name="area"
              placeholder="Area"
              value={filters.area}
              onChange={handleFilterChange}
              className="border border-gray-200 rounded-md p-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all hidden md:block w-32"
            />
            <button type="submit" className="bg-black text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors">
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-gray-500 font-medium">{services.length} services found</p>
          <button
            onClick={toggleSmartSort}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              smartSort ? 'bg-black text-white' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
            }`}
          >
            {smartSort ? '★ Smart Match ON' : 'Sort by Smart Match'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <a key={service._id} href={`/services/${service._id}`} className="group block border border-gray-100 rounded-xl p-5 hover:border-black hover:shadow-sm transition-all duration-200 bg-white">
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