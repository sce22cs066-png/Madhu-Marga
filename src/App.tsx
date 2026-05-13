import { useState, useEffect, FormEvent } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Hive, 
  Inspection, 
  Harvest, 
  Flora, 
  HiveStatus 
} from './types';
import Layout from './components/Layout';
import { 
  Hexagon, 
  Plus, 
  AlertTriangle, 
  History, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Flower,
  Scale,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { format } from 'date-fns';
import { analyzeHiveHealth, getFloraCalendar } from './lib/gemini';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [hives, setHives] = useState<Hive[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [flora, setFlora] = useState<Flora[]>([]);

  // UI State
  const [showAddHive, setShowAddHive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    const qHives = query(collection(db, 'hives'), where('ownerId', '==', user.uid));
    const unsubHives = onSnapshot(qHives, (snapshot) => {
      setHives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hive)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'hives'));

    const qInspections = query(collection(db, 'inspections'), where('ownerId', '==', user.uid));
    const unsubInspections = onSnapshot(qInspections, (snapshot) => {
      setInspections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inspection)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inspections'));

    const qHarvests = query(collection(db, 'harvests'), where('ownerId', '==', user.uid));
    const unsubHarvests = onSnapshot(qHarvests, (snapshot) => {
      setHarvests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Harvest)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'harvests'));

    // Fetch Flora (Mock/Gemini generated if empty)
    getFloraCalendar().then(setFlora);

    return () => {
      unsubHives();
      unsubInspections();
      unsubHarvests();
    };
  }, [user]);

  const handleLogin = () => signInWithPopup(auth, googleProvider);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#FFFBEB] flex flex-col items-center justify-center p-4">
        <motion.div
           animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
           transition={{ duration: 1, repeat: Infinity }}
        >
          <Hexagon size={64} className="text-[#F59E0B]" />
        </motion.div>
        <p className="mt-4 text-[#92400E] font-bold text-xl animate-pulse">Entering The Apiary...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-[#FFFBEB] flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <Hexagon key={i} className="absolute text-[#F59E0B]" style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 2}) rotate(${Math.random() * 360}deg)`
            }} />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-[#FCD34D] max-w-md w-full text-center relative z-10"
        >
          <div className="bg-[#451A03] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
             <Hexagon size={40} className="text-[#FCD34D]" />
          </div>
          <h1 className="text-4xl font-black text-[#451A03] mb-2 tracking-tight">MADHU-MARGA</h1>
          <p className="text-[#92400E] font-medium mb-8">The Digital Beekeeper's Path to a Sweet Revolution</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
            Begin Inspection
          </button>
          
          <div className="mt-8 pt-6 border-t border-amber-100 grid grid-cols-2 gap-4 text-xs font-bold text-[#92400E] uppercase tracking-widest">
            <div className="flex flex-col items-center gap-1">
              <TrendingUp size={20} className="text-[#F59E0B]" />
              Track Yields
            </div>
            <div className="flex flex-col items-center gap-1">
              <AlertTriangle size={20} className="text-[#F59E0B]" />
              AI Insights
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userName={user.displayName || user.email?.split('@')[0]}>
      {activeTab === 'dashboard' && <Dashboard hives={hives} harvests={harvests} inspections={inspections} />}
      {activeTab === 'hives' && (
        <HiveList 
          hives={hives} 
          onAdd={() => setShowAddHive(true)} 
          inspections={inspections}
          harvests={harvests}
        />
      )}
      {activeTab === 'inspections' && (
        <InspectionSection 
          hives={hives} 
          inspections={inspections} 
          user={user}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />
      )}
      {activeTab === 'harvests' && (
        <HarvestSection 
          hives={hives} 
          harvests={harvests} 
          user={user}
        />
      )}
      {activeTab === 'flora' && <FloraCalendar flora={flora} />}

      {/* Add Hive Modal */}
      <AnimatePresence>
        {showAddHive && (
          <Modal onClose={() => setShowAddHive(false)} title="New Hive Entry">
            <AddHiveForm user={user} onSuccess={() => setShowAddHive(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// --- Sub-Components ---

function Dashboard({ hives, harvests, inspections }: { hives: Hive[], harvests: Harvest[], inspections: Inspection[] }) {
  const totalHarvest = harvests.reduce((acc, h) => acc + h.quantity, 0);
  const activeHives = hives.filter(h => h.status === 'active').length;
  const failingHives = hives.filter(h => h.status === 'failing').length;

  // Interventions feed (most recent inspections with issues)
  const alerts = inspections
    .filter(i => i.activityLevel === 'low' || i.pestsSeen)
    .sort((a, b) => b.date.seconds - a.date.seconds)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#451A03]">Apiary Snapshot</h2>
          <p className="text-[#92400E] font-medium">Welcome back to Madhu-Marga</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FCD34D] shadow-sm flex items-center gap-2">
          <Calendar size={18} className="text-[#F59E0B]" />
          <span className="font-bold text-sm">{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Hives" value={hives.length} icon={Hexagon} color="bg-amber-100 text-amber-600" />
        <StatCard label="Active" value={activeHives} icon={TrendingUp} color="bg-green-100 text-green-600" />
        <StatCard label="Alerts" value={failingHives} icon={AlertTriangle} color="bg-red-100 text-red-600" />
        <StatCard label="Season Yield" value={`${totalHarvest.toFixed(1)} kg`} icon={Scale} color="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-[#FCD34D]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Intervention Alerts
            </h3>
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map(alert => (
              <div key={alert.id} className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-sm text-[#451A03] underline decoration-red-300">
                     Hive: {hives.find(h => h.id === alert.hiveId)?.name}
                  </span>
                  <span className="text-xs text-red-400 font-bold uppercase">{format(alert.date.toDate(), 'MMM d')}</span>
                </div>
                <p className="text-sm text-red-700 leading-relaxed italic">"{alert.aiIntervention || alert.observations}"</p>
              </div>
            )) : (
              <div className="text-center py-10">
                <Hexagon size={48} className="mx-auto text-green-400 mb-2 opacity-50" />
                <p className="text-green-600 font-bold italic">All colonies are buzzing happily!</p>
              </div>
            )}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-[#FCD34D]">
          <h3 className="font-black text-xl mb-6">Yield Performance</h3>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={harvests.slice(-6)}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="date" tickFormatter={(v) => format(v.toDate(), 'MMM d')} fontSize={12} stroke="#92400E" />
                 <YAxis fontSize={12} stroke="#92400E" />
                 <Tooltip />
                 <Bar dataKey="quantity" fill="#F59E0B" radius={[10, 10, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiveList({ hives, onAdd, inspections, harvests }: { 
  hives: Hive[], 
  onAdd: () => void, 
  inspections: Inspection[],
  harvests: Harvest[]
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-[#451A03]">My Colony Network</h2>
        <button 
          onClick={onAdd}
          className="bg-[#451A03] text-[#FCD34D] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#5D2204] transition-all transform hover:scale-105"
        >
          <Plus size={20} strokeWidth={3} />
          Tag New Hive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hives.map((hive) => {
          const hiveInspections = inspections.filter(i => i.hiveId === hive.id);
          const hiveHarvests = harvests.filter(h => h.hiveId === hive.id);
          const lastInspection = hiveInspections.sort((a,b) => b.date.seconds - a.date.seconds)[0];

          return (
            <div key={hive.id} className="bg-white rounded-[2rem] shadow-lg border-2 border-[#FCD34D] overflow-hidden group hover:border-[#F59E0B] transition-all">
              <div className={`p-6 ${hive.status === 'active' ? 'bg-amber-50' : 'bg-red-50'} border-b-2 border-[#FCD34D]/30`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Hexagon className={hive.status === 'active' ? 'text-amber-500' : 'text-red-500'} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    hive.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {hive.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#451A03] mb-1">{hive.name}</h3>
                <p className="text-xs font-bold text-[#92400E] flex items-center gap-1 opacity-70">
                  <MapPin size={12} /> {hive.location}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#92400E] font-bold">Health Meter</span>
                  <span className="font-black text-[#451A03]">
                    {lastInspection ? (lastInspection.activityLevel === 'high' ? 'Excellent' : lastInspection.activityLevel === 'medium' ? 'Stable' : 'Poor') : 'No Data'}
                  </span>
                </div>
                <div className="w-full bg-amber-50 h-2 rounded-full overflow-hidden">
                   <div 
                    className={`h-full rounded-full transition-all duration-500 ${lastInspection?.activityLevel === 'high' ? 'w-full bg-green-500' : lastInspection?.activityLevel === 'medium' ? 'w-2/3 bg-amber-400' : 'w-1/3 bg-red-500'}`} 
                   />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#FCD34D]/20">
                  <div>
                    <p className="text-[10px] font-bold text-[#92400E] opacity-50 uppercase">Inspections</p>
                    <p className="font-black text-[#451A03]">{hiveInspections.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#92400E] opacity-50 uppercase">Total Honey</p>
                    <p className="font-black text-[#451A03]">{hiveHarvests.reduce((acc, h) => acc + h.quantity, 0).toFixed(1)} kg</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InspectionSection({ hives, inspections, user, isAnalyzing, setIsAnalyzing }: { 
  hives: Hive[], 
  inspections: Inspection[], 
  user: User,
  isAnalyzing: boolean,
  setIsAnalyzing: (v: boolean) => void 
}) {
  const [selectedHive, setSelectedHive] = useState('');
  const [queen, setQueen] = useState(true);
  const [pests, setPests] = useState(false);
  const [activity, setActivity] = useState<string>('medium');
  const [honeyFlow, setHoneyFlow] = useState(50);
  const [obs, setObs] = useState('');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHive) return;

    setIsAnalyzing(true);
    const aiIntervention = await analyzeHiveHealth({
      activityLevel: activity,
      pestsSeen: pests,
      queenPresent: queen,
      observations: obs
    });

    try {
      await addDoc(collection(db, 'inspections'), {
        hiveId: selectedHive,
        ownerId: user.uid,
        date: serverTimestamp(),
        queenPresent: queen,
        pestsSeen: pests,
        activityLevel: activity,
        honeyFlowProgress: honeyFlow,
        observations: obs,
        aiIntervention
      });
      // Reset
      setObs('');
      setIsAnalyzing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inspections');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-[#451A03]">Inspection Logs</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-[#FCD34D]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <ClipboardList className="text-[#F59E0B]" />
            New Inspection Record
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-[#92400E] mb-2 uppercase tracking-wide">Select Hive</label>
                <select 
                  className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-3 font-bold text-[#451A03] focus:outline-none focus:border-[#F59E0B]"
                  value={selectedHive}
                  onChange={e => setSelectedHive(e.target.value)}
                  required
                >
                  <option value="">- Choose Hive -</option>
                  {hives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-[#92400E] mb-2 uppercase tracking-wide">Activity Level</label>
                <div className="flex gap-2">
                  {['high', 'medium', 'low'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setActivity(lvl)}
                      className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase transition-all ${
                        activity === lvl 
                        ? 'bg-[#451A03] text-[#FCD34D] shadow-inner' 
                        : 'bg-amber-50 text-[#92400E] border-2 border-[#FDE68A]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-[#FDE68A] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={queen} 
                  onChange={e => setQueen(e.target.checked)}
                  className="w-5 h-5 accent-[#451A03]"
                />
                <span className="font-bold text-[#451A03]">Queen Present?</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-[#FDE68A] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pests} 
                  onChange={e => setPests(e.target.checked)}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="font-bold text-[#451A03]">Pests Seen?</span>
              </label>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-black text-[#92400E] uppercase tracking-wide">Honey Flow Season</label>
                <span className="font-black text-amber-600">{honeyFlow}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={honeyFlow} 
                onChange={e => setHoneyFlow(Number(e.target.value))}
                className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
              />
              <div className="flex justify-between mt-1 text-[10px] font-bold text-[#92400E] opacity-50 uppercase">
                <span>Dormant</span>
                <span>Peak Flow</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-[#92400E] mb-2 uppercase tracking-wide">Observations</label>
              <textarea 
                className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-3 font-medium text-[#451A03] focus:outline-none focus:border-[#F59E0B] h-32"
                placeholder="Log odors, sound levels, or pollen intake..."
                value={obs}
                onChange={e => setObs(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isAnalyzing || !selectedHive}
              className="w-full bg-[#451A03] text-[#FCD34D] py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[#5D2204] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Hexagon size={24} />
                  </motion.div>
                  Analyzing Hive Health...
                </>
              ) : (
                'Save Log & Run AI Analysis'
              )}
            </button>
          </form>
        </div>

        {/* Recent History */}
        <div className="bg-[#451A03] p-8 rounded-[2.5rem] shadow-xl text-[#FCD34D] overflow-hidden relative">
          <Hexagon className="absolute -top-10 -right-10 w-40 h-40 opacity-5 rotate-12" />
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <History />
            Recent Notes
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {inspections.sort((a,b) => b.date.seconds - a.date.seconds).map(insp => (
              <div key={insp.id} className="bg-[#5D2204] p-5 rounded-2xl border border-[#FCD34D]/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase text-amber-400">
                    {hives.find(h => h.id === insp.hiveId)?.name}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">
                    {format(insp.date.toDate(), 'MMM d, yy')}
                  </span>
                </div>
                <p className="text-sm font-medium mb-3 italic opacity-90 leading-tight">"{insp.observations}"</p>
                {insp.aiIntervention && (
                  <div className="mt-2 text-xs bg-amber-500/20 p-3 rounded-xl border border-amber-500/30 flex gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-300" />
                    <span className="text-amber-200 font-bold">{insp.aiIntervention}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HarvestSection({ hives, harvests, user }: { hives: Hive[], harvests: Harvest[], user: User }) {
  const [selectedHive, setSelectedHive] = useState('');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');

  const handleHarvest = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHive || !qty) return;

    try {
      await addDoc(collection(db, 'harvests'), {
        hiveId: selectedHive,
        ownerId: user.uid,
        date: serverTimestamp(),
        quantity: Number(qty),
        notes: note
      });
      // Optionally update hive status
      setQty('');
      setNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'harvests');
    }
  };

  // Group harvests by year for comparison
  const harvestsByYear = harvests.reduce((acc: any, h) => {
    const year = h.date.toDate().getFullYear();
    if (!acc[year]) acc[year] = 0;
    acc[year] += h.quantity;
    return acc;
  }, {});

  const chartData = Object.entries(harvestsByYear).map(([year, qty]) => ({ year, quantity: qty }));

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-[#451A03]">Harvest Tracker</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-[#FCD34D]">
          <h3 className="text-xl font-black mb-6">Log New Collection</h3>
          <form onSubmit={handleHarvest} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-[#92400E] mb-2">Source Hive</label>
              <select 
                className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-3 font-bold"
                value={selectedHive}
                onChange={e => setSelectedHive(e.target.value)}
                required
              >
                <option value="">- Select Hive -</option>
                {hives.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-[#92400E] mb-2">Honey Collected (kg)</label>
              <input 
                type="number" step="0.1"
                className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-3 font-bold"
                value={qty}
                onChange={e => setQty(e.target.value)}
                required
                placeholder="e.g. 5.4"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-[#92400E] mb-2">Notes</label>
              <textarea 
                className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-3"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <button className="w-full bg-[#F59E0B] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#D97706] transition-all">
              Log Harvest
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-[#FCD34D]">
          <h3 className="text-xl font-black mb-6">Year-on-Year Growth</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="year" fontSize={12} stroke="#92400E" />
                 <YAxis fontSize={12} stroke="#92400E" />
                 <Tooltip cursor={{fill: '#FDE68A'}} />
                 <Bar dataKey="quantity" fill="#D97706" radius={[10, 10, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloraCalendar({ flora }: { flora: Flora[] }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-[#451A03]">Flora Calendar</h2>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
           <Flower size={18} />
           Smart Guide
        </div>
      </div>
      <p className="text-[#92400E] font-medium max-w-2xl">Understanding what blooms nearby helps predict the "Honey Flow" and colony energy levels.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flora.map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-[#FCD34D] flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 border border-green-100">
               <Flower className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-[#451A03] mb-1">{item.name}</h3>
            <p className="text-xs font-black text-amber-600 uppercase mb-4">{item.bloomingSeason}</p>
            <p className="text-sm text-[#92400E] mb-4 flex-1">{item.description}</p>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mt-auto">
               <p className="text-[10px] font-black text-[#92400E] uppercase opacity-50 mb-1">Bee Benefit</p>
               <p className="text-xs font-bold text-[#451A03] italic leading-tight">"{item.benefitToBees}"</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Helpers

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string|number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-[#FCD34D] flex items-center gap-4">
      <div className={`${color} p-4 rounded-3xl shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-[#92400E] uppercase opacity-50 tracking-widest">{label}</p>
        <p className="text-2xl font-black text-[#451A03]">{value}</p>
      </div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: any, onClose: () => void, title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-[#451A03]/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden border-4 border-[#FCD34D]"
      >
        <div className="bg-[#FCD34D] p-6 flex justify-between items-center border-b-2 border-amber-400">
           <h3 className="font-black text-xl text-[#451A03]">{title}</h3>
           <button onClick={onClose} className="p-2 hover:bg-amber-400 rounded-full transition-colors">
              <Plus className="rotate-45" />
           </button>
        </div>
        <div className="p-8">
           {children}
        </div>
      </motion.div>
    </div>
  );
}

function AddHiveForm({ user, onSuccess }: { user: User, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hives'), {
        name,
        location: loc,
        status: 'active' as HiveStatus,
        createdAt: serverTimestamp(),
        ownerId: user.uid
      });
      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'hives');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-black text-[#92400E] mb-2">Hive Signature / Name</label>
        <input 
          className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-4 font-bold"
          placeholder="e.g. North Apiary Box 4"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-black text-[#92400E] mb-2">Exact Location</label>
        <input 
          className="w-full bg-amber-50 border-2 border-[#FDE68A] rounded-2xl px-4 py-4 font-bold"
          placeholder="e.g. Near the Mango Grove"
          value={loc}
          onChange={e => setLoc(e.target.value)}
          required
        />
      </div>
      <button className="w-full bg-[#451A03] text-[#FCD34D] py-5 rounded-2xl font-black text-xl shadow-lg ring-4 ring-amber-100">
        Initiate Hive Log
      </button>
    </form>
  );
}
