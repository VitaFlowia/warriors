'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Hero } from '@/data/heroes';

interface InventoryItem {
  id: string;
  name: string;
  iconSrc: string;
  count: number;
}

interface ItemRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  itemName: string;
}

interface InventoryPanelProps {
  heroes: Hero[];
  myHeroId: string | null;
  onUsePotion: (heroId: string) => void;
}

export function InventoryPanel({ heroes, myHeroId, onUsePotion }: InventoryPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);
  const channelRef = useRef<any>(null);
  const [displayName, setDisplayName] = useState<string>('Aventureiro');

  const myHero = heroes.find(h => h.id === myHeroId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        const meta = data.user.user_metadata;
        setDisplayName(meta?.full_name || meta?.name || data.user.email?.split('@')[0] || 'Aventureiro');
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel('game_items');
    channelRef.current = channel;
    
    // Listen for requests
    channel.on('broadcast', { event: 'item_request' }, (payload) => {
      const request = payload.payload as ItemRequest;
      if (request.requesterEmail !== user.email) {
        setActiveRequests((prev) => [...prev, request]);
        // Auto remove request after 15 seconds
        setTimeout(() => {
          setActiveRequests((prev) => prev.filter(r => r.id !== request.id));
        }, 15000);
      }
    });

    // Listen for donations sent to me
    channel.on('broadcast', { event: 'item_donated' }, (payload) => {
      const donation = payload.payload;
      if (donation.targetEmail === user.email) {
        alert(`Você recebeu uma ${donation.itemName} de ${donation.donorName}!`);
      }
      setActiveRequests(prev => prev.filter(r => r.id !== donation.requestId));
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const requestItem = async (itemName: string) => {
    if (!user || !channelRef.current) return;
    const request: ItemRequest = {
      id: Math.random().toString(),
      requesterName: displayName,
      requesterEmail: user.email || 'unknown',
      itemName
    };
    await channelRef.current.send({
      type: 'broadcast',
      event: 'item_request',
      payload: request,
    });
    alert(`Pedido de socorro enviado! Aguarde alguém doar uma ${itemName}.`);
  };

  const donateItem = async (request: ItemRequest) => {
    if (!user || !channelRef.current || !myHero) return;
    if (myHero.potionCount <= 0) {
      alert('Você não tem poções para doar!');
      return;
    }

    // Broadcast donation
    await channelRef.current.send({
      type: 'broadcast',
      event: 'item_donated',
      payload: {
        requestId: request.id,
        donorName: displayName,
        donorEmail: user.email,
        targetEmail: request.requesterEmail,
        itemName: request.itemName
      },
    });

    setActiveRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const canUsePotion = myHero && myHero.potionCount > 0 && myHero.hp < myHero.maxHp;

  return (
    <div className="absolute top-16 left-4 z-40 flex flex-col gap-4">
      {/* Active Requests (Toasts) */}
      <div className="space-y-2">
        {activeRequests.map(req => (
          <div key={req.id} className="bg-red-950/90 border border-red-500/50 p-3 rounded-lg shadow-lg flex items-center gap-4 animate-in slide-in-from-left duration-300">
            <div className="text-sm">
              <span className="text-red-400 font-bold">⚠️ ALERTA:</span><br/>
              <span className="text-white font-bold">{req.requesterName}</span> precisa de uma <span className="text-primary font-bold">{req.itemName}</span>!
            </div>
            <button 
              onClick={() => donateItem(req)}
              className="bg-primary text-primary-foreground px-3 py-1 rounded font-bold text-xs hover:bg-primary/80 whitespace-nowrap"
            >
              DOAR (-1)
            </button>
          </div>
        ))}
      </div>

      {/* Inventory Slots */}
      <div className="bg-sapires-dark/90 border border-primary/30 p-2 rounded-xl flex flex-col gap-2 backdrop-blur-sm">
        {/* Potion slot */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-12 h-12 bg-black/50 rounded border border-border flex items-center justify-center p-1">
              <img src="/images/ui/icon-potion.png" alt="Poção de Vida" className="w-full h-full object-contain" />
              <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                {myHero?.potionCount ?? 0}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => myHeroId && onUsePotion(myHeroId)}
              disabled={!canUsePotion}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all
                ${canUsePotion 
                  ? 'bg-green-700 text-green-100 border border-green-500 hover:bg-green-600 hover:shadow-[0_0_12px_rgba(74,222,128,0.6)] active:scale-95' 
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'}`}
            >
              🧪 Usar Poção
            </button>
            <button 
              onClick={() => requestItem('Poção de Vida')}
              className="px-3 py-1 text-[10px] font-bold uppercase rounded bg-red-900/50 text-red-200 border border-red-500/30 hover:bg-red-900 transition-colors"
            >
              Pedir ao Grupo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
