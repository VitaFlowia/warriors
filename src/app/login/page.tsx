'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe como deseja ser chamado.');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        // Fallback: Tentativa de Cadastro (Sign Up) automático se não existir
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name }
          }
        });

        if (signUpError) {
          setError('Erro ao cadastrar: ' + signUpError.message);
          setLoading(false);
        } else {
          localStorage.setItem('my_name', name);
          router.push('/lobby');
        }
      } else {
        setError('Erro no acesso: ' + signInError.message);
        setLoading(false);
      }
    } else {
      localStorage.setItem('my_name', name);
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
            <label className="block text-sm font-medium text-foreground mb-1">Seu Nome (Como será visto na mesa)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded px-4 py-2 text-foreground focus:outline-none focus:border-primary font-bold text-lg"
              placeholder="Ex: Tio João, Davi, Leo..."
              required
            />
          </div>
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
            className="w-full py-5 mt-8 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black font-black text-2xl uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.6)] hover:shadow-[0_0_60px_rgba(250,204,21,0.9)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse border-2 border-yellow-200"
          >
            {loading ? 'ADENTRANDO...' : 'ENTRAR NA PARTIDA'}
          </button>
        </form>
      </div>
    </main>
  );
}
