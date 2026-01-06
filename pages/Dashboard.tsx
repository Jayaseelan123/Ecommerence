import React from 'react';
import { User, Package, Download, History, ExternalLink, Settings, ShieldCheck, HelpCircle, FileText, X, ArrowRight, Lock } from 'lucide-react';
import { Order, OrderStatus, DeliveryMethod } from '../types';
import { supabaseService } from '../services/localService';

interface DashboardProps {
  user: any;
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, orders }) => {
  const [activeTab, setActiveTab] = React.useState<'library' | 'orders' | 'settings'>('library');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const libraryItems = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .flatMap(o => o.items);

  const totalSpent = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 animate-fade-in">
      {/* Premium Header Card */}
      <div className="bg-brand-primary rounded-[48px] p-8 lg:p-16 text-white relative overflow-hidden mb-12 shadow-2xl shadow-brand-primary/20">
        <div className="absolute top-0 right-0 p-40 bg-brand-secondary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 p-40 bg-brand-cta/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 flex items-center justify-center shadow-2xl relative group">
              <User className="h-10 w-10 text-brand-cta" />
              <div className="absolute -bottom-2 -right-2 bg-brand-success w-6 h-6 rounded-full border-4 border-brand-primary flex items-center justify-center">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-brand-cta font-black text-[10px] uppercase tracking-[0.3em] mb-2 px-1">Verified Operator</p>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">{user.fullName}</h1>
              <p className="text-white/60 font-medium mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></span>
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto">
            <div className="bg-white/5 backdrop-blur-md px-8 py-6 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Assets</p>
              <p className="text-3xl font-black">{libraryItems.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-8 py-6 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Investment</p>
              <p className="text-3xl font-black text-brand-cta">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="hidden lg:block bg-white/5 backdrop-blur-md px-8 py-6 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</p>
              <p className="text-3xl font-black text-brand-success">Elite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="lg:w-72 flex flex-col gap-2">
          {[
            { id: 'library', icon: Package, label: 'Asset Library' },
            { id: 'orders', icon: History, label: 'Transactions' },
            { id: 'settings', icon: Settings, label: 'Security Deck' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-between px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 translate-x-2' : 'bg-white text-content-muted hover:text-content-primary border border-base-border hover:border-brand-secondary shadow-sm'}`}
            >
              <div className="flex items-center gap-4">
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && <ArrowRight size={14} className="animate-in slide-in-from-left-2 duration-300" />}
            </button>
          ))}
        </aside>

        <div className="flex-1 min-h-[600px] bg-white rounded-[40px] border border-base-border shadow-sm p-8 lg:p-12 overflow-hidden">
          {activeTab === 'library' && (
            <div className="space-y-12 animate-fade-up">
              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Your Deliverables</h2>
                  <p className="text-slate-400 font-medium mt-1">Instant access to all your engineering payloads.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-brand-success/5 px-4 py-2 rounded-2xl border border-brand-success/20">
                  <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-success">Unified Sync Active</span>
                </div>
              </div>

              {libraryItems.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                  <Package className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-xl font-black text-slate-900">The library is empty</h3>
                  <p className="text-slate-400 mt-2 font-medium">Acquire engineering blueprints and they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {libraryItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <img src={item.imageUrl} className="w-16 h-16 object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform" alt={item.name} />
                        <span className="text-[10px] font-black text-brand-success bg-brand-success/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-brand-success/20">
                          {item.techTag}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-content-primary mb-2 truncate">{item.name}</h3>
                      <p className="text-sm text-content-secondary font-medium leading-relaxed mb-8 line-clamp-2">{item.description}</p>

                      <div className="mt-auto space-y-3 pt-6 border-t border-base-border">
                        {item.deliveryMethod === DeliveryMethod.FILE ? (
                          <a href={item.deliveryContent} download className="w-full bg-brand-cta text-brand-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-cta-hover transition-all shadow-xl shadow-brand-cta/20">
                            <Download size={16} /> Deploy Payload
                          </a>
                        ) : (
                          <a href={item.deliveryContent} target="_blank" className="w-full bg-brand-cta text-brand-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-cta-hover transition-all shadow-xl shadow-brand-cta/20">
                            <ExternalLink size={16} /> Access Repository
                          </a>
                        )}
                        <button className="w-full bg-base-main text-content-secondary py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-base-border transition-colors flex items-center justify-center gap-2">
                          <FileText size={14} /> View Manifest
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-12 animate-fade-up">
              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Transaction History</h2>
                  <p className="text-slate-400 font-medium mt-1">Audit log of all marketplace activity.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
                    <tr>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Assets</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Total Value</th>
                      <th className="px-6 py-4">Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="text-content-secondary hover:bg-base-main/50 transition-colors">
                        <td className="px-6 py-8">
                          <span className="font-black text-content-primary text-sm">#DH-{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-xs font-bold text-content-muted">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex -space-x-2">
                            {order.items.map((item, j) => (
                              <img key={j} src={item.imageUrl} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-[10px] font-black text-brand-primary uppercase italic">{order.transactionId || 'Awaiting Ref'}</p>
                        </td>
                        <td className="px-6 py-8 font-black text-brand-success text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-8">
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.COMPLETED ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
                              order.status === OrderStatus.FAILED ? 'bg-brand-error/10 text-brand-error border border-brand-error/20' :
                                order.status === OrderStatus.AWAITING_VERIFICATION ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20' :
                                  'bg-base-main text-content-muted border border-base-border'
                              }`}>
                              {order.status === OrderStatus.AWAITING_VERIFICATION ? 'Pending verification' : order.status}
                            </span>
                            <button
                              onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                              className="p-2 text-content-muted hover:text-brand-primary transition-colors flex items-center gap-1 group"
                              title="View Details"
                            >
                              <FileText size={18} />
                              <span className="text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && (
                <div className="text-center py-20 text-content-muted font-black italic uppercase tracking-widest bg-base-main/50 rounded-3xl">No transaction history recorded</div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-12 animate-fade-up">
              <section className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <ShieldCheck size={120} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight italic">
                  <User size={24} className="text-indigo-600" />
                  Operator Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Name</p>
                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 font-bold text-slate-900 shadow-sm">
                      {user.fullName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Channel</p>
                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 font-bold text-slate-900 shadow-sm">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clearance Level</p>
                    <div className="flex items-center gap-2 bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                      <p className="font-black text-indigo-600 uppercase text-sm tracking-widest">Verified Engineer</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 text-rose-600 uppercase tracking-tight italic">
                  <Lock size={20} />
                  Restriction Zone
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-rose-50/50 rounded-3xl border border-rose-100">
                  <div>
                    <h4 className="font-black text-rose-900 text-lg">Terminate Active Session</h4>
                    <p className="text-sm text-rose-600/70 font-bold mt-1 max-w-sm">Securely clear your local tokens and exit the Developers Hub environment. All active downloads will be paused.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="whitespace-nowrap bg-rose-600 text-white px-12 py-5 rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95 flex items-center gap-2 group"
                  >
                    <span>Exit Command Deck</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
      {/* Order Invoice Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[300] bg-brand-primary/80 backdrop-blur-xl flex items-center justify-center p-8 print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:shadow-none print:rounded-none">
            <div className="p-8 border-b border-base-border flex justify-between items-center bg-base-main/50 print:hidden">
              <h2 className="text-xl font-black text-brand-primary uppercase italic flex items-center gap-2">
                <FileText size={20} className="text-brand-cta" />
                Transaction Receipt
              </h2>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all text-content-muted hover:text-brand-error"><X /></button>
            </div>
            <div className="p-12 overflow-y-auto custom-scrollbar flex-1 space-y-12 print:overflow-visible">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-5xl font-black text-brand-primary tracking-tighter uppercase italic leading-none mb-3">Invoice</h1>
                  <p className="text-content-muted font-bold text-[10px] uppercase tracking-[0.4em]">Developers Hub Digital Assets</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-1">Reference</p>
                  <p className="text-2xl font-black text-brand-primary italic">#DH-{selectedOrder.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 bg-base-main/30 p-8 rounded-[32px] border border-base-border">
                <div>
                  <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-4">Customer</p>
                  <p className="font-extrabold text-brand-primary text-sm">{user.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-4">Date</p>
                  <p className="font-extrabold text-brand-primary text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-content-muted uppercase tracking-widest px-2">Verification Proof</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-base-main/50 p-6 rounded-3xl border border-base-border">
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-2">Transaction ID</p>
                    <p className="font-extrabold text-brand-primary break-all">{selectedOrder.transactionId || 'Awaiting Submission'}</p>
                  </div>
                  {selectedOrder.screenshotUrl && (
                    <div className="bg-base-main/50 p-6 rounded-3xl border border-base-border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-1">Payment Snapshot</p>
                        <p className="text-xs font-bold text-brand-success">Attached</p>
                      </div>
                      <button onClick={() => window.open(selectedOrder.screenshotUrl, '_blank')} className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-all text-brand-primary">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-content-muted uppercase tracking-widest px-2">Investment Detail</p>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-base-border shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-base-main rounded-xl flex items-center justify-center border border-base-border">
                          <Package size={20} className="text-brand-primary" />
                        </div>
                        <div>
                          <p className="font-black text-brand-primary uppercase italic text-sm">{item.name}</p>
                        </div>
                      </div>
                      <p className="font-black text-brand-primary">₹{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-10 bg-brand-primary text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Amount</p>
                  <p className="text-5xl font-black italic tracking-tighter">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Authorization</p>
                  <p className={`font-black uppercase tracking-widest text-sm italic ${selectedOrder.status === OrderStatus.COMPLETED ? 'text-brand-cta' : 'text-brand-warning'}`}>
                    {selectedOrder.status === OrderStatus.COMPLETED ? 'Fulfillment Verified' : 'Awaiting Approval'}
                  </p>
                </div>
              </div>

              <div className="pt-12 border-t border-base-main text-center print:hidden">
                <button onClick={() => window.print()} className="px-12 py-5 bg-brand-cta text-brand-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-cta-hover transition-all flex items-center gap-3 mx-auto shadow-xl shadow-brand-cta/20">
                  <Download size={18} />
                  Download Manifest PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
