import React from 'react';
import { GlassPanel } from '../components/ui/GlassCard';
import { User, Shield, Camera } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-5xl mx-auto w-full pb-32">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-on-surface-variant">Manage your account preferences, security, and connected financial institutions.</p>
      </header>
      
      <div className="space-y-12">
        <GlassPanel className="p-8 shadow-[0_0_50px_0_rgba(94,92,230,0.1)]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <User className="text-primary" size={24} /> Profile
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-surface-variant hover:border-primary transition-colors">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIh7BkOxEf__-Ihnrka4Jy2D9cTnGYPDuf2GvQTsz8n1Q_5TbwJ2hYPaPWH9gdIWirp6JZcK7iZvQG1vPa5sQYeeBIgCNJzBusR8BruzuxVTqdz-dCFP8mxnfsmEXQzEkTkzyWri4DC8VB5HzkARv-RRJAJVDiClFx1Ju4sEjoxVue0hhVK9O7p3VCEKNdbMLXNFVoKDq-Pq4AAngEbPd5rGgzhU5ygZYURaxNesSf8xnXhy3EOHqJ564jnC6xO3hlqHKWt87Z5ROm" alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <button className="text-[12px] font-label-caps text-primary uppercase tracking-widest hover:text-white transition-colors">Change Avatar</button>
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">First Name</label>
                  <input className="w-full bg-surface-container-low border border-glass-stroke rounded-lg px-4 py-3 text-on-surface focus:border-primary outline-none transition-colors" defaultValue="Elena" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Last Name</label>
                  <input className="w-full bg-surface-container-low border border-glass-stroke rounded-lg px-4 py-3 text-on-surface focus:border-primary outline-none transition-colors" defaultValue="Rostova" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-glass-stroke">
                <button className="bg-primary-container text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Save Changes</button>
              </div>
            </div>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Shield className="text-primary" size={24} /> Security
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-glass-stroke">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-on-surface-variant">Protect your account with extra security.</p>
              </div>
              <label className="relative inline-block w-12 h-6 rounded-full bg-primary-container p-1 cursor-pointer">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default SettingsPage;
