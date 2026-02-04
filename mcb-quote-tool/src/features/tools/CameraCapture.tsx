import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CameraCapture() {
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setHasCameraAccess(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setHasCameraAccess(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageDataUrl = canvas.toDataURL('image/png');
                setImage(imageDataUrl);

                // Convert to file for upload
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "capture.png", { type: "image/png" });
                        setFile(file);
                    }
                }, 'image/png');

                // Pause live feed implicitly by showing image state
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Restart camera if we cleared a capture
        if (hasCameraAccess) {
            // giving a slight delay to ensure UI renders video element
            setTimeout(startCamera, 100);
        }
    };

    const uploadImage = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const timestamp = Date.now();
            const fileName = `images/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('site-photos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Save metadata to notes table
            const { error: dbError } = await supabase
                .from('notes')
                .insert({
                    type: 'photo',
                    content: 'Site Photo Upload',
                    file_path: fileName,
                    user_id: (await supabase.auth.getUser()).data.user?.id
                });

            if (dbError) throw dbError;

            alert("Photo uploaded successfully!");
            clearImage();
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            alert(`Failed to upload photo: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Site Photos</h2>
                <p className="text-slate-300">Capture and upload photos of the installation area.</p>
            </div>

            <div className="bg-background-card rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                {/* Hidden canvas for capture processing */}
                <canvas ref={canvasRef} className="hidden" />

                {!image ? (
                    <div className="w-full h-full flex flex-col items-center">
                        {hasCameraAccess === true ? (
                            <>
                                <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden mb-6 border border-white/10 shadow-lg">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={handleCapture}
                                    className="w-20 h-20 bg-white rounded-full border-4 border-brand-orange hover:scale-105 transition-transform flex items-center justify-center shadow-lg shadow-brand-orange/20"
                                >
                                    <div className="w-16 h-16 bg-brand-orange rounded-full" />
                                </button>
                                <p className="mt-4 text-slate-400">Tap to capture</p>
                            </>
                        ) : (
                            <div className="text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-32 h-32 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6 hover:bg-brand-orange/20 transition-all cursor-pointer group"
                                >
                                    <Camera size={48} className="text-brand-orange group-hover:scale-110 transition-transform" />
                                </button>
                                <h3 className="text-xl font-medium text-white mb-2">Take a Photo</h3>
                                <p className="text-slate-400">Camera access not available.<br />Tap camera icon to upload file.</p>
                            </div>
                        )}
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
