
import React from 'react';
/* Added ArrowRight to imports */
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6 text-indigo-600" />
                Your Cart
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Your cart is empty</h3>
                <p className="text-slate-500 mt-2">Start exploring our premium workflows!</p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.discountPrice && item.discountPrice < item.price ? (
                          <>
                            <p className="text-indigo-600 font-bold">₹{item.discountPrice.toLocaleString('en-IN')}</p>
                            <p className="text-slate-400 line-through text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                          </>
                        ) : (
                          <p className="text-indigo-600 font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 border border-slate-200 rounded hover:bg-slate-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black text-content-secondary uppercase tracking-widest">Total Investment</span>
                <span className="text-3xl font-black text-brand-success">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-brand-cta text-brand-primary py-6 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-brand-cta-hover transition-all shadow-2xl shadow-brand-cta/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span>Initialize Checkout</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
