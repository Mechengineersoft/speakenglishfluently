import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LanguageType } from '@/types/voice';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  language?: LanguageType;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function ChatInput({ onSendMessage, isLoading, placeholder = "Type your message...", language = 'english' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const { toast } = useToast();

  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    
    // Set language based on selection
    if (language === 'hindi') {
      recognition.lang = 'hi-IN';
    } else if (language === 'urdu') {
      recognition.lang = 'ur-PK'; // or ur-IN, ur-PK is standard for Urdu
    } else {
      recognition.lang = 'en-US';
    }

    finalTranscriptRef.current = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current = finalText.trim();
        setMessage(prev => prev ? `${prev} ${finalText}`.trim() : finalText.trim());
        setInterimTranscript('');
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setInterimTranscript('');
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      } else if (event.error !== 'aborted') {
        toast({
          title: "Recognition Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMessage = message + (interimTranscript ? ` ${interimTranscript}` : '');
    if (fullMessage.trim() && !isLoading) {
      onSendMessage(fullMessage.trim());
      setMessage('');
      setInterimTranscript('');
      if (isRecording) {
        stopRecording();
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const displayMessage = message + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-2xl shadow-sm">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading || !isSupported}
          className={cn(
            "p-3 rounded-xl transition-all duration-200 relative",
            isRecording
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            "disabled:opacity-50"
          )}
          title={isSupported ? (isRecording ? "Stop recording" : "Start voice input") : "Speech recognition not supported"}
        >
          {isRecording ? (
            <>
              <MicOff className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            </>
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        <input
          type="text"
          value={displayMessage}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground",
            "focus:outline-none text-sm py-2 px-2",
            "disabled:opacity-50",
            interimTranscript && "text-muted-foreground"
          )}
        />

        <Button
          type="submit"
          disabled={!displayMessage.trim() || isLoading}
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            "bg-accent hover:bg-accent/90 text-accent-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-destructive">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Listening... Tap to stop
        </div>
      )}
    </form>
  );
}
