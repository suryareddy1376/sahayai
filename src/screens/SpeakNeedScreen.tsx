import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Keyboard,
  Search,
  UserCheck,
  Mic,
  X,
  Image as ImageIcon,
  FileText,
  Paperclip,
} from 'lucide-react';
import { LanguageCode, BeneficiaryIntakeResponse, MultimodalQuery, QueryAttachment } from '../types';
import { translations } from '../i18n/translations';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { TrustBanner } from '../components/TrustBanner';
import { BeneficiaryIntakeForm } from '../components/BeneficiaryIntakeForm';

interface SpeakNeedScreenProps {
  language: LanguageCode;
  transcript: string;
  isListening: boolean;
  audioLevel?: number;
  errorMessage?: string | null;
  onToggleListening: () => void;
  onSetTranscript: (text: string) => void;
  onSubmitNeed: (query: MultimodalQuery) => void;
  isLoading: boolean;
  onReadAloudTranscript?: () => void;
  onBeneficiaryIntakeComplete?: (response: BeneficiaryIntakeResponse) => void;
  initialIntakeMode?: 'voice' | 'form';
}

interface AttachmentItem {
  id: string;
  file: File;
  type: 'image' | 'document';
  previewUrl?: string;
  formattedSize: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const SpeakNeedScreen: React.FC<SpeakNeedScreenProps> = ({
  language,
  transcript,
  isListening,
  audioLevel = 0,
  errorMessage,
  onToggleListening,
  onSetTranscript,
  onSubmitNeed,
  isLoading,
  onReadAloudTranscript,
  onBeneficiaryIntakeComplete,
}) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [queryText, setQueryText] = useState(transcript || '');
  const [hasVoiceInput, setHasVoiceInput] = useState(false);
  const [hasTypedInput, setHasTypedInput] = useState(false);

  // Multi-Modal Attachments State (Phase 2A - frontend state only)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<AttachmentItem[]>(attachments);
  attachmentsRef.current = attachments;

  // Clean up all active object URLs only when component unmounts
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((att) => {
        if (att.previewUrl) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, []);

  // Sync incoming voice transcript into queryText only while voice is actively listening
  useEffect(() => {
    if (isListening && transcript) {
      setQueryText(transcript);
      setHasVoiceInput(true);
    }
  }, [transcript, isListening]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newItem: AttachmentItem = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      type: 'image',
      previewUrl: URL.createObjectURL(file),
      formattedSize: formatFileSize(file.size),
    };
    setAttachments((prev) => [...prev, newItem]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newItem: AttachmentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      type: 'document',
      formattedSize: formatFileSize(file.size),
    };
    setAttachments((prev) => [...prev, newItem]);
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const toRemove = prev.find((a) => a.id === id);
      if (toRemove?.previewUrl) {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const examplePrompts = [
    t.promptTailor,
    t.promptDairy,
    t.promptGrocery,
    t.promptWelding,
  ];

  const handleSelectPrompt = (prompt: string) => {
    if (isListening) {
      onToggleListening();
    }
    setQueryText(prompt);
    onSetTranscript(prompt);
    setHasTypedInput(true);
    setShowTypeInput(true);
  };

  const handleClear = () => {
    setQueryText('');
    onSetTranscript('');
    setHasVoiceInput(false);
    setHasTypedInput(false);
  };

  const handleFinalSubmit = () => {
    if (isListening) {
      onToggleListening();
    }

    const trimmedText = queryText.trim();
    if (!trimmedText && attachments.length === 0) {
      return;
    }

    let source: 'voice' | 'text' | 'mixed' = 'text';
    if (hasVoiceInput && hasTypedInput) {
      source = 'mixed';
    } else if (hasVoiceInput && !hasTypedInput) {
      source = 'voice';
    } else {
      source = 'text';
    }

    const queryAttachments: QueryAttachment[] = attachments.map((att) => ({
      id: att.id,
      name: att.file.name,
      sizeBytes: att.file.size,
      type: att.type,
      mimeType: att.file.type,
    }));

    const finalText =
      trimmedText ||
      `Attachment application: ${attachments.map((a) => a.file.name).join(', ')}`;

    const queryPayload: MultimodalQuery = {
      text: finalText,
      source,
      attachments: queryAttachments,
      timestamp: new Date().toISOString(),
    };

    onSubmitNeed(queryPayload);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFinalSubmit();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute text-3xl">🏛️</div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Supervisor Agent & Scheme Matcher Working...
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Checking intent classification, running RAG against government policy documents...
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900 text-sm font-semibold inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>No credit scores needed · Government backed</span>
        </div>
      </div>
    );
  }

  const activeText = queryText;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pt-2 pb-12">
      <TrustBanner language={language} variant="compact" />


          {/* Hero Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.step2}
            </h1>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              {t.speakPrompt}
            </p>
          </div>

          {/* Large Voice Action Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 flex flex-col items-center">
            <VoiceInputButton
              isListening={isListening}
              onToggleListening={onToggleListening}
              transcript={activeText}
              language={language}
              errorMessage={errorMessage}
              onReadAloudTranscript={onReadAloudTranscript}
              audioLevel={audioLevel}
            />

        {/* Windows / Browser Troubleshooting Accordion */}
        <div className="mt-3 w-full">
          <details className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer">
            <summary className="font-bold text-slate-700 select-none hover:text-blue-600">
              🎙️ Voice not detecting? Click here for quick fixes
            </summary>
            <div className="mt-2 space-y-1.5 text-left text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
              <p><strong>1. Browser Permission:</strong> Click the 🔒 lock / settings icon next to the address bar and ensure <strong>Microphone</strong> is set to <strong>Allow</strong>.</p>
              <p><strong>2. Supported Browsers:</strong> Works natively on <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, and <strong>Safari</strong>.</p>
              <p><strong>3. Windows Settings:</strong> Open Windows <em>Settings &gt; Privacy &amp; security &gt; Microphone</em> and make sure <em>"Let apps access your microphone"</em> is turned <strong>ON</strong>.</p>
              <p><strong>4. HTTPS / Localhost:</strong> Browsers require a secure connection (Vercel HTTPS or <code>http://localhost:3000</code>). Insecure IP connections block microphone.</p>
              <p><strong>5. Instant Testing:</strong> You can also tap any of the example prompt chips below to test scheme matching instantly without speaking!</p>
            </div>
          </details>
        </div>

        {/* Multi-Modal Input Action Bar */}
        <div className="mt-4 w-full border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-100/80 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 py-2 px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>{t.addPhoto || 'Add Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-100/80 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 py-2 px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{t.addDocument || 'Add Document / PDF'}</span>
            </button>

            {!showTypeInput ? (
              <button
                type="button"
                onClick={() => {
                  setShowTypeInput(true);
                  if (isListening) {
                    onToggleListening();
                  }
                }}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-100/80 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 py-2 px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Keyboard className="w-4 h-4 text-slate-500" />
                <span>{t.typeInstead}</span>
              </button>
            ) : null}
          </div>

          {/* Hidden native HTML file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            aria-label="Upload photo or image"
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf"
            className="hidden"
            onChange={handleDocChange}
            aria-label="Upload document or PDF"
          />

          {/* Fallback Type Mode Input Form */}
          {showTypeInput && (
            <form onSubmit={handleFormSubmit} className="mt-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.typeInstead}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeInput(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Hide
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={queryText}
                  onFocus={() => {
                    if (isListening) {
                      onToggleListening();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQueryText(val);
                    onSetTranscript(val);
                    setHasTypedInput(true);
                  }}
                  placeholder="e.g. सिलाई मशीन और दुकान के लिए ₹80,000"
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-base font-medium transition-colors"
                />
                {queryText.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Clear query text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Attached Files List & Thumbnails */}
          {attachments.length > 0 && (
            <div className="mt-4 w-full space-y-2 text-left">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  <span>Attachments ({attachments.length})</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✓ {t.attachmentAdded || 'Attachment added'}
                </span>
              </div>

              <div className="space-y-2">
                {attachments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.type === 'image' && item.previewUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 stroke-[2]" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                          <span>{item.type === 'image' ? 'Photo / Image' : (item.file.name.split('.').pop()?.toUpperCase() || 'Document')}</span>
                          <span>•</span>
                          <span>{item.formattedSize}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">{t.attachmentAdded || 'Attachment added'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title={t.removeAttachment || 'Remove'}
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 font-medium px-1">
                ℹ️ Attachments added for officer evaluation. Live OCR is simulated during profile verification.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button if text or attachment is available */}
        {(activeText.trim().length > 0 || attachments.length > 0) && (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base sm:text-lg cursor-pointer active:scale-98 animate-in fade-in zoom-in-95"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>{t.submitNeed}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Example Prompt Chips */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 block px-1">
          {t.examplePromptsTitle}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(prompt)}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-start gap-2.5 cursor-pointer group shadow-xs"
            >
              <span className="text-blue-600 text-sm mt-0.5 group-hover:scale-110 transition-transform">
                💬
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                "{prompt}"
              </span>
            </button>
          ))}
          </div>
        </div>

  </div>
);
};
