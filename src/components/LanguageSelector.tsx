import React from 'react';
import { Check } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../i18n/translations';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 gap-3 w-full ${className}`}>
      {LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-md ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl select-none" role="img" aria-label={lang.name}>
                {lang.flag}
              </span>
              <div>
                <p className="text-base sm:text-lg font-bold leading-none mb-1">
                  {lang.nativeName}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {lang.greeting} · {lang.name}
                </p>
              </div>
            </div>

            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
