import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isPlaying: boolean;
  className?: string;
}

export function AudioWaveform({ isPlaying, className }: AudioWaveformProps) {
  const bars = [1, 2, 3, 4, 5, 4, 3, 2, 1];

  return (
    <div className={cn("flex items-center gap-0.5 h-6", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-accent transition-all duration-150",
            isPlaying ? "animate-wave" : "h-1"
          )}
          style={{
            height: isPlaying ? `${height * 4}px` : '4px',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
