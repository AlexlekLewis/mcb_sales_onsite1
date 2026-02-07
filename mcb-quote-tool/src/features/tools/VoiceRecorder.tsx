import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Save, Trash2, Copy, Check, Clock, ChevronDown, ChevronUp, Sparkles, Loader2, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { QuoteSelector } from '../../components/ui/QuoteSelector';

// Cross-browser Speech Recognition API
const SpeechRecognitionAPI =
    (typeof window !== 'undefined') &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

interface SavedNote {
    id: string;
    content: string;
    created_at: string;
    summary?: string | null;
    quote_id?: string | null;
}

interface VoiceRecorderProps {
    /** When provided, auto-links all notes to this quote (hides QuoteSelector) */
    quoteId?: string;
    /** Compact mode — hides page header, reduces padding */
    compact?: boolean;
}

export function VoiceRecorder({ quoteId, compact }: VoiceRecorderProps = {}) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [duration, setDuration] = useState(0);

    // Saved notes history
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

    // AI summarisation
    const [summarising, setSummarising] = useState<string | null>(null);

    // Quote linking — use prop if provided, otherwise local state for standalone mode
    const [localQuoteId, setLocalQuoteId] = useState<string | null>(null);
    const [localQuoteName, setLocalQuoteName] = useState<string | null>(null);
    const selectedQuoteId = quoteId || localQuoteId;

    const recognitionRef = useRef<any>(null);
    const isRecordingRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptRef = useRef('');

    // Keep transcriptRef in sync
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // Initialise Speech Recognition
    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-AU';

        recognition.onresult = (event: any) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => prev + final);
            }
            setInterimTranscript(interim);

            // Auto-scroll
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        };

        recognition.onend = () => {
            // Auto-restart if the user hasn't manually stopped
            // The speech engine fires onend after ~60s of silence or when it internally times out
            if (isRecordingRef.current) {
                try {
                    recognition.start();
                } catch {
                    // If start fails, stop recording
                    isRecordingRef.current = false;
                    setIsRecording(false);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                isRecordingRef.current = false;
                setIsRecording(false);
                alert('Microphone access was blocked. Please allow microphone access in your browser settings.');
            } else if (event.error === 'no-speech') {
                // No speech detected — this is normal, onend will auto-restart
            } else if (event.error === 'aborted') {
                // Recognition was aborted — don't restart
            }
        };

        recognitionRef.current = recognition;

        return () => {
            try { recognition.stop(); } catch { /* ignore */ }
        };
    }, []);

    // Load saved notes
    const fetchSavedNotes = useCallback(async () => {
        setLoadingNotes(true);
        let query = supabase
            .from('notes')
            .select('id, content, created_at, summary, quote_id')
            .eq('type', 'voice')
            .order('created_at', { ascending: false })
            .limit(20);

        if (selectedQuoteId) {
            query = query.eq('quote_id', selectedQuoteId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notes:', error);
        } else {
            setSavedNotes(data || []);
        }
        setLoadingNotes(false);
    }, [selectedQuoteId]);

    useEffect(() => {
        fetchSavedNotes();
    }, [fetchSavedNotes]);

    // Duration timer
    useEffect(() => {
        if (isRecording) {
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            isRecordingRef.current = false;
            setIsRecording(false);
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
        } else {
            try {
                recognitionRef.current.start();
                isRecordingRef.current = true;
                setIsRecording(true);
            } catch (e) {
                console.error('Failed to start recording:', e);
                alert('Failed to start recording. Please check microphone permissions.');
            }
        }
    };

    const clearTranscript = () => {
        if (transcript || interimTranscript) {
            if (confirm('Clear the current transcript?')) {
                setTranscript('');
                setInterimTranscript('');
            }
        }
    };

    const copyToClipboard = async () => {
        const text = transcript + interimTranscript;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveNote = async () => {
        if (!transcript.trim()) return;

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const noteRecord: Record<string, unknown> = {
                type: 'voice',
                content: transcript.trim(),
            };
            if (user?.id) noteRecord.user_id = user.id;
            if (selectedQuoteId) noteRecord.quote_id = selectedQuoteId;

            const { error } = await supabase.from('notes').insert(noteRecord);

            if (error) throw error;

            setTranscript('');
            setInterimTranscript('');
            await fetchSavedNotes();
        } catch (error: any) {
            console.error('Error saving voice note:', error);
            alert(`Failed to save: ${error.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const summariseNote = async (noteId: string, content: string) => {
        setSummarising(noteId);
        try {
            const response = await supabase.functions.invoke('summarise-transcript', {
                body: { transcript: content },
            });

            if (response.error) throw response.error;

            const summary = response.data?.summary || 'No summary generated.';

            // Save summary to the note
            await supabase.from('notes').update({ summary }).eq('id', noteId);

            // Update local state
            setSavedNotes(prev => prev.map(n =>
                n.id === noteId ? { ...n, summary } : n
            ));
        } catch (error: any) {
            console.error('Error summarising:', error);
            alert(`Summarise failed: ${error.message || 'Edge function not deployed yet. Deploy the summarise-transcript function to enable AI summaries.'}`);
        } finally {
            setSummarising(null);
        }
    };

    const deleteNote = async (noteId: string) => {
        if (!confirm('Delete this voice note?')) return;

        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note.');
        } else {
            setSavedNotes(prev => prev.filter(n => n.id !== noteId));
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (!isSupported) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <Mic size={48} className="text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Speech Recognition Not Supported</h3>
                    <p className="text-slate-300">
                        Your browser doesn't support speech recognition.<br />
                        Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for the best experience.
                    </p>
                </div>
            </div>
        );
    }

    const hasTranscript = transcript.trim().length > 0 || interimTranscript.length > 0;

    return (
        <div className={compact ? 'space-y-4' : 'max-w-4xl mx-auto p-4 space-y-6'}>
            {/* Header — hidden in compact/embedded mode */}
            {!compact && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Voice Notes</h2>
                        <p className="text-slate-400">Record on-site conversations and transcribe them instantly.</p>
                    </div>
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

            {/* Recording Controls */}
            <div className={`bg-background-card rounded-2xl ${compact ? 'p-4' : 'p-8'} border border-white/5 flex flex-col items-center justify-center gap-4`}>
                <div
                    className={cn(
                        'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer shadow-lg',
                        isRecording
                            ? 'bg-red-500 shadow-red-500/30 animate-pulse'
                            : 'bg-brand-orange shadow-brand-orange/20 hover:bg-brand-orange-light hover:scale-105'
                    )}
                    onClick={toggleRecording}
                >
                    {isRecording ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                </div>

                <div className="flex items-center gap-3">
                    <p className={cn('font-medium', isRecording ? 'text-red-400' : 'text-slate-300')}>
                        {isRecording ? 'Recording... Tap to stop' : 'Tap to record'}
                    </p>
                    {isRecording && (
                        <span className="flex items-center gap-1 text-red-400 text-sm font-mono bg-red-500/10 px-2 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {formatDuration(duration)}
                        </span>
                    )}
                </div>
            </div>

            {/* Transcript Area */}
            <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Transcript
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={copyToClipboard}
                            disabled={!hasTranscript}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Copy transcript"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={clearTranscript}
                            disabled={!hasTranscript}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Clear transcript"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="p-6 min-h-[200px] max-h-[400px] overflow-y-auto text-lg leading-relaxed text-slate-200"
                >
                    {transcript ? (
                        <span>{transcript}</span>
                    ) : (
                        !interimTranscript && (
                            <span className="text-slate-600 italic">
                                {isRecording ? 'Listening...' : 'Tap the microphone to start recording.'}
                            </span>
                        )
                    )}
                    {interimTranscript && (
                        <span className="text-brand-orange/70">{interimTranscript}</span>
                    )}
                </div>

                {/* Save Button */}
                {transcript.trim().length > 0 && !isRecording && (
                    <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {transcript.trim().split(/\s+/).length} words recorded
                        </p>
                        <button
                            onClick={saveNote}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? 'Saving...' : 'Save Voice Note'}
                        </button>
                    </div>
                )}
            </div>

            {/* Saved Notes History */}
            <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-300">Saved Notes</span>
                        <span className="text-xs text-slate-500">({savedNotes.length})</span>
                    </div>
                </div>

                {loadingNotes ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 size={24} className="animate-spin text-brand-orange" />
                    </div>
                ) : savedNotes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No saved voice notes yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {savedNotes.map(note => {
                            const isExpanded = expandedNoteId === note.id;
                            const preview = note.content.length > 120
                                ? note.content.substring(0, 120) + '...'
                                : note.content;

                            return (
                                <div key={note.id} className="group">
                                    <button
                                        onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                                        className="w-full text-left px-6 py-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 line-clamp-2">
                                                    {isExpanded ? '' : preview}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(note.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {note.summary && (
                                                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                                                        Summarised
                                                    </span>
                                                )}
                                                {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 pb-4 space-y-3">
                                            <div className="bg-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto">
                                                {note.content}
                                            </div>

                                            {note.summary && (
                                                <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={14} className="text-brand-orange" />
                                                        <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">AI Summary</span>
                                                    </div>
                                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{note.summary}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => summariseNote(note.id, note.content)}
                                                    disabled={summarising === note.id}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 transition-colors disabled:opacity-50"
                                                >
                                                    {summarising === note.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Sparkles size={14} />
                                                    )}
                                                    {note.summary ? 'Re-summarise' : 'Summarise with AI'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await navigator.clipboard.writeText(note.content);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                                                >
                                                    <Copy size={14} />
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors ml-auto"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
