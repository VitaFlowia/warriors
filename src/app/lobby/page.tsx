'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { heroes } from '@/data/heroes';

export default function Lobby() {
  const [user, setUser] = useState<any>(null);
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lobbyChannel, setLobbyChannel] = useState<any>(null);
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
    const newChannel = supabase.channel('room_1', {
      config: { presence: { key: user?.id || Math.random().toString() } },
    });

    newChannel.on('presence', { event: 'sync' }, () => {
      const newState = newChannel.presenceState();
      const players = Object.values(newState).flat() as any[];
      
      // Remove possíveis duplicações de conexão da mesma conta
      const uniquePlayers: any[] = [];
      const seenEmails = new Set();
      for (const p of players) {
        if (p.email && !seenEmails.has(p.email)) {
          seenEmails.add(p.email);
          uniquePlayers.push(p);
        }
      }
      setActivePlayers(uniquePlayers);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && user) {
        const storedHero = localStorage.getItem('my_hero_id') || '';
        if (storedHero) setSelectedHeroId(storedHero);
        
        await newChannel.track({ 
          user_id: user.id, 
          email: user.email,
          hero_id: storedHero,
          status: 'ready'
        });
      }
    });

    setLobbyChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [user?.id]); // Removida dependência de selectedHeroId para não reconectar a cada clique

  const handleSelectHero = async (heroId: string) => {
    setSelectedHeroId(heroId);
    if (user && lobbyChannel) {
      await lobbyChannel.track({ 
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

          <h2 className="text-lg font-bold text-primary mb-4 text-center border-t border-border/50 pt-4">Escolha seu Herói para esta Jornada:</h2>
          
          <div className="relative w-full max-w-[900px] mx-auto aspect-[16/9] md:aspect-[21/9] rounded-2xl border border-primary/20 bg-black/50 overflow-hidden shadow-2xl flex items-center justify-center">
            <img 
              src={heroes[carouselIndex].fullImage} 
              alt={heroes[carouselIndex].name} 
              className={`w-full h-full object-cover md:object-contain pointer-events-none transition-all duration-500 ${
                activePlayers.some(p => p.hero_id === heroes[carouselIndex].id && p.email !== user?.email)
                  ? 'grayscale opacity-40 blur-sm'
                  : ''
              }`}
            />
            
            {/* Carousel Controls */}
            {carouselIndex > 0 && (
              <button 
                onClick={() => setCarouselIndex(prev => prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-blue-400 hover:text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all hover:scale-110 z-20"
              >
                <div className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
                <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Voltar</span>
              </button>
            )}

            {carouselIndex < heroes.length - 1 && (
              <button 
                onClick={() => setCarouselIndex(prev => prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-blue-400 hover:text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all hover:scale-110 z-20"
              >
                <div className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
                <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Próximo</span>
              </button>
            )}

            {/* Neon Golden Select Button overlayed on the image */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[80%] flex flex-col gap-4">
              {activePlayers.some(p => p.hero_id === heroes[carouselIndex].id && p.email !== user?.email) ? (
                <div className="w-full py-4 bg-black/80 text-red-500 border border-red-900 rounded-xl text-center font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                  Bloqueado (Em uso)
                </div>
              ) : (
                <button 
                  onClick={() => handleSelectHero(heroes[carouselIndex].id)}
                  className={`w-full py-4 text-transparent font-bold uppercase tracking-widest rounded-xl transition-all duration-300 border-4 relative overflow-hidden group
                    ${selectedHeroId === heroes[carouselIndex].id ? 'border-green-400 shadow-[0_0_40px_rgba(74,222,128,0.9)] bg-green-500/20' : 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] hover:shadow-[0_0_50px_rgba(250,204,21,1)] bg-transparent'}`}
                >
                  <span className={`relative z-10 text-2xl font-black ${selectedHeroId === heroes[carouselIndex].id ? 'text-green-300 drop-shadow-[0_0_10px_rgba(74,222,128,1)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,1)]'}`}>
                    {selectedHeroId === heroes[carouselIndex].id ? 'HERÓI VINCULADO!' : 'ESCOLHER'}
                  </span>
                </button>
              )}
              
              {selectedHeroId === heroes[carouselIndex].id && (
                <button 
                  onClick={joinMatch}
                  className="w-full px-10 py-5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black text-2xl font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:shadow-[0_0_50px_rgba(250,204,21,0.9)] animate-pulse border-2 border-yellow-200"
                >
                  IR PARA O MAPA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
