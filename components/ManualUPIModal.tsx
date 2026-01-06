
import React, { useState } from 'react';
import { X, Upload, BadgeCheck, AlertCircle, QrCode, Copy, Check } from 'lucide-react';
import { supabaseService } from '../services/localService';
import { OrderStatus } from '../types';

interface ManualUPIModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    amount: number;
    onSuccess: (screenshotUrl: string, transactionId: string) => void;
}

const ManualUPIModal: React.FC<ManualUPIModalProps> = ({
    isOpen,
    onClose,
    orderId,
    amount,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);

    const upiId = 'wasiqmohideen786@okicici'; // Placeholder UPI ID
    const formattedAmount = amount.toFixed(2);
    const upiData = `upi://pay?pa=${upiId}&pn=DevelopersHub&am=${formattedAmount}&cu=INR&tn=Order_${orderId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiData)}`;

    const handleCopyUPI = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please upload payment screenshot');
            return;
        }

        setIsUploading(true);
        console.log('Initiating upload for order:', orderId);
        try {
            const screenshotUrl = await supabaseService.uploadScreenshot(orderId, file);
            console.log('Upload successful! URL:', screenshotUrl);
            onSuccess(screenshotUrl, transactionId);
        } catch (error: any) {
            console.error('CRITICAL: Upload Protocol Failed:', error);
            alert(`Payment Submission Failed: ${error.message || 'Unknown error'}. 
Please ensure your Cloud Storage engine is active and your internet connection is stable.`);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-brand-primary/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-base-main bg-base-main/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-cta rounded-2xl flex items-center justify-center">
                            <QrCode className="text-brand-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-brand-primary uppercase italic">Secure UPI Payment</h2>
                            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Manual Verification Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-content-muted hover:text-brand-error">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="bg-base-main rounded-[32px] p-8 flex flex-col items-center">
                                <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 rounded-2xl shadow-lg border-8 border-white mb-4" />
                                <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mt-2">{upiId}</p>
                                <button
                                    type="button"
                                    onClick={handleCopyUPI}
                                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 rounded-2xl border border-base-border transition-all text-sm font-black text-brand-primary uppercase tracking-widest active:scale-95"
                                >
                                    {copied ? <Check size={16} className="text-brand-success" /> : <Copy size={16} />}
                                    <span>{copied ? 'Copied' : 'Copy UPI ID'}</span>
                                </button>
                            </div>

                            <div className="p-6 bg-brand-warning/10 rounded-3xl border border-brand-warning/20">
                                <div className="flex gap-3">
                                    <AlertCircle className="text-brand-warning shrink-0" size={20} />
                                    <div>
                                        <p className="text-xs font-black text-brand-warning uppercase tracking-tight mb-1">Time Critical Protocol</p>
                                        <p className="text-[10px] font-bold text-content-muted leading-relaxed">Deliverable link will reach to you in 30min to 2hours. Please be patient while we verify your transaction.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Order Amount</label>
                                <div className="bg-brand-success/10 px-8 py-6 rounded-3xl border border-brand-success/20">
                                    <p className="text-4xl font-black text-brand-success italic">₹{amount.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-brand-success uppercase tracking-widest mt-1">Exact valuation required</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Transaction Ref (Mandatory)</label>
                                <input
                                    placeholder="UTR / Transaction ID"
                                    className="w-full px-6 py-4 bg-base-main rounded-2xl font-bold border-none focus:ring-2 focus:ring-brand-cta transition-all"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Payment Proof (Screenshot)</label>
                                <div className={`relative group transition-all ${file ? 'border-brand-success bg-brand-success/5' : 'border-dashed border-2 border-base-border hover:border-brand-cta'} rounded-[32px] overflow-hidden`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="p-8 flex flex-col items-center justify-center text-center">
                                        {file ? (
                                            <>
                                                <BadgeCheck size={40} className="text-brand-success mb-2" />
                                                <p className="text-sm font-black text-brand-primary truncate w-full">{file.name}</p>
                                                <p className="text-[10px] font-bold text-brand-success uppercase mt-1">Proof Attached</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={40} className="text-content-muted group-hover:text-brand-cta transition-colors mb-2" />
                                                <p className="text-sm font-black text-brand-primary">Drop Manifest Proof</p>
                                                <p className="text-[10px] font-bold text-content-muted uppercase mt-1">Click to browse filesystem</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || !transactionId || isUploading}
                        className={`w-full py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${file && transactionId ? 'bg-brand-primary text-white hover:shadow-2xl hover:shadow-brand-primary/20' : 'bg-base-main text-content-muted cursor-not-allowed'}`}
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Securing Upload...</span>
                            </div>
                        ) : (
                            <>
                                <BadgeCheck size={20} className="text-brand-cta" />
                                <span>Submit Proof for Verification</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManualUPIModal;
