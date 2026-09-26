import React from 'react';
import { X } from 'lucide-react';
import { LanguageCode } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const handleSelect = (lang: LanguageCode) => {
    onSelectLanguage(lang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900">Select Your Language</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">अपनी भाषा चुनें</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          <LanguageSelector
            selectedLanguage={language}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
};
