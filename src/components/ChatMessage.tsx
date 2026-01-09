import { Message, VoiceOption } from '@/types/voice';
import { cn } from '@/lib/utils';
import { Volume2, User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  voice: VoiceOption | null;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export function ChatMessage({ message, voice, onPlayAudio, isPlaying }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "gradient-accent"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-primary-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-accent-foreground" />
        )}
      </div>

      <div
        className={cn(
          "flex-1 max-w-[80%] space-y-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card border border-border text-card-foreground rounded-tl-md shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {message.translation && (
            <div className={cn(
              "mt-2 pt-2 border-t text-sm opacity-80",
              isUser ? "border-primary-foreground/20" : "border-border"
            )}>
              <p className="italic">{message.translation}</p>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {!isUser && voice && onPlayAudio && (
            <button
              onClick={onPlayAudio}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                "hover:bg-secondary text-muted-foreground hover:text-foreground",
                isPlaying && "text-accent animate-pulse"
              )}
              title={`Play with ${voice.name}'s voice`}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
