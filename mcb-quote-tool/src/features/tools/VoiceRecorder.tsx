import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Save, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: Event) => void;
    onend: (event: Event) => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

export function VoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [isSupported, setIsSupported] = useState(true);
    const [copied, setCopied] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                let final = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                setTranscript(prev => prev + final);
                setInterimTranscript(interim);

                // Auto-scroll
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            };

            recognitionInstance.onend = () => {
                // Automatically restart if we think we should still be recording
                // But for this UI, let's respect the manual toggle predominantly
                // setIsRecording(false); 
            };

            recognitionInstance.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    setIsRecording(false);
                    alert("Microphone access blocked.");
                }
            };

            setRecognition(recognitionInstance);
        } else {
            setIsSupported(false);
        }
    }, []);

    const toggleRecording = () => {
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            try {
                recognition.start();
                setIsRecording(true);
            } catch (e) {
                console.error("Failed to start recording:", e);
            }
        }
    };

    const clearTranscript = () => {
        if (confirm('Clear transcript?')) {
            setTranscript('');
            setInterimTranscript('');
        }
    };

    const copyToClipboard = () => {
        const text = transcript + interimTranscript;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveNote = async () => {
        if (!transcript) return;

        try {
            const { error } = await supabase.from('notes').insert({
                type: 'voice',
                content: transcript,
                user_id: (await supabase.auth.getUser()).data.user?.id
            });

            if (error) throw error;

            alert("Voice note saved successfully!");
            setTranscript('');
            setInterimTranscript('');
        } catch (error: any) {
            console.error("Error saving voice note:", error);
            alert(`Failed to save voice note: ${error.message || 'Unknown error'}`);
        }
    };

    if (!isSupported) {
        return (
            <div className="p-8 text-center text-red-400">
                Your browser does not support Speech Recognition. Try processing on Chrome or Safari.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Voice Notes</h2>
                    <p className="text-slate-300">Record conversations and transcribe them instantly.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearTranscript}
                        disabled={!transcript && !interimTranscript}
                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={copyToClipboard}
                        disabled={!transcript && !interimTranscript}
                        className="p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Recording Controls */}
                <div className="bg-background-card rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center gap-6">
                    <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer shadow-lg",
                        isRecording
                            ? "bg-red-500 shadow-red-500/20 animate-pulse"
                            : "bg-brand-orange shadow-brand-orange/20 hover:bg-brand-orange-light"
                    )} onClick={toggleRecording}>
                        {isRecording ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                    </div>
                    <p className={cn("font-medium", isRecording ? "text-red-400" : "text-slate-300")}>
                        {isRecording ? "Recording... Tap to stop" : "Tap to record"}
                    </p>
                </div>

                {/* Transcript Area */}
                <div className="bg-background-card rounded-2xl p-6 border border-white/5 min-h-[300px] relative">
                    <div className="absolute top-4 left-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Transcript
                    </div>
                    <div
                        ref={scrollRef}
                        className="mt-6 h-[calc(100%-2rem)] overflow-y-auto text-lg leading-relaxed text-slate-200 space-y-2 max-h-[400px]"
                    >
                        {transcript ? (
                            <span>{transcript}</span>
                        ) : (
                            !interimTranscript && <span className="text-gray-600 italic">No text recorded yet...</span>
                        )}
                        {interimTranscript && (
                            <span className="text-brand-orange ml-1">{interimTranscript}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
