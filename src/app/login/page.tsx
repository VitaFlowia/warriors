'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Tente novamente.');
      setLoading(false);
    } else {
      router.push('/lobby');
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center bg-[url('/images/backgrounds/cais-sombrio.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-sapires-dark/90 border border-primary/30 rounded-xl shadow-[0_0_30px_rgba(197,168,128,0.2)]">
        <div className="text-center mb-8">
          <img src="/images/logo/sapires-warriors-logo.png" alt="Logo" className="w-48 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary uppercase tracking-widest">Acesso Restrito</h1>
          <p className="text-muted-foreground text-sm">Insira suas credenciais do Clã</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adentrando as Brumas...' : 'Entrar na Partida'}
          </button>
        </form>
      </div>
    </main>
  );
}
