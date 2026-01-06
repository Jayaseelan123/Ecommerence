
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Zap, Laptop } from 'lucide-react';
import { supabaseService } from '../services/localService';

interface LoginPageProps {
    onLoginSuccess: (user: any) => void;
    onAdminLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onAdminLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                // Login flow
                await supabaseService.signIn(email, password);
            } else {
                // Signup flow - create account then auto-login
                await supabaseService.signUp(email, password, fullName);
                // Auto-login after signup
                await supabaseService.signIn(email, password);
            }
            const user = await supabaseService.getCurrentUser();
            if (user) {
                if (user.role === 'admin') {
                    await supabaseService.signOut();
                    throw new Error('Restricted: Please use the Admin Portal');
                }
                onLoginSuccess(user);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 p-20 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-40 bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 p-40 bg-emerald-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-lg">
                        <Zap className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter uppercase italic">Developers Hub</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-6xl font-black text-white tracking-tight leading-[1.1] mb-8">
                        The Ultimate <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Payload Delivery</span> <br />
                        for Engineers.
                    </h1>
                    <div className="space-y-6 max-w-lg">
                        {[
                            { icon: ShieldCheck, title: 'Secure Deliverables', desc: 'Encrypted code delivery and verified license keys.' },
                            { icon: Zap, title: 'Instant Integration', desc: 'n8n, Make, and Zapier workflows ready to deploy.' },
                            { icon: Laptop, title: 'Full Stack Templates', desc: 'Boilerplates that save you 40+ hours of work.' }
                        ].map((item, i) => (
                            <div key={i} className="flex space-x-4">
                                <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{item.title}</h3>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/10">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Global developer network © 2025</p>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
                <div className="max-w-md w-full">
                    <div className="text-center lg:text-left mb-12">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Join the largest marketplace for engineering assets.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company / Developer Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                        placeholder="Alex Architect"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity (Email Address)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secret Token (Password)</label>
                                {isLogin && <button type="button" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700">Forgot Code?</button>}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                                <p className="text-rose-600 text-xs font-bold text-center italic">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <>
                                    <span>{isLogin ? 'Initialize Session' : 'Create Credentials'}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            {isLogin ? "Need access? Request Credentials" : "Existing Member? Login here"}
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Restricted Access</p>
                        <button
                            onClick={onAdminLogin}
                            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center space-x-2 group"
                        >
                            <ShieldCheck className="h-4 w-4 group-hover:animate-pulse" />
                            <span>Enter Command Center (Admin Only)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
