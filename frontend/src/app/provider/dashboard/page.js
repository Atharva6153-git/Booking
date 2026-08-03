'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ProviderDashboard() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '', durationMinutes: 60, area: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const res = await api.get('/services/provider/my');
      setServices(res.data.services);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateService = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/services', { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) });
      setMessage('Service created successfully!');
      setForm({ title: '', category: '', description: '', price: '', durationMinutes: 60, area: '' });
      setShowForm(false);
      fetchMyServices();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create service');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Services</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white rounded px-4 py-2">
          {showForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}

      {showForm && (
        <form onSubmit={handleCreateService} className="bg-white rounded-lg shadow p-6 mb-6 space-y-3">
          <input name="title" placeholder="Service Title" value={form.title} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="category" placeholder="Category (e.g. Plumbing)" value={form.category} onChange={handleChange} className="w-full border rounded p-2" required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
          <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="durationMinutes" type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={handleChange} className="w-full border rounded p-2" />
          <input name="area" placeholder="Area (e.g. Dombivli)" value={form.area} onChange={handleChange} className="w-full border rounded p-2" required />
          <button type="submit" className="bg-green-600 text-white rounded px-4 py-2">Create Service</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500">You haven't created any services yet.</p>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{service.title}</h2>
                <p className="text-sm text-gray-500">{service.category} • {service.area}</p>
                <p className="text-sm font-bold">₹{service.price}</p>
              </div>
              <a href={`/provider/availability/${service._id}`} className="text-blue-600 text-sm">
                Manage Slots
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}