import React, { useEffect, useRef } from 'react';


export type LogEntry = {
  id: string;
  message: string;
  type: 'system' | 'combat' | 'narrative' | 'dice';
  timestamp: Date;
};

interface BattleLogProps {
  logs: LogEntry[];
}

export function BattleLog({ logs }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-background/80 border border-border rounded-md overflow-hidden">
      <div className="bg-secondary/50 p-2 font-bold text-sm text-center border-b border-border">
        Diário de Combate
      </div>
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`text-sm ${
                log.type === 'system' ? 'text-muted-foreground italic' :
                log.type === 'combat' ? 'text-foreground' :
                log.type === 'dice' ? 'text-primary font-mono' :
                'text-blue-300 italic' // narrative
              }`}
            >
              <span className="opacity-50 text-xs mr-2">
                [{log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]
              </span>
              {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-muted-foreground text-sm italic text-center mt-10">
              A batalha ainda não começou...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
