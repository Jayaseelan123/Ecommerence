
import React from 'react';
import { ShoppingCart, User, Menu, X, Zap, LogOut } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onStoreClick: () => void;
  onHomeClick: () => void;
  onAdminClick: () => void;
  onDashboardClick: () => void;
  onLogout: () => void;
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onCartClick,
  onStoreClick,
  onHomeClick,
  onAdminClick,
  onDashboardClick,
  onLogout,
  user
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-primary backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center cursor-pointer group" onClick={onHomeClick}>
              <div className="bg-white/10 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                <Zap className="h-6 w-6 text-brand-cta" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Developers Hub</span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-0.5">Premium Engineering Assets</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <button onClick={onHomeClick} className="text-sm font-black uppercase tracking-widest text-white/70 hover:text-brand-cta transition-colors">Home</button>
            <button onClick={onStoreClick} className="text-sm font-black uppercase tracking-widest text-white/70 hover:text-brand-cta transition-colors">Marketplace</button>
            {/* Admin Panel access is restricted to direct login or hidden routes */}
            {user?.role === 'admin' && (
              <button onClick={onAdminClick} className="text-sm font-black uppercase tracking-widest text-brand-cta hover:text-brand-cta-hover transition-colors border-b-2 border-brand-cta">Admin Panel</button>
            )}

            <div className="h-6 w-px bg-white/10"></div>

            <button
              onClick={onCartClick}
              className="relative p-2.5 text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-[10px] font-black leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-brand-cta rounded-full shadow-lg shadow-black/20">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onDashboardClick}
              className="flex items-center space-x-3 bg-brand-cta text-brand-primary px-6 py-3 rounded-2xl hover:bg-brand-cta-hover transition-all shadow-xl shadow-black/20 group active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                <User className="h-3 w-3" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">{user ? user.fullName.split(' ')[0] : 'Authenticate'}</span>
            </button>

            {user && (
              <button
                onClick={onLogout}
                className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-brand-error/20 text-white/70 hover:text-brand-error rounded-xl transition-all border border-white/5 hover:border-brand-error/30 group shadow-lg shadow-black/10"
                title="Immediate Termination"
              >
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden lg:inline ml-2 text-[10px] font-black uppercase tracking-widest">Logout</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2 bg-slate-50 rounded-xl">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-6 space-y-6 animate-fade-up">
          <button onClick={() => { onHomeClick(); setIsOpen(false); }} className="block w-full text-left font-black uppercase tracking-widest text-slate-900">Home</button>
          <button onClick={() => { onStoreClick(); setIsOpen(false); }} className="block w-full text-left font-black uppercase tracking-widest text-slate-900">Marketplace</button>
          <button onClick={() => { onCartClick(); setIsOpen(false); }} className="block w-full text-left font-black uppercase tracking-widest text-slate-900 flex justify-between">
            <span>Cart</span>
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-lg text-xs">{cartCount}</span>
          </button>
          <button onClick={() => { onDashboardClick(); setIsOpen(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">
            {user ? 'My Account' : 'Authenticate'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
