import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VoiceSelector } from '@/components/VoiceSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { VoiceOption, Message, LanguageType } from '@/types/voice';
import { voices } from '@/data/voices';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe2, Mic, Languages, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('english');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);
  const { toast } = useToast();

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleStartChat = () => {
    if (selectedVoice) {
      setShowChat(true);
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Hello! I'm ${selectedVoice.name}, speaking with a ${selectedVoice.accent} accent. How can I help you today? Feel free to type in English, Hindi, or Urdu - I can translate and respond in any of these languages!`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const playAudioForMessage = useCallback(async (messageId: string, text: string) => {
    if (!selectedVoice) return;

    setPlayingMessageId(messageId);

    try {
      // @ts-ignore
      const audio = await puter.ai.txt2speech(text, {
        voice: selectedVoice.id,
      });

      audio.onended = () => {
        setPlayingMessageId(null);
      };

      audio.onerror = () => {
        setPlayingMessageId(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingMessageId(null);
    }
  }, [selectedVoice]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add to conversation history
    conversationHistoryRef.current.push({ role: 'user', content });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: conversationHistoryRef.current,
            voiceName: selectedVoice?.name,
            voiceAccent: selectedVoice?.accent,
            targetLanguage: selectedLanguage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessageId = `assistant-${Date.now()}`;

      // Create initial assistant message
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, will be handled in next chunk
          }
        }
      }

      // Add to conversation history
      conversationHistoryRef.current.push({ role: 'assistant', content: assistantContent });

      // Auto-play voice for assistant response
      if (assistantContent && selectedVoice) {
        playAudioForMessage(assistantMessageId, assistantContent);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: "I'm sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVoice, selectedLanguage, toast, playAudioForMessage]);

  const handlePlayAudio = useCallback(async (messageId: string, text: string) => {
    if (playingMessageId) return;
    playAudioForMessage(messageId, text);
  }, [playingMessageId, playAudioForMessage]);

  const handleGoHome = useCallback(() => {
    setShowChat(false);
    setMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  if (showChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header selectedVoice={selectedVoice} isPlaying={!!playingMessageId} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            messages={messages}
            selectedVoice={selectedVoice}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            onSendMessage={handleSendMessage}
            onPlayAudio={handlePlayAudio}
            onSelectVoice={handleSelectVoice}
            onGoHome={handleGoHome}
            isLoading={isLoading}
            playingMessageId={playingMessageId}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Voice Assistant</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Speak English Like a
              <span className="block text-accent mt-2">
                Native Speaker
              </span>
            </h1>
            
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Practice with authentic accents from India, Britain, America, and around the world. 
              Get instant translations in Hindi and Urdu.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Globe2, label: '4 Authentic Accents' },
                { icon: Mic, label: 'Voice & Text Chat' },
                { icon: Languages, label: 'Hindi & Urdu Translation' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 backdrop-blur"
                >
                  <feature.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Selection Section */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8 -mt-16 relative z-10">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={handleSelectVoice}
          />

          {selectedVoice && (
            <div className="mt-8 pt-6 border-t border-border animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center text-xl">
                    {selectedVoice.flag}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Ready to chat with {selectedVoice.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVoice.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartChat}
                  size="lg"
                  className="gradient-accent text-accent-foreground hover:opacity-90 shadow-glow gap-2"
                >
                  Start Conversation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: '🇮🇳',
              title: 'Indian English',
              description: 'Practice with authentic Indian accent patterns and expressions.',
            },
            {
              icon: '🇬🇧',
              title: 'British English',
              description: 'Learn received pronunciation and British vocabulary.',
            },
            {
              icon: '🇺🇸',
              title: 'American English',
              description: 'Master General American accent and idioms.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Translation Feature */}
        <div className="mt-12 p-8 bg-secondary rounded-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-accent mb-4">
            <Languages className="h-8 w-8 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Seamless Translation
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Communicate effortlessly across languages. Get instant translations between 
            English, Hindi (हिंदी), and Urdu (اردو) for every message.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Globe2 className="h-5 w-5" />
            <span className="font-medium">VoiceLingua</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Professional multilingual voice chat powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
