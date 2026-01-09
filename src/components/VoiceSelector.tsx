import { voices } from '@/data/voices';
import { VoiceOption, AccentType } from '@/types/voice';
import { cn } from '@/lib/utils';
import { User, Users } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceOption | null;
  onSelectVoice: (voice: VoiceOption) => void;
}

const accentLabels: Record<AccentType, string> = {
  indian: 'Indian',
  british: 'British',
  american: 'American',
  international: 'International',
};

const accentColors: Record<AccentType, string> = {
  indian: 'voice-card-indian',
  british: 'voice-card-british',
  american: 'voice-card-american',
  international: 'voice-card-international',
};

export function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const groupedVoices = voices.reduce((acc, voice) => {
    if (!acc[voice.accent]) {
      acc[voice.accent] = [];
    }
    acc[voice.accent].push(voice);
    return acc;
  }, {} as Record<AccentType, VoiceOption[]>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Choose Your Voice</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select an accent and voice to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(groupedVoices) as AccentType[]).map((accent) => (
          <div key={accent} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <span>{groupedVoices[accent][0].flag}</span>
              {accentLabels[accent]} Accent
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {groupedVoices[accent].map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => onSelectVoice(voice)}
                  className={cn(
                    "p-3 rounded-lg text-left transition-all duration-200",
                    "bg-card border hover:shadow-md",
                    accentColors[voice.accent],
                    selectedVoice?.id === voice.id
                      ? "ring-2 ring-accent shadow-glow border-accent"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {voice.gender === 'female' ? (
                      <User className="h-4 w-4 text-accent" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium text-card-foreground">{voice.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {voice.gender}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
