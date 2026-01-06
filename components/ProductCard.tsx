
import React from 'react';
import { Product } from '../types';
import { ShoppingCart, ArrowRight, Zap, Code } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (id: string) => void;
  onAddToCart: (product: Product) => void;
  className?: string;
  style?: React.CSSProperties;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart, className, style }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div
      className={`group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover-card animate-fade-up ${className || ''}`}
      style={style}
    >
      <div
        className="relative h-56 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product.id)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-brand-primary text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <Zap size={12} />
            {product.techTag}
          </span>
        </div>
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
            SAVE ₹{Math.round(product.price - (product.discountPrice || 0))}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3
          className="text-xl font-bold text-content-primary mb-2 cursor-pointer group-hover:text-brand-secondary transition-colors"
          onClick={() => onViewDetails(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-content-secondary text-sm line-clamp-2 mb-6 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-content-muted text-sm line-through decoration-brand-error/30">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-2xl font-black text-brand-success">₹{product.discountPrice?.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-brand-success">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onAddToCart(product)}
              className="p-3 bg-brand-cta text-brand-primary rounded-2xl hover:bg-brand-cta-hover transition-all shadow-md active:scale-95"
              title="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewDetails(product.id)}
              className="p-3 bg-brand-primary text-white rounded-2xl hover:bg-brand-secondary transition-all shadow-md active:scale-95"
              title="View details"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
