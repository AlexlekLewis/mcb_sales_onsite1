import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CameraCapture() {
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const clearImage = () => {
        setImage(null);
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async () => {
        if (!file) return;

        setUploading(true);
        // Mock upload (replace with Supabase Storage logic when bucket is ready)
        // await supabase.storage.from('site-photos').upload(`images/${Date.now()}.png`, file);

        // Simulate delay
        setTimeout(() => {
            alert("Photo uploaded successfully! (Mock)");
            setUploading(false);
            clearImage();
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Site Photos</h2>
                <p className="text-slate-300">Capture and upload photos of the installation area.</p>
            </div>

            <div className="bg-background-card rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                {!image ? (
                    <div className="text-center">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleCapture}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6 hover:bg-brand-orange/20 transition-all cursor-pointer group"
                        >
                            <Camera size={48} className="text-brand-orange group-hover:scale-110 transition-transform" />
                        </button>
                        <h3 className="text-xl font-medium text-white mb-2">Take a Photo</h3>
                        <p className="text-slate-400">Tap the camera icon to launch camera<br />or select from gallery</p>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center">
                        <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden mb-6 border border-white/10">
                            <img src={image} alt="Preview" className="w-full h-full object-contain" />
                            <button
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={clearImage}
                                className="px-6 py-3 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 transition-colors"
                            >
                                Retake
                            </button>
                            <button
                                onClick={uploadImage}
                                disabled={uploading}
                                className="px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange-light transition-colors flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>Uploading...</>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Photo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
