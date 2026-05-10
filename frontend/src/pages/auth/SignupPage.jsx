import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Mail, Globe } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'en',
    avatarUrl: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        language: formData.language,
        avatarUrl: formData.avatarUrl || undefined
      });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Signup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { label: 'Full Name', placeholder: 'Felix Wanderer', icon: User, field: 'name', type: 'text' },
    { label: 'Email', placeholder: 'felix@travel.com', icon: Mail, field: 'email', type: 'email' },
    { label: 'Password', placeholder: 'Choose a secure password', icon: Lock, field: 'password', type: 'password' },
    { label: 'Language', placeholder: 'en', icon: Globe, field: 'language', type: 'text' }
  ];

  return (
    <AuthLayout
      title="Join the Voyage"
      subtitle="Create your global explorer profile."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <GlassCard className="p-10 border-2 border-brand-navy/5 flex flex-col items-center bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] !rounded-[40px]" hover={false}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-32 h-32 rounded-full border-2 border-dashed border-brand-navy/10 flex items-center justify-center mb-10 group hover:border-brand-sky transition-all cursor-pointer bg-brand-navy/[0.02] shadow-inner"
          >
            <div className="text-center group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-brand-slate mx-auto group-hover:text-brand-sky transition-colors" />
              <span className="text-[10px] font-black text-brand-slate uppercase tracking-widest mt-2 block group-hover:text-brand-sky">Photo</span>
            </div>
          </motion.div>

          <form className="w-full space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fields.map((field, i) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="space-y-3"
                >
                  <label className="text-[11px] font-black text-brand-slate uppercase tracking-[0.3em] ml-1">{field.label}</label>
                  <div className="relative group">
                    <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300 group-focus-within:scale-110" size={18} />
                    <input
                      type={field.type}
                      value={formData[field.field]}
                      onChange={handleChange(field.field)}
                      placeholder={field.placeholder}
                      className="w-full bg-brand-navy/[0.02] border-2 border-brand-navy/5 rounded-[20px] py-4 pl-14 pr-6 text-brand-navy placeholder:text-brand-slate/30 focus:outline-none focus:border-brand-sky/30 focus:bg-white focus:ring-4 focus:ring-brand-sky/5 transition-all font-bold text-sm cursor-pointer"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <label className="text-[11px] font-black text-brand-slate uppercase tracking-[0.3em] ml-1">Avatar URL</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={handleChange('avatarUrl')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-brand-navy/[0.02] border-2 border-brand-navy/5 rounded-[20px] py-4 px-6 text-brand-navy placeholder:text-brand-slate/30 focus:outline-none focus:border-brand-sky/30 focus:bg-white focus:ring-4 focus:ring-brand-sky/5 transition-all font-bold text-sm cursor-pointer"
              />
            </motion.div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
                {error}
              </div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-4"
            >
              <AnimatedButton className="w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-[20px] bg-brand-navy shadow-2xl shadow-brand-navy/30 hover:shadow-brand-sky/20 hover:bg-brand-indigo transition-all group overflow-hidden relative cursor-pointer">
                <span className="relative z-10">{submitting ? 'Creating Account...' : 'Signup'}</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-brand-sky to-brand-indigo opacity-0 group-hover:opacity-100 transition-opacity"
                  transition={{ duration: 0.4 }}
                />
              </AnimatedButton>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 pt-8 border-t-2 border-brand-navy/5 text-center w-full"
          >
            <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-sky hover:text-brand-indigo transition-all ml-2 cursor-pointer no-underline">
                Login
              </Link>
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>
    </AuthLayout>
  );
}
