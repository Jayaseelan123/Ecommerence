import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Category, OrderStatus } from './types';
import { supabaseService, supabase } from './services/localService';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Landing from './pages/Landing';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AboutPage from './pages/AboutPage';
import { Loader2 } from 'lucide-react';
import ManualUPIModal from './components/ManualUPIModal';

type View = 'home' | 'store' | 'product' | 'dashboard' | 'admin' | 'checkout' | 'login' | 'admin-login' | 'about';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [user, setUser] = useState<{ id: string, email: string, fullName: string, role: string } | null>(null);

  const loadData = async () => {
    try {
      const isAdmin = user?.role === 'admin';
      const [fetchedProducts, fetchedCategories, fetchedOrders] = await Promise.all([
        supabaseService.getProducts(isAdmin),
        supabaseService.getCategories(),
        user ? supabaseService.getOrders(isAdmin ? undefined : user.id) : Promise.resolve([])
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await supabaseService.getCurrentUser();
      setUser(currentUser);

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata.full_name || 'Anonymous',
            role: session.user.user_metadata.role || 'user'
          });
        } else {
          setUser(null);
        }
      });
    };
    initAuth();
  }, []);

  useEffect(() => {
    loadData();
    const savedCart = localStorage.getItem('devhub_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    // Background polling for real-time updates (every 5 seconds)
    const pollInterval = setInterval(() => {
      if (user) {
        loadData();
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user]);

  useEffect(() => {
    localStorage.setItem('devhub_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleExplore = (slug?: string) => {
    setActiveCategorySlug(slug || null);
    setView('store');
    window.scrollTo(0, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      setView('login');
      return;
    }

    setIsProcessing(true);
    const total = cart.reduce((sum, item) => {
      const price = item.discountPrice || item.price;
      return sum + price * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: crypto.randomUUID(),
      userId: user.id,
      items: [...cart],
      totalAmount: total,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    setCurrentOrder(newOrder);
    setIsPaymentModalOpen(true);
    setIsCartOpen(false);
    setIsProcessing(false);
  };

  const handlePaymentSuccess = async (screenshotUrl: string, transactionId: string) => {
    if (!currentOrder) return;

    setIsProcessing(true);
    setIsPaymentModalOpen(false);

    try {
      console.log('Finalizing order with proof URL:', screenshotUrl);
      const finalizedOrder: Order = {
        ...currentOrder,
        screenshotUrl,
        transactionId,
        status: OrderStatus.AWAITING_VERIFICATION
      };

      await supabaseService.saveOrder(finalizedOrder);
      console.log('Order successfully saved to database');
      await loadData();

      setCart([]);
      setCurrentOrder(null);
      setIsProcessing(false);
      setView('dashboard');
    } catch (error: any) {
      console.error('Finalize order error:', error);
      setIsProcessing(false);
      alert(`Integration Error: ${error.message || 'Database synchronization failed'}. Please verify that you have run the latest SQL migration and your 'orders' table has 'screenshot_url' and 'transaction_id' columns.`);
    }
  };

  const handleDashboardClick = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('login');
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setView('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {view !== 'admin' && (
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onStoreClick={() => handleExplore()}
          onHomeClick={() => setView('home')}
          onAdminClick={() => setView('admin')}
          onDashboardClick={handleDashboardClick}
          onLogout={handleLogout}
          user={user}
        />
      )}

      <main className="transition-all duration-300">
        {view === 'home' && (
          <Landing
            categories={categories}
            featuredProducts={products.slice(0, 6)}
            onExplore={handleExplore}
            onViewProduct={(id) => { setSelectedProductId(id); setView('product'); }}
            onAddToCart={handleAddToCart}
            onRequestCustom={() => setView('about')}
          />
        )}

        {view === 'login' && (
          <LoginPage
            onLoginSuccess={(loggedUser) => {
              setUser(loggedUser);
              setView(loggedUser.role === 'admin' ? 'admin' : 'dashboard');
            }}
            onAdminLogin={() => setView('admin-login')}
          />
        )}

        {view === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={(loggedUser) => {
              setUser(loggedUser);
              setView('admin');
            }}
            onBackToSite={() => setView('login')}
          />
        )}

        {view === 'store' && (
          <Store
            products={products}
            categories={categories}
            initialCategoryId={activeCategorySlug ? categories.find(c => c.slug === activeCategorySlug)?.id : 'All'}
            onViewProduct={(id) => { setSelectedProductId(id); setView('product'); }}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === 'product' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setView('store')}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard user={user} orders={orders} />
        )}

        {view === 'about' && (
          <AboutPage />
        )}

        {view === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            categories={categories}
            onRefresh={loadData}
            onBack={() => setView('home')}
          />
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={(id, delta) => {
          setCart(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
          ));
        }}
        onRemove={(id) => setCart(prev => prev.filter(item => item.id !== id))}
        onCheckout={handleCheckout}
      />

      {isProcessing && (
        <div className="fixed inset-0 z-[400] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-brand-primary animate-spin mb-6" />
            <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full"></div>
          </div>
          <h2 className="text-3xl font-black text-brand-primary tracking-tight uppercase italic">Securing Payload Data</h2>
          <p className="text-content-muted font-bold mt-2 uppercase tracking-widest text-[10px]">Processing encrypted transaction...</p>
        </div>
      )}

      {isPaymentModalOpen && currentOrder && (
        <ManualUPIModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={currentOrder.id}
          amount={currentOrder.totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default App;
