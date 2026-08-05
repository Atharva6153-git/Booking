'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/lib/socket';

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '', durationMinutes: 60, area: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    // Only redirect to login if there is genuinely no user (no cookie, no cache)
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'provider') { router.replace('/services'); return; }

    fetchMyServices();

    const socket = getSocket();
    const onServicesUpdated = () => fetchMyServices();
    socket.on('servicesUpdated', onServicesUpdated);
    return () => socket.off('servicesUpdated', onServicesUpdated);
  }, [ready, user]);

  const fetchMyServices = async () => {
    setLoading(true);
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
      await api.post('/services', {
        ...form,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
      });
      setMessage('Service created successfully!');
      setForm({ title: '', category: '', description: '', price: '', durationMinutes: 60, area: '' });
      setShowForm(false);
      // fetchMyServices is triggered via the socket event 'servicesUpdated'
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create service');
    }
  };

  const inputCls = "w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";

  // Show spinner while auth is being confirmed
  if (!ready) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950 w-full p-4 sm:p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white mb-2">My Services</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Manage your service offerings and availability.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black rounded-md px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors active:scale-[0.97]"
          >
            {showForm ? 'Cancel' : '+ Add Service'}
          </button>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateService} className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 md:p-8 mb-10 bg-white dark:bg-neutral-900 shadow-sm">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6">Create New Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="title" placeholder="Service Title" value={form.title} onChange={handleChange} className={inputCls} required />
              <input name="category" placeholder="Category (e.g. Plumbing)" value={form.category} onChange={handleChange} className={inputCls} required />
              <div className="md:col-span-2">
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputCls} h-24 resize-none`} />
              </div>
              <input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleChange} className={inputCls} required />
              <input name="durationMinutes" type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={handleChange} className={inputCls} />
              <input name="area" placeholder="Area (e.g. Dombivli)" value={form.area} onChange={handleChange} className={`${inputCls} md:col-span-2`} required />
            </div>
            <button type="submit" className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black rounded-lg px-8 py-3 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Publish Service
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50/50 dark:bg-neutral-900/50">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t created any services yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-black dark:bg-white text-white dark:text-black rounded-md px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Create your first service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service._id} className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 hover:border-black dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded uppercase tracking-widest border border-gray-100 dark:border-neutral-700">
                      {service.category}
                    </span>
                    <p className="font-bold text-lg text-black dark:text-white">₹{service.price}</p>
                  </div>
                  <h2 className="font-bold text-xl text-black dark:text-white mb-2">{service.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{service.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">{service.area} · {service.durationMinutes} min</p>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-neutral-800">
                  <a
                    href={`/provider/availability/${service._id}`}
                    className="text-black dark:text-white text-sm font-medium hover:underline inline-flex items-center gap-1"
                  >
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
