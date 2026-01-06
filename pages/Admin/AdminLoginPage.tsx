import React, { useState } from 'react';
import { Lock, User, Shield, Zap, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';
import { supabaseService } from '../../services/localService';

interface AdminLoginPageProps {
    onLoginSuccess: (user: any) => void;
    onBackToSite: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onBackToSite }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await supabaseService.signIn(email, password);
            const user = await supabaseService.getCurrentUser();

            if (user && user.role === 'admin') {
                onLoginSuccess(user);
            } else if (user) {
                await supabaseService.signOut();
                setError('Access Denied: Administrative clearance required.');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication sequence failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-admin flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-admin-accent/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[48px] border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-brand-primary/30 rounded-[32px] flex items-center justify-center mb-6 border border-white/10 shadow-inner group">
                            <ShieldCheck size={36} className="text-brand-cta group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Console Access</h1>
                        <p className="text-brand-admin-accent text-[10px] font-black uppercase tracking-[0.3em] mt-3 tracking-widest">Identity Verification Layer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Admin Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User size={16} className="text-white/20 group-focus-within:text-brand-cta transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/10 focus:ring-2 focus:ring-brand-cta focus:border-transparent transition-all outline-none"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Access Token</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-white/20 group-focus-within:text-brand-cta transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/10 focus:ring-2 focus:ring-brand-cta focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-brand-error/10 border border-brand-error/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <Terminal size={16} className="text-brand-error shrink-0" />
                                <p className="text-xs font-bold text-brand-error">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-brand-cta text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-cta-hover transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initialize Console</span>
                                    <Zap size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                        <button
                            onClick={onBackToSite}
                            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Marketplace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
