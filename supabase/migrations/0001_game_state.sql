-- Adicionar campos de persistência de economia e estado ao jogador
ALTER TABLE public.player_characters
ADD COLUMN gold INTEGER DEFAULT 0,
ADD COLUMN potion_count INTEGER DEFAULT 1,
ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb,
ADD COLUMN equipped_weapon_id TEXT;

-- Adicionar campos de Realtime/Meta ao Match (Sessão de Batalha)
ALTER TABLE public.matches
ADD COLUMN wave_number INTEGER DEFAULT 1,
ADD COLUMN active_enemies JSONB DEFAULT '[]'::jsonb;

-- Criar tabela de configuração de Inventário Global (itens que podem ser comprados)
CREATE TABLE public.shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'weapon', 'potion', 'passive'
    cost INTEGER NOT NULL,
    description TEXT,
    stats JSONB -- Ex: {"damage_bonus": 5}
);

-- Inserir itens básicos na loja
INSERT INTO public.shop_items (id, name, type, cost, description, stats) VALUES
('potion_small', 'Poção Menor', 'potion', 20, 'Cura 30% do HP.', '{"heal_percent": 30}'),
('sword_iron', 'Espada de Ferro', 'weapon', 100, 'Arma afiada. +5 Dano Físico.', '{"damage_bonus": 5}'),
('staff_wood', 'Cajado de Aprendiz', 'weapon', 100, 'Melhora magias. +5 Dano Mágico.', '{"magic_bonus": 5}');

-- Refresh RLS
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items are viewable by everyone." ON public.shop_items FOR SELECT USING (true);
