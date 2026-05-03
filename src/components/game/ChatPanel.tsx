'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const channel = supabase.channel('game_chat');
    
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      setMessages((prev) => [...prev, payload.payload as Message]);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      sender: user.email?.split('@')[0] || 'Aventureiro',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const channel = supabase.channel('game_chat');
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: newMessage,
    });

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-[0_0_15px_rgba(197,168,128,0.5)] hover:scale-110 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 h-96 bg-sapires-dark/95 border border-primary/50 rounded-xl flex flex-col shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center p-3 border-b border-primary/30 bg-black/50 rounded-t-xl">
        <h3 className="text-primary font-bold tracking-widest text-sm uppercase">Taverna (Chat)</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`text-sm ${msg.sender === (user?.email?.split('@')[0] || '') ? 'text-right' : 'text-left'}`}>
            <span className="block text-xs text-primary/70 mb-1">{msg.sender} <span className="opacity-50 text-[10px]">{msg.timestamp}</span></span>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender === (user?.email?.split('@')[0] || '') ? 'bg-primary/20 border border-primary/30 text-primary-foreground' : 'bg-secondary border border-border text-foreground'}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-xs text-muted-foreground italic mt-10">O silêncio ecoa na taverna...</p>}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-primary/30 bg-black/50 rounded-b-xl flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mensagem..."
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
        />
        <button type="submit" className="bg-primary text-primary-foreground px-3 py-2 rounded font-bold hover:bg-primary/80">
          Enviar
        </button>
      </form>
    </div>
  );
}
