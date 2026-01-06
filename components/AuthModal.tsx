
import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabaseService } from '../services/localService';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await supabaseService.signIn(email, password);
            } else {
                await supabaseService.signUp(email, password, fullName);
            }
            const user = await supabaseService.getCurrentUser();
            onSuccess(user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div className="p-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join AutoFlow'}
                        </h2>
                        <p className="text-slate-500 font-medium mt-2">
                            {isLogin ? 'Log in to manage your assets' : 'Start your automation journey today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Alex Architect"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 py-3 rounded-xl border border-rose-100 italic">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-[20px] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-bold text-slate-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                        >
                            {isLogin ? 'Register now' : 'Login here'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
