import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Search, Calendar, BookOpen } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { tripsApi } from '../../lib/api';
import { useResolvedTrip } from '../../hooks/useResolvedTrip';

export default function JournalPage() {
  const { tripId, trip } = useResolvedTrip();
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadNotes = async () => {
      if (!tripId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await tripsApi.notes(tripId);
        if (!ignore) {
          setNotes(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load notes.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadNotes();
    return () => {
      ignore = true;
    };
  }, [tripId]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const createNote = async () => {
    if (!newNote.trim()) {
      return;
    }

    const response = await tripsApi.createNote(tripId, {
      content: newNote,
      noteDate: new Date().toISOString().slice(0, 10)
    });
    setNotes((current) => [response.data, ...current]);
    setNewNote('');
  };

  const deleteNote = async (noteId) => {
    await tripsApi.deleteNote(tripId, noteId);
    setNotes((current) => current.filter((note) => note.id !== noteId));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-indigo/10 text-brand-indigo">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-brand-navy">Trip Journal</h2>
            <p className="text-brand-slate">{trip?.name || 'Capture your thoughts, tips, and memories.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Search notes..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-white border border-brand-navy/10 rounded-xl py-2.5 pl-12 pr-4 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all" />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <input value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Write a quick note..." className="flex-1 bg-white border border-brand-navy/10 rounded-xl py-3 px-4 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/20" />
        <AnimatedButton onClick={createNote} className="px-6">
          <Plus size={20} />
          New Note
        </AnimatedButton>
      </div>

      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading notes...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
              <GlassCard className="p-6 flex flex-col h-fit border-brand-navy/10 bg-white relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-500">{new Date(note.noteDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-indigo transition-colors">
                  Note
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">{note.content}</p>

                <div className="mt-auto pt-4 border-t border-brand-navy/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-brand-indigo transition-colors rounded-lg hover:bg-brand-indigo/5">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
