import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  Hexagon, 
  LayoutDashboard, 
  ClipboardList, 
  Scale, 
  Map, 
  User, 
  LogOut,
  Flower
} from 'lucide-react';
import { auth } from '../firebase';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
}

export default function Layout({ children, activeTab, setActiveTab, userName }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hives', label: 'My Hives', icon: Map },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList },
    { id: 'harvests', label: 'Harvest Tracker', icon: Scale },
    { id: 'flora', label: 'Flora Calendar', icon: Flower },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex text-[#451A03]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FCD34D] border-r border-[#F59E0B] flex flex-col fixed h-full z-10 shadow-lg">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#451A03] p-2 rounded-xl shadow-md">
            <Hexagon className="text-[#FCD34D] w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none text-[#451A03]">Madhu</h1>
            <span className="text-[#92400E] font-medium text-sm">Marga</span>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-[#451A03] text-[#FCD34D] shadow-md scale-[1.02]' 
                : 'text-[#92400E] hover:bg-[#FDE68A] hover:text-[#451A03]'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#F59E0B] bg-[#FDE68A]/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#451A03] flex items-center justify-center text-[#FCD34D]">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#92400E]">BEEKEEPER</p>
              <p className="text-sm font-bold truncate text-[#451A03]">{userName || 'User'}</p>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#92400E] hover:text-[#451A03] font-bold transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
