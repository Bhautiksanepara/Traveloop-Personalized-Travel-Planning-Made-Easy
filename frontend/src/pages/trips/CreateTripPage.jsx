import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { citiesApi, tripsApi } from '../../lib/api';
import { setSelectedTripId } from '../../lib/storage';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budgetLimit: '',
    coverPhotoUrl: ''
  });
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const searchCities = async (value) => {
    setCitySearch(value);
    setSelectedCity(null);
    if (value.trim().length < 2) {
      setCityResults([]);
      return;
    }

    const response = await citiesApi.list({ search: value, limit: 6 });
    setCityResults(response.data || []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await tripsApi.create({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budgetLimit: formData.budgetLimit ? Number(formData.budgetLimit) : undefined,
        coverPhotoUrl: formData.coverPhotoUrl || undefined
      });

      const createdTrip = response.data;
      setSelectedTripId(createdTrip.id);

      if (selectedCity?.id) {
        await tripsApi.addStop(createdTrip.id, {
          cityId: selectedCity.id,
          arriveDate: formData.startDate,
          departDate: formData.endDate,
          orderIndex: 10
        });
      }

      navigate(`/trips/${createdTrip.id}/view`);
    } catch (requestError) {
      setError(requestError.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-12 pb-20">
        <header className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-brand-slate hover:text-brand-navy transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-brand-navy/5 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
          </motion.button>
        </header>

        <div className="space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <h1 className="text-7xl font-black text-brand-navy leading-none tracking-tighter">
              PLAN A NEW <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">TRIP</span>
            </h1>
            <p className="text-brand-slate font-medium text-lg leading-relaxed mx-auto max-w-md">
              Design your perfect escape and save it directly to your Traveloop account.
            </p>
          </motion.div>

          <GlassCard className="p-10 space-y-8 !rounded-[50px] border-white bg-white/60 shadow-2xl shadow-brand-navy/5" hover={false}>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Trip Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Summer in Europe"
                    className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Starting City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-colors" size={18} />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(event) => searchCities(event.target.value)}
                      placeholder="Search for a city..."
                      className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
                    />
                  </div>
                  {cityResults.length ? (
                    <div className="grid gap-2">
                      {cityResults.map((city) => (
                        <button
                          type="button"
                          key={city.id}
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch(`${city.name}, ${city.country}`);
                            setCityResults([]);
                          }}
                          className="rounded-2xl border border-brand-navy/10 bg-white px-4 py-3 text-left text-sm font-bold text-brand-navy hover:border-brand-sky/30"
                        >
                          {city.name}, {city.country}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {selectedCity ? (
                    <p className="text-[11px] font-black uppercase tracking-widest text-brand-sky">
                      Selected city: {selectedCity.name}, {selectedCity.country}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Start Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                    <input type="date" value={formData.startDate} onChange={handleChange('startDate')} className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">End Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                    <input type="date" value={formData.endDate} onChange={handleChange('endDate')} className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Budget Limit</label>
                  <input type="number" min="0" value={formData.budgetLimit} onChange={handleChange('budgetLimit')} placeholder="2500" className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Cover Photo URL</label>
                  <input type="url" value={formData.coverPhotoUrl} onChange={handleChange('coverPhotoUrl')} placeholder="https://example.com/photo.jpg" className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Description</label>
                  <textarea value={formData.description} onChange={handleChange('description')} rows={4} placeholder="Tell us about your dream trip..." className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm resize-none" />
                </div>
              </div>

              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-500">{error}</div> : null}

              <div className="pt-4">
                <AnimatedButton className="w-full py-5 rounded-[24px] bg-brand-sky text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-brand-sky/30">
                  {submitting ? 'Creating Trip...' : 'Plan This Trip'}
                </AnimatedButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
