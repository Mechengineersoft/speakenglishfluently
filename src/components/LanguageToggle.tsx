import { LanguageType } from '@/types/voice';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  selectedLanguage: LanguageType;
  onSelectLanguage: (language: LanguageType) => void;
}

const languages: { id: LanguageType; label: string; script: string }[] = [
  { id: 'english', label: 'English', script: 'Aa' },
  { id: 'hindi', label: 'हिंदी', script: 'अ' },
  { id: 'urdu', label: 'اردو', script: 'ا' },
];

export function LanguageToggle({ selectedLanguage, onSelectLanguage }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelectLanguage(lang.id)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
            selectedLanguage === lang.id
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-xs opacity-60">{lang.script}</span>
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  );
}
