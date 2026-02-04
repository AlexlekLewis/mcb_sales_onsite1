import React, { useState } from 'react';
import { X, Send, Loader2, Mail } from 'lucide-react';
import { Dialog } from '@headlessui/react'; // Assuming headlessui is available or we use a custom modal
// Actually, looking at the file list, I don't see headlessui. I'll build a custom modal using Tailwind.

interface EmailQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string, message: string) => Promise<void>;
    customerEmail?: string;
    customerName: string;
}

export function EmailQuoteModal({ isOpen, onClose, onSend, customerEmail = '', customerName }: EmailQuoteModalProps) {
    const [email, setEmail] = useState(customerEmail);
    const [message, setMessage] = useState(`Hi ${customerName},\n\nPlease find attached your quote from Modern Curtains & Blinds.\n\nKind regards,`);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setSending(true);
        try {
            await onSend(email, message);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1c1c24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Mail size={20} className="text-brand-orange" />
                        Email Quote
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Recipient Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="client@example.com"
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Message</label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all"
                        >
                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {sending ? 'Sending...' : 'Send Quote'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
