import { VoiceOption } from '@/types/voice';

export const voices: VoiceOption[] = [
  // Indian Accent
  {
    id: 'indian-female',
    name: 'Priya',
    accent: 'indian',
    gender: 'female',
    description: 'Warm Indian English accent',
    flag: '🇮🇳',
  },
  {
    id: 'indian-female-pure',
    name: 'Ananya',
    accent: 'indian',
    gender: 'female',
    description: 'Pure Indian English accent',
    flag: '🇮🇳',
  },
  {
    id: 'indian-male',
    name: 'Arjun',
    accent: 'indian',
    gender: 'male',
    description: 'Professional Indian English accent',
    flag: '🇮🇳',
  },
  // British Accent
  {
    id: 'british-female',
    name: 'Charlotte',
    accent: 'british',
    gender: 'female',
    description: 'Refined British English accent',
    flag: '🇬🇧',
  },
  {
    id: 'british-male',
    name: 'James',
    accent: 'british',
    gender: 'male',
    description: 'Classic British English accent',
    flag: '🇬🇧',
  },
  // American Accent
  {
    id: 'american-female',
    name: 'Emily',
    accent: 'american',
    gender: 'female',
    description: 'Clear American English accent',
    flag: '🇺🇸',
  },
  {
    id: 'american-male',
    name: 'Michael',
    accent: 'american',
    gender: 'male',
    description: 'Standard American English accent',
    flag: '🇺🇸',
  },
  // International Accent
  {
    id: 'international-female',
    name: 'Sofia',
    accent: 'international',
    gender: 'female',
    description: 'Neutral international English',
    flag: '🌍',
  },
  {
    id: 'international-male',
    name: 'Alexander',
    accent: 'international',
    gender: 'male',
    description: 'Global professional English',
    flag: '🌍',
  },
];

export const getVoicesByAccent = (accent: string) => 
  voices.filter(v => v.accent === accent);

export const getVoicesByGender = (gender: string) => 
  voices.filter(v => v.gender === gender);
