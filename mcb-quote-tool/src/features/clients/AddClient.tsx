import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2, User, Mail, Phone, MapPin } from 'lucide-react';

export function AddClient() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [suburb, setSuburb] = useState('');
    const [state, setState] = useState('VIC');
    const [postcode, setPostcode] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Please enter a client name');
            return;
        }

        setSaving(true);

        const { error } = await supabase.from('customers').insert({
            name,
            email,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2,
            suburb,
            state,
            postcode,
            notes,
        });

        if (error) {
            console.error(error);
            alert('Error saving client');
            setSaving(false);
            return;
        }

        navigate('/clients');
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/clients')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-slate-300" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Add Client</h2>
                    <p className="text-slate-300">Enter customer details.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-background-card rounded-2xl p-6 border border-white/5 space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2"><User size={18} /> Contact Information</h3>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name"
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0400 000 000"
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-background-card rounded-2xl p-6 border border-white/5 space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2"><MapPin size={18} /> Address</h3>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                        <input
                            type="text"
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            placeholder="123 Main Street"
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address Line 2</label>
                        <input
                            type="text"
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                            placeholder="Unit, suite, etc."
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suburb</label>
                            <input
                                type="text"
                                value={suburb}
                                onChange={(e) => setSuburb(e.target.value)}
                                placeholder="Richmond"
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange"
                            >
                                <option value="VIC">VIC</option>
                                <option value="NSW">NSW</option>
                                <option value="QLD">QLD</option>
                                <option value="WA">WA</option>
                                <option value="SA">SA</option>
                                <option value="TAS">TAS</option>
                                <option value="NT">NT</option>
                                <option value="ACT">ACT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Postcode</label>
                            <input
                                type="text"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value)}
                                placeholder="3000"
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-background-card rounded-2xl p-6 border border-white/5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange resize-none"
                    />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Client
                    </button>
                </div>
            </div>
        </div>
    );
}
