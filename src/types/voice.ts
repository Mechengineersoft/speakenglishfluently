export type AccentType = 'indian' | 'british' | 'american' | 'international';
export type GenderType = 'male' | 'female';
export type LanguageType = 'english' | 'hindi' | 'urdu';

export interface VoiceOption {
  id: string;
  name: string;
  accent: AccentType;
  gender: GenderType;
  description: string;
  flag: string;
}

export interface Message {
  id: string;
  content: string;
  translation?: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
  voiceId?: string;
}

export interface ChatState {
  messages: Message[];
  selectedVoice: VoiceOption | null;
  selectedLanguage: LanguageType;
  isPlaying: boolean;
  isLoading: boolean;
}
