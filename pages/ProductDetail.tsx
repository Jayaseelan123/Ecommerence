
import React from 'react';
import { Product } from '../types';
import { CheckCircle2, ArrowLeft, ShoppingCart, Share2, Zap } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Media */}
        <div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover aspect-video" />
          </div>

          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {product.fullDescription}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What's included</h2>
              <ul className="space-y-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Pricing & Info */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                {product.techTag}
              </span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">{product.name}</h1>

            <div className="flex items-baseline space-x-2 mb-8">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">One-time payload</span>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => onAddToCart(product)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
                Buy It Now
              </button>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Instant Delivery</h4>
                  <p className="text-sm text-slate-500">Access your files immediately after checkout.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Expert Support</h4>
                  <p className="text-sm text-slate-500">24/7 technical assistance for installation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Zap className="h-24 w-24" />
            </div>
            <h3 className="text-xl font-bold mb-2">Need a custom build?</h3>
            <p className="text-indigo-200 mb-6">We can create custom automation workflows tailored to your specific stack.</p>
            <button className="bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
