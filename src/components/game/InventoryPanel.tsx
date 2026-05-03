'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface InventoryItem {
  id: string;
  name: string;
  iconSrc: string;
  count: number;
}

interface ItemRequest {
  id: string;
  requesterEmail: string;
  itemName: string;
}

export function InventoryPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([
    { id: 'potion_hp', name: 'Poção de Vida', iconSrc: '/images/ui/icon-potion.png', count: 2 },
  ]);
  const [activeRequests, setActiveRequests] = useState<ItemRequest[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const channel = supabase.channel('game_items');
    
    // Listen for requests
    channel.on('broadcast', { event: 'item_request' }, (payload) => {
      const request = payload.payload as ItemRequest;
      // Don't show my own request to myself
      if (user && request.requesterEmail !== user.email) {
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
      if (user && donation.targetEmail === user.email) {
        // I received an item!
        setItems(prev => prev.map(item => 
          item.name === donation.itemName ? { ...item, count: item.count + 1 } : item
        ));
        alert(`Você recebeu uma ${donation.itemName} de ${donation.donorEmail}!`);
      }
      // Remove the request from everyone's screen
      setActiveRequests(prev => prev.filter(r => r.id !== donation.requestId));
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const requestItem = async (itemName: string) => {
    if (!user) return;
    const request: ItemRequest = {
      id: Math.random().toString(),
      requesterEmail: user.email || 'Aventureiro',
      itemName
    };
    const channel = supabase.channel('game_items');
    await channel.send({
      type: 'broadcast',
      event: 'item_request',
      payload: request,
    });
    alert(`Pedido de socorro enviado! Aguarde alguém doar uma ${itemName}.`);
  };

  const donateItem = async (request: ItemRequest) => {
    if (!user) return;
    const itemOwned = items.find(i => i.name === request.itemName);
    if (!itemOwned || itemOwned.count <= 0) {
      alert('Você não tem este item para doar!');
      return;
    }

    // Reduce local count
    setItems(prev => prev.map(i => 
      i.name === request.itemName ? { ...i, count: i.count - 1 } : i
    ));

    // Broadcast donation
    const channel = supabase.channel('game_items');
    await channel.send({
      type: 'broadcast',
      event: 'item_donated',
      payload: {
        requestId: request.id,
        donorEmail: user.email,
        targetEmail: request.requesterEmail,
        itemName: request.itemName
      },
    });

    // Remove request from my screen
    setActiveRequests(prev => prev.filter(r => r.id !== request.id));
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-4">
      {/* Active Requests (Toasts) */}
      <div className="space-y-2">
        {activeRequests.map(req => (
          <div key={req.id} className="bg-red-950/80 border border-red-500/50 p-3 rounded-lg shadow-lg flex items-center gap-4 animate-bounce">
            <div className="text-sm">
              <span className="text-red-400 font-bold">⚠️ ALERTA:</span><br/>
              <span className="text-white">{req.requesterEmail.split('@')[0]}</span> precisa de uma <span className="text-primary font-bold">{req.itemName}</span>!
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

      {/* Local Inventory */}
      <div className="bg-sapires-dark/90 border border-primary/30 p-2 rounded-xl flex gap-2 backdrop-blur-sm">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <div className="w-12 h-12 bg-black/50 rounded border border-border flex items-center justify-center p-1">
              <img src={item.iconSrc} alt={item.name} className="w-full h-full object-contain" />
              <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                {item.count}
              </span>
            </div>
            
            {/* Tooltip & Actions */}
            <div className="absolute left-0 top-14 bg-black border border-primary/50 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 whitespace-nowrap shadow-xl flex flex-col gap-1">
              <span className="text-xs font-bold text-primary">{item.name}</span>
              <button 
                onClick={() => requestItem(item.name)}
                className="bg-red-900/50 text-red-200 border border-red-500/30 px-2 py-1 text-[10px] rounded hover:bg-red-900"
              >
                Pedir ao Grupo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
