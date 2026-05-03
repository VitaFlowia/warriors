'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { heroes } from '@/data/heroes';

export default function Lobby() {
  const [user, setUser] = useState<any>(null);
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();

    // Setup Realtime Presence for Lobby
    const channel = supabase.channel('room_1', {
      config: { presence: { key: 'player' } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      const players = Object.values(newState).flat();
      setActivePlayers(players);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && user) {
        await channel.track({ 
          user_id: user.id, 
          email: user.email,
          hero_id: selectedHeroId,
          status: 'ready'
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, router, selectedHeroId]);

  const handleSelectHero = async (heroId: string) => {
    setSelectedHeroId(heroId);
    if (user) {
      const channel = supabase.channel('room_1');
      await channel.track({ 
        user_id: user.id, 
        email: user.email,
        hero_id: heroId,
        status: 'ready'
      });
    }
  };

  const joinMatch = () => {
    if (!selectedHeroId) {
      alert('Por favor, escolha o seu Herói exclusivo antes de entrar no mapa!');
      return;
    }
    // We can pass the selected hero via local storage or query param for MVP
    localStorage.setItem('my_hero_id', selectedHeroId);
    router.push('/');
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Conectando ao Vazio...</div>;

  return (
    <main className="min-h-screen bg-black flex flex-col items-center py-12 px-4 bg-[url('/images/backgrounds/farol-profanado.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary uppercase tracking-widest drop-shadow-md">Taverna do Cais</h1>
          <p className="text-muted-foreground mt-2">Sala de Espera (Código: #1234)</p>
          <div className="mt-4 inline-block bg-primary/20 border border-primary/50 text-primary px-4 py-2 rounded font-bold">
            Logado como: {user.email}
          </div>
        </div>

        <div className="bg-sapires-dark/90 border border-border p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-2">Aventureiros Conectados ({activePlayers.length}/7)</h2>
          
          <div className="space-y-4 mb-8">
            {activePlayers.map((p, idx) => {
              const p_hero = heroes.find(h => h.id === p.hero_id);
              return (
                <div key={idx} className="flex items-center justify-between bg-background p-4 rounded border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary overflow-hidden">
                      {p_hero ? (
                        <img src={p_hero.cardImage} alt={p_hero.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold">{p.email[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-bold">{p.email}</p>
                      <p className="text-xs text-green-400">
                        {p_hero ? `Controlando: ${p_hero.name}` : 'Escolhendo herói...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {activePlayers.length === 0 && (
              <p className="text-muted-foreground italic text-center py-4">Aguardando outros guerreiros na rede...</p>
            )}
          </div>

          <h2 className="text-lg font-bold text-primary mb-4 text-left border-t border-border/50 pt-4">Escolha seu Herói para esta Jornada:</h2>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
            {heroes.map(hero => (
              <button
                key={hero.id}
                onClick={() => handleSelectHero(hero.id)}
                className={`min-w-[100px] flex flex-col items-center gap-2 p-2 rounded-lg transition-all border-2 
                  ${selectedHeroId === hero.id ? 'border-green-500 bg-green-900/30 scale-105' : 'border-transparent hover:border-primary/50 hover:bg-primary/10'}`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                  <img src={hero.cardImage} alt={hero.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-center text-foreground">{hero.name}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={joinMatch}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-lg hover:bg-primary/80 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(197,168,128,0.4)]"
            >
              Ir para o Mapa
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
