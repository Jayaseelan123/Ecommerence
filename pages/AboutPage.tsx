import React, { useState } from 'react';
import { Mail, MessageSquare, Send, User, Rocket, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabaseService } from '../services/localService';

const AboutPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        projectTitle: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await supabaseService.submitCustomRequest(formData);
            setIsSuccess(true);
            setFormData({ fullName: '', email: '', projectTitle: '', description: '' });
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
                <div className="bg-white rounded-[48px] p-12 max-w-2xl w-full text-center space-y-8 animate-fade-up">
                    <div className="w-24 h-24 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto text-brand-success">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-brand-primary uppercase italic tracking-tight">Deployment Scheduled</h2>
                        <p className="text-content-secondary mt-4 text-lg font-medium">Your custom project manifest has been received. Our senior architects will review your requirements and respond via the encrypted channel provided.</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-6 bg-brand-primary text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-brand-secondary transition-all flex items-center justify-center gap-3"
                    >
                        Return to Command Center <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-brand-cta selection:text-brand-primary">
            {/* Hero Header */}
            <section className="bg-brand-primary pt-32 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-secondary/10 skew-x-12 translate-x-1/4"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-8">
                            CUSTOM <span className="text-brand-cta">BLUEPRINTS</span>
                        </h1>
                        <p className="text-xl text-white/70 font-medium leading-relaxed">
                            Elevate your ecosystem with high-performance, custom-engineered solutions. From specialized AI agents to enterprise automation frameworks, we build the elite tools you need to dominate the market.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-brand-primary uppercase italic tracking-tight">The Visionaries</h2>
                        <p className="text-lg text-content-secondary font-medium leading-relaxed">
                            Founded by Wasiq and Salman, Developers Hub is dedicated to providing the elite engineering community with production-ready assets that bypass the friction of standard development cycles.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-base-main p-8 rounded-[32px] border border-base-border shadow-sm">
                            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-cta mb-6">
                                <Rocket size={24} />
                            </div>
                            <h4 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-2">Rapid Deployment</h4>
                            <p className="text-xs text-content-secondary font-medium leading-relaxed">Custom builds designed for immediate integration into your production environment.</p>
                        </div>
                        <div className="bg-base-main p-8 rounded-[32px] border border-base-border shadow-sm">
                            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white mb-6">
                                <Zap size={24} />
                            </div>
                            <h4 className="text-sm font-black text-brand-primary uppercase tracking-widest mb-2">High Efficiency</h4>
                            <p className="text-xs text-content-secondary font-medium leading-relaxed">Optimized code blueprints that maximize performance and minimize resource overhead.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-[48px] p-10 lg:p-14 border border-base-border shadow-2xl shadow-brand-primary/5">
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl font-black text-brand-primary uppercase italic tracking-tight mb-2">Initialize Request</h3>
                        <p className="text-sm text-content-secondary font-medium uppercase tracking-widest">Protocol Version 2.0</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User size={12} /> Operator Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-cta transition-all"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail size={12} /> Secure Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-cta transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                < Rocket size={12} /> Project Objective
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Enterprise AI Agent Grid"
                                className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-cta transition-all"
                                value={formData.projectTitle}
                                onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MessageSquare size={12} /> Mission Parameters
                            </label>
                            <textarea
                                required
                                rows={5}
                                placeholder="Describe your technical requirements and objectives..."
                                className="w-full px-6 py-4 bg-base-main rounded-3xl font-bold border-none focus:ring-2 focus:ring-brand-cta transition-all resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-6 bg-brand-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm hover:shadow-2xl hover:shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={18} className="text-brand-cta" />
                                    Transmit Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
