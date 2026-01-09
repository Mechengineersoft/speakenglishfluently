import { useRef, useEffect, useState } from 'react';
import { Message, VoiceOption, LanguageType } from '@/types/voice';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LanguageToggle } from './LanguageToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { voices } from '@/data/voices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  messages: Message[];
  selectedVoice: VoiceOption | null;
  selectedLanguage: LanguageType;
  onSelectLanguage: (language: LanguageType) => void;
  onSendMessage: (message: string) => void;
  onPlayAudio: (messageId: string, text: string) => void;
  onSelectVoice: (voice: VoiceOption) => void;
  onGoHome: () => void;
  isLoading: boolean;
  playingMessageId: string | null;
}

export function ChatInterface({
  messages,
  selectedVoice,
  selectedLanguage,
  onSelectLanguage,
  onSendMessage,
  onPlayAudio,
  onSelectVoice,
  onGoHome,
  isLoading,
  playingMessageId,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getPlaceholder = () => {
    switch (selectedLanguage) {
      case 'hindi':
        return 'अपना संदेश टाइप करें... (Type in Hindi)';
      case 'urdu':
        return 'اپنا پیغام ٹائپ کریں... (Type in Urdu)';
      default:
        return 'Type your message in English...';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar with Back, Voice Selector, and Language Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoHome}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span>{selectedVoice?.flag}</span>
              <span>{selectedVoice?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto">
            {voices.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onSelectVoice(voice)}
                className="gap-2"
              >
                <span>{voice.flag}</span>
                <span>{voice.name}</span>
                <span className="text-xs text-muted-foreground">({voice.gender})</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <LanguageToggle
          selectedLanguage={selectedLanguage}
          onSelectLanguage={onSelectLanguage}
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 gradient-accent rounded-2xl flex items-center justify-center opacity-50">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start a Conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Type a message or use voice input. I'll respond in {selectedVoice?.name}'s {selectedVoice?.accent} accent.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                voice={selectedVoice}
                onPlayAudio={() => onPlayAudio(message.id, message.content)}
                isPlaying={playingMessageId === message.id}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            placeholder={getPlaceholder()}
          />
        </div>
      </div>
    </div>
  );
}
