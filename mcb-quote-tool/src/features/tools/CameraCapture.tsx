import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Trash2, Image as ImageIcon, Clock, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QuoteSelector } from '../../components/ui/QuoteSelector';

interface SavedPhoto {
    id: string;
    file_path: string;
    content: string;
    created_at: string;
    quote_id?: string;
    quote_name?: string;
    url?: string;
}

interface CameraCaptureProps {
    /** When provided, auto-links all photos to this quote (hides QuoteSelector) */
    quoteId?: string;
    /** Compact mode — hides page header, reduces padding */
    compact?: boolean;
}

export function CameraCapture({ quoteId, compact }: CameraCaptureProps = {}) {
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

    // Quote linking — use prop if provided, otherwise local state for standalone mode
    const [localQuoteId, setLocalQuoteId] = useState<string | null>(null);
    const [localQuoteName, setLocalQuoteName] = useState<string | null>(null);
    const selectedQuoteId = quoteId || localQuoteId;
    const selectedQuoteName = localQuoteName;

    // Gallery state
    const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    // Load saved photos
    const fetchSavedPhotos = useCallback(async () => {
        setLoadingPhotos(true);
        let query = supabase
            .from('notes')
            .select('id, file_path, content, created_at, quote_id')
            .eq('type', 'photo')
            .order('created_at', { ascending: false })
            .limit(20);

        // If a quote is selected, only show photos for that quote
        if (selectedQuoteId) {
            query = query.eq('quote_id', selectedQuoteId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching photos:', error);
            setLoadingPhotos(false);
            return;
        }

        // Generate signed URLs for each photo
        const photosWithUrls: SavedPhoto[] = [];
        for (const photo of (data || [])) {
            if (photo.file_path) {
                const { data: urlData } = await supabase.storage
                    .from('site-photos')
                    .createSignedUrl(photo.file_path, 3600); // 1 hour expiry

                photosWithUrls.push({
                    ...photo,
                    url: urlData?.signedUrl || undefined,
                });
            } else {
                photosWithUrls.push(photo);
            }
        }

        setSavedPhotos(photosWithUrls);
        setLoadingPhotos(false);
    }, [selectedQuoteId]);

    useEffect(() => {
        fetchSavedPhotos();
    }, [fetchSavedPhotos]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setHasCameraAccess(true);
        } catch {
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

                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setImage(imageDataUrl);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const capturedFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
                            setFile(capturedFile);
                        }
                    },
                    'image/jpeg',
                    0.85
                );
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
        if (hasCameraAccess) {
            setTimeout(startCamera, 100);
        }
    };

    const uploadImage = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const timestamp = Date.now();
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `images/${timestamp}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('site-photos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get user if available (may be null during dev mode)
            const { data: { user } } = await supabase.auth.getUser();

            const noteRecord: Record<string, unknown> = {
                type: 'photo',
                content: selectedQuoteName ? `Site Photo — ${selectedQuoteName}` : 'Site Photo',
                file_path: fileName,
            };
            if (user?.id) noteRecord.user_id = user.id;
            if (selectedQuoteId) noteRecord.quote_id = selectedQuoteId;

            const { error: dbError } = await supabase.from('notes').insert(noteRecord);

            if (dbError) throw dbError;

            clearImage();
            await fetchSavedPhotos();
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            alert(`Failed to upload: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const deletePhoto = async (photo: SavedPhoto) => {
        if (!confirm('Delete this photo?')) return;

        // Delete from storage
        if (photo.file_path) {
            await supabase.storage.from('site-photos').remove([photo.file_path]);
        }

        // Delete from notes table
        const { error } = await supabase.from('notes').delete().eq('id', photo.id);
        if (error) {
            console.error('Error deleting photo:', error);
            alert('Failed to delete photo.');
        } else {
            setSavedPhotos(prev => prev.filter(p => p.id !== photo.id));
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={compact ? 'space-y-4' : 'max-w-4xl mx-auto p-4 space-y-6'}>
            {/* Header — hidden in compact/embedded mode */}
            {!compact && (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Site Photos</h2>
                    <p className="text-slate-400">Capture and upload photos of the installation area.</p>
                </div>
            )}

            {/* Quote Selector — hidden when quoteId is provided (embedded in quote) */}
            {!quoteId && (
                <QuoteSelector
                    selectedQuoteId={selectedQuoteId}
                    onSelect={(id, name) => {
                        setLocalQuoteId(id);
                        setLocalQuoteName(name);
                    }}
                />
            )}

            {/* Capture Area */}
            <div className={`bg-background-card rounded-2xl ${compact ? 'p-4' : 'p-8'} border border-white/5 flex flex-col items-center justify-center ${compact ? 'min-h-[250px]' : 'min-h-[350px]'}`}>
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
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleCapture}
                                        className="w-20 h-20 bg-white rounded-full border-4 border-brand-orange hover:scale-105 transition-transform flex items-center justify-center shadow-lg shadow-brand-orange/20"
                                    >
                                        <div className="w-16 h-16 bg-brand-orange rounded-full" />
                                    </button>
                                </div>
                                <p className="mt-4 text-slate-400 text-sm">Tap to capture</p>

                                {/* File upload fallback */}
                                <div className="mt-4 pt-4 border-t border-white/5 w-full text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        Or upload from files →
                                    </button>
                                </div>
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
                                    <Camera
                                        size={48}
                                        className="text-brand-orange group-hover:scale-110 transition-transform"
                                    />
                                </button>
                                <h3 className="text-xl font-medium text-white mb-2">Take a Photo</h3>
                                <p className="text-slate-400">
                                    Camera access not available.
                                    <br />
                                    Tap the camera icon to upload a file.
                                </p>
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
                                className="px-6 py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange-light transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Uploading...
                                    </>
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

            {/* Photo Gallery */}
            <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-300">Saved Photos</span>
                        <span className="text-xs text-slate-500">({savedPhotos.length})</span>
                    </div>
                </div>

                {loadingPhotos ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 size={24} className="animate-spin text-brand-orange" />
                    </div>
                ) : savedPhotos.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No saved photos yet.</p>
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {savedPhotos.map(photo => (
                            <div key={photo.id} className="group relative">
                                <div className="aspect-[4/3] bg-black/50 rounded-xl overflow-hidden border border-white/5">
                                    {photo.url ? (
                                        <img
                                            src={photo.url}
                                            alt="Site photo"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end justify-between p-3">
                                    <div className="flex items-center gap-1 text-xs text-slate-300">
                                        <Clock size={12} />
                                        {formatDate(photo.created_at)}
                                    </div>
                                    <button
                                        onClick={() => deletePhoto(photo)}
                                        className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
