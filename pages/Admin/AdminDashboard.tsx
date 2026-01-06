
import React from 'react';
import {
  BarChart3,
  Users,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Search,
  ArrowUpRight,
  TrendingUp,
  Package,
  History,
  Layers,
  Check,
  X,
  Eye,
  EyeOff,
  Settings,
  ChevronRight,
  Zap,
  ShieldCheck,
  FileText,
  LogOut,
  Send,
  ArrowRight,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Product, Order, OrderStatus, Category, TechTag, DeliveryMethod } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabaseService } from '../../services/localService';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  categories: Category[];
  onRefresh: () => void;
  onBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  categories,
  onRefresh,
  onBack
}) => {
  const [activeView, setActiveView] = React.useState<'overview' | 'products' | 'categories' | 'orders' | 'requests'>('overview');
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
  const [customRequests, setCustomRequests] = React.useState<any[]>([]);

  const fetchRequests = async () => {
    if (!localStorage.getItem('devhub_token')) return;
    try {
      const data = await supabaseService.getCustomRequests();
      setCustomRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await supabaseService.updateRequestStatus(id, status);
      fetchRequests();
    } catch (error) {
      console.error('Update status failed:', error);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => o.status === OrderStatus.COMPLETED ? sum + o.totalAmount : sum, 0);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryIds = formData.getAll('categoryIds').filter(id => id !== '') as string[];
    const featuresInput = formData.getAll('features');
    const features = featuresInput.length > 0
      ? (featuresInput[0] as string).split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      fullDescription: formData.get('fullDescription') as string,
      price: parseFloat(formData.get('price') as string),
      discountPrice: parseFloat(formData.get('discountPrice') as string) || undefined,
      categories: categoryIds,
      techTag: formData.get('techTag') as TechTag,
      deliveryMethod: formData.get('deliveryMethod') as DeliveryMethod,
      deliveryContent: formData.get('deliveryContent') as string,
      imageUrl: formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      features: features,
      isPublished: editingProduct ? editingProduct.isPublished : true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      await supabaseService.saveProduct(productData);
      setIsAddingProduct(false);
      setEditingProduct(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
  };

  const handleToggleProductStatus = async (product: Product) => {
    try {
      await supabaseService.saveProduct({ ...product, isPublished: !product.isPublished });
      onRefresh();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Permanently delete this asset?')) {
      try {
        await supabaseService.deleteProduct(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substr(2, 5),
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      icon: 'Layers',
      description: formData.get('description') as string,
      isVisible: true,
      priority: categories.length + 1
    };

    try {
      await supabaseService.saveCategory(newCat);
      setIsAddingCategory(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Decommission this category?')) {
      try {
        await supabaseService.deleteCategory(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleApproveOrder = async (order: Order) => {
    if (!confirm(`Authorize this transaction and grant asset access to ${order.userEmail || 'user'}?`)) return;
    try {
      await supabaseService.updateOrderStatus(order.id, OrderStatus.COMPLETED);

      // Simulate Email Delivery
      const deliverables = order.items.map(i => `- ${i.name}: ${i.deliveryContent}`).join('\n');
      console.log(`%c[EMAIL SIMULATION] Sending to: ${order.userEmail}`, 'color: #00ff00; font-weight: bold');
      console.log(`Payload contents:\n${deliverables}`);

      alert(`Success! Order verified.\n\nDeliverable links have been dispatched to: ${order.userEmail || 'the user account'}.\n\nThe user can now also access these in their dashboard Library.`);

      onRefresh();
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Approve error:', error);
      alert('Authorization failed.');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans selection:bg-brand-admin-accent selection:text-brand-admin">
      {/* Sidebar */}
      <aside className="w-80 bg-brand-admin text-white flex flex-col fixed inset-y-0 shadow-2xl z-[100] print:hidden">
        <div className="p-10 flex-1 flex flex-col overflow-hidden">
          <button
            onClick={() => {
              supabaseService.signOut().then(() => window.location.reload());
            }}
            className="flex items-center gap-2 mb-8 px-4 py-2 bg-white/5 hover:bg-brand-error/20 text-white/50 hover:text-brand-error rounded-xl transition-all border border-white/5 hover:border-brand-error/30 group w-fit"
            title="Terminate Session"
          >
            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Immediate Logout</span>
          </button>

          <div className="flex items-center space-x-4 mb-10 group cursor-pointer shrink-0" onClick={onBack}>
            <div className="bg-brand-admin-accent/20 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
              <Zap className="h-6 w-6 text-brand-admin-accent" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase italic block leading-none">Developers Hub</span>
              <span className="text-[10px] font-black text-brand-admin-accent uppercase tracking-widest mt-1">Command Console</span>
            </div>
          </div>

          <nav className="space-y-3 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'products', icon: ShoppingBag, label: 'Inventory' },
              { id: 'categories', icon: Layers, label: 'Categories' },
              { id: 'orders', icon: History, label: 'Orders' },
              { id: 'requests', icon: FileText, label: 'Requests' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${activeView === item.id ? 'bg-brand-admin-accent text-brand-admin shadow-xl shadow-brand-admin-accent/20 translate-x-1' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center space-x-4">
                  <item.icon className="h-5 w-5" />
                  <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
                </div>
                {activeView === item.id && <div className="w-1.5 h-1.5 bg-brand-admin rounded-full animate-pulse" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-10 border-t border-white/5 space-y-4">
          <button
            onClick={onBack}
            className="w-full py-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 border border-white/5 flex items-center justify-center space-x-2"
          >
            <ArrowUpRight size={14} />
            <span>Launch Live Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-12 max-w-7xl print:ml-0 print:p-0">
        {activeView === 'overview' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Ecosystem Pulse</h1>
                <p className="text-content-secondary font-medium">Real-time performance metrics for Developers Hub.</p>
              </div>
              <div className="flex items-center gap-3 bg-brand-admin-accent/10 px-6 py-3 rounded-2xl border border-brand-admin-accent/20">
                <div className="w-2 h-2 bg-brand-admin-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                <span className="text-[10px] font-black text-brand-admin-accent uppercase tracking-[0.2em] italic">Command Deck Live</span>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'brand-success' },
                { label: 'Pending Authorizations', value: orders.filter(o => o.status === OrderStatus.AWAITING_VERIFICATION).length, color: 'brand-warning' },
                { label: 'Total Assets', value: products.length, color: 'brand-secondary' },
                { label: 'Pending Requests', value: customRequests.filter(r => r.status === 'pending').length, color: 'brand-cta' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-base-border shadow-sm group">
                  <p className="text-content-muted text-[10px] font-black uppercase tracking-widest mb-4 group-hover:text-brand-admin-accent transition-colors">{stat.label}</p>
                  <h3 className={`text-3xl font-black italic ${stat.color === 'brand-warning' && typeof stat.value === 'number' && stat.value > 0 ? 'text-brand-warning animate-pulse' : 'text-brand-primary'}`}>{stat.value}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'products' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Inventory Management</h1>
                <p className="text-content-secondary font-medium">Deploy and manage your digital hardware.</p>
              </div>
              <button
                onClick={() => { setEditingProduct(null); setIsAddingProduct(true); }}
                className="bg-brand-admin-accent text-brand-admin px-8 py-4 rounded-[20px] font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-brand-admin-accent/20"
              >
                <Plus size={20} /> Deploy New Asset
              </button>
            </header>

            <div className="bg-white rounded-[32px] border border-base-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-base-main bg-base-main/10">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
                  <input
                    placeholder="Search mission parameters..."
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-admin-accent shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 bg-base-main rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-brand-admin-accent cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-base-main/50 text-content-muted text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Asset</th>
                    <th className="px-8 py-6">Architecture</th>
                    <th className="px-8 py-6">Value</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-main">
                  {products.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (selectedCategory === 'all' || p.categories.includes(selectedCategory))
                  ).map(p => (
                    <tr key={p.id} className="hover:bg-base-main/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={p.imageUrl} className="w-14 h-14 rounded-xl object-contain bg-white shadow-md border border-base-border" alt="" />
                          <div>
                            <p className="font-black text-brand-primary uppercase italic">{p.name}</p>
                            <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest">{p.techTag}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border bg-base-main text-content-muted border-base-border">
                          {p.techTag}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-brand-primary">₹{p.price.toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.isPublished ? 'bg-brand-success/10 text-brand-success' : 'bg-base-main text-content-muted'}`}
                        >
                          {p.isPublished ? <Check size={12} /> : <EyeOff size={12} />}
                          {p.isPublished ? 'Operational' : 'Encrypted'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditProduct(p)} className="p-3 bg-base-main text-content-muted hover:text-brand-admin-accent rounded-xl transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-base-main text-content-muted hover:text-brand-error rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'categories' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Structural Classifications</h1>
                <p className="text-content-secondary font-medium">Define the taxonomy of your marketplace assets.</p>
              </div>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="bg-brand-admin-accent text-brand-admin px-8 py-4 rounded-[20px] font-black flex items-center gap-2"
              >
                <Plus size={20} /> Initialize Category
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-10 rounded-[40px] border border-base-border relative group overflow-hidden hover:shadow-2xl transition-all">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl bg-brand-primary text-white">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-brand-primary uppercase italic mb-2 tracking-tighter">{cat.name}</h3>
                  <p className="text-content-secondary text-sm font-medium leading-relaxed mb-8">{cat.description}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-base-main">
                    <span className="text-[10px] font-black text-content-muted uppercase tracking-widest">Level {cat.priority}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-content-muted hover:text-brand-error transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Fulfillment Ledger</h1>
              <p className="text-content-secondary font-medium">Audit logs for all successful mission deployments.</p>
            </header>

            <div className="bg-white rounded-[32px] border border-base-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-base-main/50 text-content-muted text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Mission Ref</th>
                    <th className="px-8 py-6">Operator</th>
                    <th className="px-8 py-6">Details</th>
                    <th className="px-8 py-6">Value</th>
                    <th className="px-8 py-6">Auth</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-main">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-base-main/30">
                      <td className="px-8 py-6 font-black text-brand-primary uppercase italic text-sm">#DH-{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-8 py-6">
                        <p className="text-content-secondary font-bold text-xs uppercase truncate w-32">{order.userId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {order.screenshotUrl ? (
                            <button
                              onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-base-border hover:border-brand-cta transition-all"
                            >
                              <img src={order.screenshotUrl} className="w-full h-full object-cover" alt="" />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-base-main flex items-center justify-center border border-base-border">
                              <X size={14} className="text-content-muted" />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-widest leading-none mb-1">Transaction ID</p>
                            <p className="text-xs font-black text-brand-primary break-all">{order.transactionId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-brand-success">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.COMPLETED ? 'bg-brand-success/10 text-brand-success' :
                          order.status === OrderStatus.AWAITING_VERIFICATION ? 'bg-brand-warning/10 text-brand-warning animate-pulse border border-brand-warning/20' :
                            'bg-base-main text-content-muted border border-base-border'
                          }`}>
                          {order.status === OrderStatus.AWAITING_VERIFICATION ? 'Verify Payment' : order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} className="p-2.5 bg-base-main text-content-muted hover:text-brand-admin-accent rounded-xl"><Search size={16} /></button>
                          <button onClick={() => handleDownloadInvoice(order)} className="p-2.5 bg-base-main text-content-muted hover:text-brand-secondary rounded-xl"><FileText size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'requests' && (
          <div className="space-y-12 animate-fade-up">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Project Manifests</h1>
                <p className="text-content-secondary font-medium">Custom build requests from the operative network.</p>
              </div>
            </header>

            <div className="bg-white rounded-[40px] border border-base-border shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-base-main/50 border-b border-base-border">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Requester</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Mission Target</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-main">
                  {customRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-black text-brand-primary text-sm uppercase italic">{req.fullName}</p>
                        <p className="text-xs text-content-muted font-medium">{req.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-brand-primary text-sm uppercase">{req.projectTitle}</p>
                        <p className="text-[10px] text-content-muted font-black uppercase tracking-widest mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <p className="text-xs text-content-secondary line-clamp-2 font-medium leading-relaxed">
                          {req.description}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <select
                          value={req.status}
                          onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-brand-cta cursor-pointer ${req.status === 'pending' ? 'bg-brand-warning/10 text-brand-warning' :
                            req.status === 'responded' ? 'bg-brand-success/10 text-brand-success' :
                              'bg-slate-100 text-slate-500'
                            }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="responded">Responded</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a
                          href={`mailto:${req.email}?subject=Regarding your custom build request: ${req.projectTitle}`}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/10"
                        >
                          <Send size={12} className="text-brand-cta" />
                          Reply via Mail
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Global Modal Overlays */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-[200] bg-brand-admin/60 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-base-border flex justify-between items-center bg-base-main/50">
                <h2 className="text-2xl font-black text-brand-primary uppercase italic">{editingProduct ? 'Update Blueprint' : 'Deploy New Asset'}</h2>
                <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-3 hover:bg-white rounded-2xl transition-all text-content-muted hover:text-brand-error"><X /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Asset Name</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Categories (Ctrl+Click)</label>
                    <select name="categoryIds" multiple defaultValue={editingProduct?.categories} className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none min-h-[120px]">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Base Price (₹)</label>
                    <input name="price" type="number" step="1" defaultValue={editingProduct?.price} required className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none text-brand-success" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Distribution Hub (URL)</label>
                    <input name="deliveryContent" defaultValue={editingProduct?.deliveryContent} required className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Asset Visual URL</label>
                    <input name="imageUrl" defaultValue={editingProduct?.imageUrl} className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Mission Pitch (Description)</label>
                  <textarea name="description" defaultValue={editingProduct?.description} required rows={2} className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Core Capabilities (Comma-separated)</label>
                  <input name="features" defaultValue={editingProduct?.features.join(', ')} required className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Operational Blueprints (Documentation)</label>
                  <textarea name="fullDescription" defaultValue={editingProduct?.fullDescription} required rows={5} className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-brand-admin text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
                  <Zap size={20} className="text-brand-admin-accent" />
                  {editingProduct ? 'Finalize Blueprint Update' : 'Initialize Deployment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {isAddingCategory && (
          <div className="fixed inset-0 z-[200] bg-brand-admin/60 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-base-border flex justify-between items-center bg-base-main/50">
                <h2 className="text-2xl font-black text-brand-primary uppercase italic">Define Category</h2>
                <button onClick={() => setIsAddingCategory(false)} className="p-3 hover:bg-white rounded-2xl transition-all text-content-muted hover:text-brand-error"><X /></button>
              </div>
              <form onSubmit={handleSaveCategory} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-content-muted">Name</label>
                  <input name="name" required className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-content-muted">Mission Statement</label>
                  <textarea name="description" required rows={3} className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-brand-admin text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all">Initialize Classification</button>
              </form>
            </div>
          </div>
        )}

        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[300] bg-brand-admin/80 backdrop-blur-xl flex items-center justify-center p-8 print:p-0 print:bg-white print:fixed print:inset-0 sm:z-[200]">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:shadow-none print:rounded-none">
              <div className="p-8 border-b border-base-border flex justify-between items-center bg-base-main/50 print:hidden">
                <h2 className="text-xl font-black text-brand-primary uppercase italic flex items-center gap-2">
                  <ShieldCheck size={20} className="text-brand-admin-accent" />
                  Mission Manifest
                </h2>
                <button onClick={() => setIsOrderModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all text-content-muted hover:text-brand-error"><X /></button>
              </div>
              <div className="p-12 overflow-y-auto custom-scrollbar flex-1 space-y-12 print:overflow-visible">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-5xl font-black text-brand-primary tracking-tighter uppercase italic leading-none mb-3">Invoice</h1>
                    <p className="text-content-muted font-bold text-[10px] uppercase tracking-[0.4em]">Developers Hub Engineering Hub</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-1">Reference ID</p>
                    <p className="text-2xl font-black text-brand-primary italic">#DH-{selectedOrder.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 bg-base-main/30 p-8 rounded-[32px] border border-base-border">
                  <div>
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-4">Operator Clearance</p>
                    <p className="font-extrabold text-brand-primary text-sm break-all">{selectedOrder.userId}</p>
                    {selectedOrder.status === OrderStatus.COMPLETED ? (
                      <p className="text-[10px] font-black text-brand-success uppercase tracking-widest mt-2 flex items-center gap-1">
                        <Check size={12} /> Verified Transaction
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-brand-warning uppercase tracking-widest mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> Awaiting Authorization
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-4">Timestamp</p>
                    <p className="font-extrabold text-brand-primary text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    {selectedOrder.transactionId && (
                      <p className="text-[10px] font-black text-brand-primary uppercase mt-2 italic">Ref: {selectedOrder.transactionId}</p>
                    )}
                  </div>
                </div>

                {selectedOrder.screenshotUrl && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <p className="text-[10px] font-black text-content-muted uppercase tracking-widest">Payment Proof (Screenshot)</p>
                      <a
                        href={selectedOrder.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-brand-cta uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink size={12} /> View Full Meta-data
                      </a>
                    </div>
                    <div className="rounded-[40px] overflow-hidden border-4 border-base-main shadow-2xl bg-base-main/10 relative group">
                      <img
                        src={selectedOrder.screenshotUrl}
                        alt="Payment Proof"
                        className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in transition-all duration-500 group-hover:scale-[1.05]"
                        onClick={() => window.open(selectedOrder.screenshotUrl, '_blank')}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/f8fafc/64748b?text=Snapshot+Loading+Failure';
                        }}
                      />
                      <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Search className="text-white h-12 w-12" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-content-muted uppercase tracking-widest px-2">Payload Contents</p>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-base-border shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-base-main rounded-xl flex items-center justify-center border border-base-border">
                            <Package size={20} className="text-brand-primary" />
                          </div>
                          <div>
                            <p className="font-black text-brand-primary uppercase italic text-sm">{item.name}</p>
                            <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest">{item.techTag}</p>
                          </div>
                        </div>
                        <p className="font-black text-brand-primary">₹{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-10 bg-brand-primary text-white rounded-[40px] shadow-2xl shadow-brand-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 bg-white/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Mission Valuation</p>
                    <p className="text-5xl font-black italic tracking-tighter">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="relative z-10 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Auth Status</p>
                    <div className="flex items-center gap-2 justify-end">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${selectedOrder.status === OrderStatus.COMPLETED ? 'bg-brand-success' : 'bg-brand-warning'}`}></div>
                      <p className={`font-black uppercase tracking-widest text-sm italic ${selectedOrder.status === OrderStatus.COMPLETED ? 'text-brand-success' : 'text-brand-warning'}`}>
                        {selectedOrder.status === OrderStatus.COMPLETED ? 'Secured' : 'Pending Auth'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-base-main flex flex-col gap-4 print:hidden">
                  {selectedOrder.status === OrderStatus.AWAITING_VERIFICATION && (
                    <button
                      onClick={() => handleApproveOrder(selectedOrder)}
                      className="w-full py-5 bg-brand-success text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-brand-success/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Check size={18} />
                      Verify Payment & Grant Access
                    </button>
                  )}
                  <button onClick={() => window.print()} className="w-full py-5 bg-base-main text-brand-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white border border-transparent hover:border-base-border transition-all flex items-center justify-center gap-3">
                    <FileText size={18} />
                    Generate Hard Copy Manifest
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
