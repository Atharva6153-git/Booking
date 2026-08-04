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
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-4 sm:p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-2">My Services</h1>
            <p className="text-gray-500 text-sm sm:text-base">Manage your service offerings and availability.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="w-full sm:w-auto bg-black text-white rounded-md px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors active:scale-[0.97]"
          >
            {showForm ? 'Cancel' : '+ Add Service'}
          </button>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 text-black text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateService} className="border border-gray-100 rounded-2xl p-6 md:p-8 mb-10 bg-white shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold text-black mb-6">Create New Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="title" placeholder="Service Title" value={form.title} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" required />
              <input name="category" placeholder="Category (e.g. Plumbing)" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" required />
              <div className="md:col-span-2">
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all h-24 resize-none" />
              </div>
              <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" required />
              <input name="durationMinutes" type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              <input name="area" placeholder="Area (e.g. Dombivli)" value={form.area} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all md:col-span-2" required />
            </div>
            <button type="submit" className="w-full md:w-auto bg-black text-white rounded-lg px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
              Publish Service
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500 mb-4">You haven't created any services yet.</p>
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-black text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Create your first service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service._id} className="border border-gray-100 rounded-2xl p-6 hover:border-black transition-colors bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded uppercase tracking-widest border border-gray-100">
                      {service.category}
                    </span>
                    <p className="font-bold text-lg text-black">₹{service.price}</p>
                  </div>
                  <h2 className="font-bold text-xl text-black mb-2">{service.title}</h2>
                  <p className="text-sm text-gray-500 font-medium mb-6">{service.area}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-50">
                  <a href={`/provider/availability/${service._id}`} className="text-black text-sm font-medium hover:underline inline-flex items-center gap-1">
                    Manage Slots &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}