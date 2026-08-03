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
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Services</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-4 flex-wrap">
        <input
          name="search"
          placeholder="Search by title"
          value={filters.search}
          onChange={handleFilterChange}
          className="border rounded p-2"
        />
        <input
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border rounded p-2"
        />
        <input
          name="area"
          placeholder="Area"
          value={filters.area}
          onChange={handleFilterChange}
          className="border rounded p-2"
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
          Search
        </button>
      </form>

      <button
        onClick={toggleSmartSort}
        className={`mb-6 rounded px-4 py-2 text-sm ${
          smartSort ? 'bg-purple-600 text-white' : 'bg-white border text-gray-700'
        }`}
      >
        {smartSort ? '★ Smart Match ON' : 'Sort by Smart Match'}
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <a key={service._id} href={`/services/${service._id}`} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <h2 className="font-semibold text-lg">{service.title}</h2>
              <p className="text-sm text-gray-500">{service.category} • {service.area}</p>
              <p className="text-sm text-gray-500">by {service.provider?.name}</p>
              <p className="mt-2 font-bold">₹{service.price}</p>
              <p className="text-sm text-yellow-600">★ {service.avgRating?.toFixed(1) || 'New'} • {service.totalBookings} bookings</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}