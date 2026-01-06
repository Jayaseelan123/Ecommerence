
import React from 'react';
import { Zap, Shield, Sparkles, Code, Rocket, BarChart3, ArrowRight, MousePointer2 } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface LandingProps {
  categories: Category[];
  featuredProducts: Product[];
  onExplore: (catSlug?: string) => void;
  onViewProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onRequestCustom: () => void;
}

const Landing: React.FC<LandingProps> = ({ categories, featuredProducts, onExplore, onViewProduct, onAddToCart, onRequestCustom }) => {
  const rootCats = categories.filter(c => c.isVisible !== false).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 animate-fade-up">
            <Sparkles className="h-4 w-4 text-brand-cta" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Engineering Grade Payloads</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 italic leading-[0.9] animate-fade-up">
            DEPLOY <span className="text-brand-cta">EXCELLENCE</span><br />
            AT SCALE
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg md:text-xl font-medium mb-12 leading-relaxed animate-fade-up delay-100">
            The marketplace for production-ready AI automations, high-performance software blueprints, and enterprise-grade code assets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-200">
            <button
              onClick={() => onExplore()}
              className="px-12 py-6 bg-brand-cta text-brand-primary font-black rounded-[24px] hover:bg-brand-cta-hover transition-all shadow-2xl shadow-black/20 text-sm uppercase tracking-widest active:scale-95 flex items-center gap-3"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onRequestCustom}
              className="px-12 py-6 bg-white/5 backdrop-blur-md text-white border border-white/20 font-black rounded-[24px] hover:bg-white/10 transition-all text-sm uppercase tracking-widest active:scale-95"
            >
              Request Custom Build
            </button>
          </div>
        </div>
      </section>

      {/* Primary Category Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {rootCats.map((cat, idx) => (
              <div
                key={cat.id}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => onExplore(cat.slug)}
                className={`group relative p-10 rounded-[40px] cursor-pointer transition-all duration-500 overflow-hidden border-2 bg-white hover:-translate-y-1 hover-card animate-fade-up ${idx % 2 === 0 ? 'border-brand-primary/10 hover:border-brand-primary' : 'border-brand-secondary/10 hover:border-brand-secondary'}`}
              >
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-lg ${idx % 2 === 0 ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-white'}`}>
                    {idx % 2 === 0 ? <Zap size={32} /> : <Code size={32} />}
                  </div>
                  <h3 className="text-3xl font-black text-brand-primary mb-4 uppercase italic tracking-tight">{cat.name}</h3>
                  <p className="text-content-secondary text-lg mb-8 max-w-sm font-medium leading-relaxed">{cat.description}</p>
                  <div className={`flex items-center font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform ${idx % 2 === 0 ? 'text-brand-primary' : 'text-brand-secondary'}`}>
                    Initialize Exploration <ArrowRight className="ml-2" size={16} />
                  </div>
                </div>
                <div className={`absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700 ${idx % 2 === 0 ? 'text-brand-primary' : 'text-brand-secondary'}`}>
                  {idx % 2 === 0 ? <Zap size={200} /> : <Code size={200} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-base-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Shield />, title: 'Vetted Quality', desc: 'Each asset is stress-tested by senior architects.' },
              { icon: <MousePointer2 />, title: 'Click to Deploy', desc: 'JSON & ZIP files ready for instant cloud import.' },
              { icon: <Sparkles />, title: 'Always Current', desc: 'Lifetime access to all future version updates.' }
            ].map((f, i) => (
              <div key={i} className="flex gap-6 animate-slide-right" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-base-border flex items-center justify-center text-brand-secondary hover-card">
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-lg font-black text-brand-primary uppercase italic tracking-tight mb-2">{f.title}</h4>
                  <p className="text-content-secondary text-sm font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black text-brand-primary uppercase italic tracking-tight">Premium Picks</h2>
              <p className="text-content-secondary mt-3 text-lg font-medium">Top performing assets selected for you.</p>
            </div>
            <button
              onClick={() => onExplore()}
              className="mt-6 md:mt-0 px-8 py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20 text-xs uppercase tracking-widest"
            >
              Browse All Payloads
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
                onAddToCart={onAddToCart}
                style={{ animationDelay: `${idx * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-secondary/10 skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex flex-col items-center gap-12 pb-16 border-b border-white/10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="bg-brand-cta p-2 rounded-xl">
                  <Zap className="h-6 w-6 text-brand-primary" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic">Developers Hub</span>
              </div>
              <p className="text-white/60 font-medium leading-relaxed">
                The world's premier delivery system for engineering payloads, automation blueprints, and production-grade software assets. Optimized for elite engineering ecosystems.
              </p>
            </div>
          </div>
          <div className="pt-10 flex flex-col items-center gap-6 text-slate-600 text-sm font-bold">
            <p>&copy; 2025 Wasiq and Salman. All Rights Reserved. Built for the elite engineering community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
