-- Migration inicial do banco de dados (Sá Pires Warriors)
-- Habilitar a extensão UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    max_hp INTEGER NOT NULL,
    max_mana INTEGER NOT NULL,
    forca INTEGER NOT NULL,
    agilidade INTEGER NOT NULL,
    inteligencia INTEGER NOT NULL,
    espirito INTEGER NOT NULL,
    defesa INTEGER NOT NULL,
    velocidade INTEGER NOT NULL,
    passive_name TEXT,
    passive_description TEXT,
    equipment JSONB,
    card_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.player_characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id),
    character_id UUID REFERENCES public.characters(id),
    current_hp INTEGER NOT NULL,
    current_mana INTEGER NOT NULL,
    current_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'waiting', -- waiting, playing, paused, finished
    current_round INTEGER DEFAULT 1,
    current_turn_player_id UUID,
    village_id UUID,
    created_by UUID REFERENCES public.players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.match_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id),
    player_id UUID REFERENCES public.players(id),
    player_character_id UUID REFERENCES public.player_characters(id),
    turn_order INTEGER,
    is_bot BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active'
);

CREATE TABLE public.battle_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id),
    round_number INTEGER,
    turn_number INTEGER,
    actor_name TEXT,
    action_type TEXT,
    dice_roll INTEGER,
    result_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS para as tabelas principais
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
