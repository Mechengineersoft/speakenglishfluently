import { Globe2, MessageSquare } from 'lucide-react';
import { VoiceOption } from '@/types/voice';
import { AudioWaveform } from './AudioWaveform';

interface HeaderProps {
  selectedVoice: VoiceOption | null;
  isPlaying: boolean;
}

export function Header({ selectedVoice, isPlaying }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-glow">
              <Globe2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">VoiceLingua</h1>
              <p className="text-xs text-muted-foreground">Professional Voice Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isPlaying && <AudioWaveform isPlaying={isPlaying} />}
            
            {selectedVoice && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                <span className="text-sm">{selectedVoice.flag}</span>
                <span className="text-sm font-medium text-foreground">{selectedVoice.name}</span>
              </div>
            )}

            <div className="p-2 bg-secondary rounded-lg">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
