import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { playActionSound } from '@/lib/audio';

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'potion' | 'passive';
  cost: number;
  description: string;
  icon: string;
}

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: 'potion_small', name: 'Poção Menor', type: 'potion', cost: 20, description: 'Cura 30% do seu HP em batalha.', icon: '🧪' },
  { id: 'sword_iron', name: 'Espada de Ferro', type: 'weapon', cost: 100, description: 'Aumenta seu Dano Físico em +5.', icon: '⚔️' },
  { id: 'staff_wood', name: 'Cajado Rústico', type: 'weapon', cost: 100, description: 'Aumenta seu Dano Mágico em +5.', icon: '🪄' },
  { id: 'ring_life', name: 'Anel da Vitalidade', type: 'passive', cost: 250, description: '+20 Max HP permanente.', icon: '💍' },
];

interface TavernShopProps {
  playerGold: number;
  onBuyItem: (item: ShopItem) => void;
  onClose: () => void;
}

export function TavernShop({ playerGold, onBuyItem, onClose }: TavernShopProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (playerGold >= item.cost) {
      playActionSound();
      onBuyItem(item);
      // Optional: Visual effect for purchase
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-sapires-dark/95 border-2 border-yellow-600 rounded-3xl p-6 shadow-[0_0_80px_rgba(202,138,4,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-yellow-900/50 pb-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-widest flex items-center gap-3">
              🍺 Taverna do Aventureiro
            </h2>
            <p className="text-muted-foreground mt-1">Gaste seu ouro suado em equipamentos ou poções.</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="bg-yellow-900/30 border border-yellow-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(202,138,4,0.3)]">
              <span className="text-yellow-400 font-bold text-xl">{playerGold}</span>
              <span>💰</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-red-400 p-2 bg-background rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_SHOP_ITEMS.map(item => {
              const canAfford = playerGold >= item.cost;
              return (
                <Card 
                  key={item.id}
                  className={`bg-background/40 border-2 transition-all duration-300 cursor-pointer overflow-hidden group
                    ${selectedItem?.id === item.id ? 'border-yellow-500 scale-[1.02] shadow-[0_0_30px_rgba(202,138,4,0.3)]' : 'border-border hover:border-yellow-600/50 hover:bg-background/80'}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardHeader className="pb-2 relative">
                    <div className="absolute top-0 right-0 bg-yellow-600 text-black font-black text-xs px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      {item.type}
                    </div>
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <CardTitle className="text-lg text-primary group-hover:text-yellow-400 transition-colors">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground min-h-[40px]">{item.description}</p>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuy(item); }}
                      disabled={!canAfford}
                      className={`w-full mt-4 py-3 rounded-xl font-black uppercase tracking-widest transition-all
                        ${canAfford 
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95' 
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                        }`}
                    >
                      {canAfford ? `Comprar (${item.cost} 💰)` : `Falta ${item.cost - playerGold} 💰`}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
