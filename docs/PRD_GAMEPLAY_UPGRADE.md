# 📋 PRD — Sá Pires Warriors: Gameplay & UX Mega Upgrade

> **Versão:** 1.0 | **Data:** 2025-05-09  
> **Projeto:** `c:\Sa_Pires_Warriors\sapires-warriors`  
> **Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion, Supabase  
> **Build:** `npx next build` — DEVE passar com ZERO erros após cada tarefa

---

## 🏗️ Contexto Técnico (Leia Primeiro)

### Estrutura de Pastas Relevante
```
src/
├── app/
│   ├── page.tsx              ← ARQUIVO PRINCIPAL DO JOGO (~1050 linhas)
│   ├── lobby/page.tsx        ← Tela de seleção de herói
│   ├── login/page.tsx        ← Tela de login
│   └── api/
│       ├── ai/narrate/route.ts  ← API de narrativa IA (Gemini)
│       └── tts/route.ts         ← Text-to-Speech
├── components/
│   ├── cards/
│   │   ├── HeroCard.tsx      ← Card visual do herói na batalha
│   │   └── EnemyCard.tsx     ← Card visual do inimigo na batalha
│   └── game/
│       ├── ActionPanel.tsx   ← Painel de ações (ATACAR, SKILLS, DEFENDER)
│       ├── BattleScene.tsx   ← Layout da cena de batalha
│       ├── BattleLog.tsx     ← Log de combate (sidebar direita)
│       ├── D20Interactive.tsx ← Dado 3D interativo
│       ├── VillageScene.tsx  ← Mapa da vila com POIs
│       ├── NarrativeCard.tsx ← Modal narrativo com typewriter
│       ├── QuestPanel.tsx    ← Painel de quests lateral
│       └── ChatPanel.tsx     ← Chat multiplayer
├── data/
│   ├── heroes.ts             ← 7 heróis com stats, skills, equipamento
│   ├── enemies.ts            ← 5 tipos de inimigo (Goblin → Boss)
│   └── lore.ts               ← Narrativas, quests, waves, gold system
├── game-engine/
│   ├── combat.ts             ← Motor de ataque (D20 + atributos)
│   ├── dice.ts               ← Lógica do D20
│   └── leveling.ts           ← XP, level up, distribuição
└── lib/
    ├── audio.ts              ← Áudio, TTS, fila de sons
    └── supabaseClient.ts     ← Cliente Supabase
```

### Tipos Importantes (Referência Rápida)
```typescript
// Hero (heroes.ts)
type Hero = {
  id: string; name: string; class: string; level: number;
  hp: number; maxHp: number; mana: number;
  attributes: { forca, agilidade, inteligencia, espirito, defesa, velocidade: number };
  skills: { name: string; description: string; cost: number; type: string }[];
  passive: { name: string; description: string };
  equipment: string[]; xp: number; xpNextLevel: number;
  cardImage: string; fullImage: string; potionCount: number;
};

// Enemy (enemies.ts) — mesma estrutura mas com isBoss: boolean

// Skill types presentes nos heróis:
// 'attack', 'magic_attack', 'magic_aoe', 'defense', 'heal', 'buff'

// CombatResult (combat.ts)
type CombatResult = {
  diceResult: DiceResult; damageDealt: number; logMessage: string;
  isCritical: boolean; isFumble: boolean;
};
```

### Estado Atual do page.tsx (Fluxo)
1. Login → Valida sessão Supabase → Carrega heróis e inimigos
2. Village → Mapa com 5 POIs clicáveis (taverna, forja, biblioteca, doca, batalha)
3. Transition → Animação de transição com título
4. Battle → Turnos em loop: herói/inimigo → rola dado → aplica dano → next turn
5. Victory → XP + Gold → "Próxima Onda" ou "Voltar à Vila"

### Variáveis de Estado Críticas (page.tsx)
```typescript
const [gold, setGold] = useState(20);
const [currentWave, setCurrentWave] = useState(0);
const [activeHeroes, setActiveHeroes] = useState<Hero[]>([]);
const [activeEnemies, setActiveEnemies] = useState<{enemy: Enemy, currentHp: number}[]>([]);
const [turnOrder, setTurnOrder] = useState<string[]>([]);
const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
const [quests, setQuests] = useState<Quest[]>(initialQuests);
```

---

## 📌 REGRAS DE EXECUÇÃO

1. **Uma tarefa por vez.** Não misture tarefas.
2. **Após cada tarefa:** rode `npx tsc --noEmit` e `npx next build`. ZERO erros.
3. **Não quebre funcionalidades existentes.** Teste o fluxo completo mentalmente.
4. **Mantenha comentários existentes** que não são afetados pela mudança.
5. **Use esta ordem de execução** — as tarefas têm dependências.

---

## ✅ TAREFAS (Ordem de Execução)

---

### TAREFA 1: Sistema de Skills Funcional
**Prioridade:** 🥇 MÁXIMA | **Complexidade:** ⭐⭐⭐ | **Depende de:** Nada

#### Problema
Os heróis têm 2 skills cada com custo de mana definido, mas o `handleAction` em `page.tsx` (linha ~525) ignora o tipo da skill e sempre executa um ataque básico com `executeAttack`. A mana nunca é descontada.

#### O Que Fazer

**A) Criar `src/game-engine/skills.ts`:**
```typescript
export type SkillEffect = {
  type: 'damage' | 'damage_aoe' | 'heal' | 'buff_defense' | 'debuff';
  basePower: number;        // multiplicador de dano/cura
  attribute: 'forca' | 'inteligencia' | 'espirito';  // qual atributo escala
  targetType: 'single_enemy' | 'all_enemies' | 'self' | 'single_ally';
};

// Mapa de skill type → efeito mecânico
export const SKILL_EFFECTS: Record<string, SkillEffect> = {
  'attack':       { type: 'damage',       basePower: 1.2, attribute: 'forca',         targetType: 'single_enemy' },
  'magic_attack': { type: 'damage',       basePower: 1.5, attribute: 'inteligencia',  targetType: 'single_enemy' },
  'magic_aoe':    { type: 'damage_aoe',   basePower: 0.8, attribute: 'inteligencia',  targetType: 'all_enemies' },
  'defense':      { type: 'buff_defense', basePower: 0,   attribute: 'defesa',        targetType: 'self' },
  'heal':         { type: 'heal',         basePower: 1.0, attribute: 'espirito',      targetType: 'self' },
  'buff':         { type: 'buff_defense', basePower: 0,   attribute: 'espirito',      targetType: 'single_ally' },
};

export function executeSkill(skill, caster, targets, diceRoll): SkillResult { ... }
```

**B) Modificar `page.tsx` → `handleAction`:**
- Se `actionType === 'skill'`: encontrar a skill no herói, verificar mana, descontar mana, usar `SKILL_EFFECTS` para determinar o tipo de efeito
- Se `targetType === 'all_enemies'`: aplicar dano a TODOS os inimigos vivos
- Se `targetType === 'self'`: aplicar heal/buff ao próprio herói
- Descontar `skill.cost` da mana do herói

**C) Modificar `ActionPanel.tsx`:**
- Mostrar custo de mana atual do herói
- Desabilitar skills quando mana < custo (já existe parcialmente)
- Adicionar regen de mana: +1 mana por turno (no `nextTurn` de page.tsx)

#### Critérios de Aceitação
- [ ] Ao usar "Raio de Névoa" (Yara, magic_attack, 2 MP): rola D20, dano escala com INT ao invés de FOR
- [ ] Ao usar "Explosão de Brumas" (Yara, magic_aoe, 4 MP): dano aplicado a TODOS os inimigos
- [ ] Mana é descontada ao usar skill
- [ ] Skill desabilitada quando mana insuficiente
- [ ] Build passa com zero erros

---

### TAREFA 2: Target Selection (Escolher Alvo)
**Prioridade:** 🥈 ALTA | **Complexidade:** ⭐⭐⭐ | **Depende de:** Tarefa 1

#### Problema
Em `page.tsx` linha ~532: `const target = aliveEnemies[0]` — o jogador SEMPRE ataca o primeiro inimigo vivo.

#### O Que Fazer

**A) Adicionar estado em `page.tsx`:**
```typescript
const [selectingTarget, setSelectingTarget] = useState(false);
const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
```

**B) Fluxo Novo:**
1. Player clica ATACAR ou SKILL (single target) → `setSelectingTarget(true)`
2. Inimigos ficam com borda brilhante pulsante e cursor pointer
3. Player clica no inimigo desejado → `setSelectedTargetId(enemy.id)` → rola o dado
4. Para skills AOE: pula a seleção, ataca todos

**C) Modificar `BattleScene.tsx`:**
- Receber prop `onEnemyClick?: (enemyId: string) => void` e `selectingTarget?: boolean`
- Quando `selectingTarget`: inimigos vivos ganham classe CSS de seleção (borda verde pulsante, cursor pointer)
- Ao clicar, chama `onEnemyClick(enemy.id)`

**D) Modificar `EnemyCard.tsx`:**
- Receber prop `selectable?: boolean` e `onClick?: () => void`
- Quando selectable: adicionar overlay "SELECIONAR ALVO" + glow verde

#### Critérios de Aceitação
- [ ] Ao clicar ATACAR, inimigos ficam selecionáveis com efeito visual
- [ ] Ao clicar no inimigo, dado rola e ataque vai naquele alvo específico
- [ ] Skills AOE pulam a seleção e atacam todos
- [ ] Ghost players (IA) continuam escolhendo alvo aleatório
- [ ] Build passa com zero erros

---

### TAREFA 3: Números de Dano Flutuantes
**Prioridade:** 🥉 ALTA | **Complexidade:** ⭐⭐ | **Depende de:** Nada

#### O Que Fazer

**A) Criar `src/components/game/FloatingDamage.tsx`:**
```tsx
// Props: { amount: number; type: 'damage' | 'heal' | 'xp' | 'gold'; position: {x, y} }
// Renderiza número flutuante que sobe e desaparece
// Vermelho para dano, verde para cura, roxo para XP, dourado para ouro
// CSS animation: translateY(-80px) + opacity(0) em 1.5s
```

**B) Adicionar estado em `page.tsx`:**
```typescript
const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
```

**C) No `processCombatResult` (page.tsx ~454):** quando dano > 0, adicionar um floating number na posição do card atacado.

**D) No `BattleScene.tsx`:** renderizar os floating numbers sobre os cards.

#### Critérios de Aceitação
- [ ] Ao atacar inimigo: "-X" vermelho flutua pra cima do card
- [ ] Ao herói tomar dano: "-X" vermelho flutua do card do herói
- [ ] Ao curar: "+X" verde flutua
- [ ] Números desaparecem após 1.5s
- [ ] Build passa com zero erros

---

### TAREFA 4: Defender com Efeito Real + Poções em Combate
**Prioridade:** ALTA | **Complexidade:** ⭐⭐ | **Depende de:** Tarefa 1

#### Problema
O botão DEFENDER existe mas não tem lógica. Poções existem no herói (`potionCount`) mas não podem ser usadas em combate.

#### O Que Fazer

**A) Defender:**
- Adicionar estado `defendingHeroes: Set<string>` em page.tsx
- Quando DEFENDER: adicionar herói ao set, pular para próximo turno
- No `processCombatResult`: se herói está defendendo, reduzir dano em 50%
- No próximo turno do herói: remover do set de defending
- Visual: escudo brilhante no HeroCard quando defendendo

**B) Poções:**
- Adicionar botão 🧪 no ActionPanel (desabilitado se potionCount === 0)
- Ao clicar: curar 30% do maxHp, decrementar potionCount, gastar turno
- Log: "{herói} usou uma poção! +X HP"

**C) Modificar `HeroCard.tsx`:**
- Receber prop `isDefending?: boolean`
- Quando true: borda azul brilhante + ícone 🛡️ sobre o card

#### Critérios de Aceitação
- [ ] DEFENDER: herói defende, próximo dano recebido é -50%
- [ ] Visual de escudo aparece no card enquanto defendendo
- [ ] Poção: cura 30% HP, decrementa contador, gasta turno
- [ ] Poção desabilitada quando potionCount === 0
- [ ] Build passa com zero erros

---

### TAREFA 5: Barra de Iniciativa (Turn Order)
**Prioridade:** MÉDIA | **Complexidade:** ⭐⭐ | **Depende de:** Nada

#### O Que Fazer

**A) Criar `src/components/game/InitiativeBar.tsx`:**
```tsx
// Barra horizontal no topo da tela de batalha
// Mostra miniatura circular de cada herói/inimigo na ordem de turno
// O ativo tem borda brilhante verde e scale maior
// Mortos ficam em grayscale
// Prop: turnOrder, currentIndex, heroes, enemies
```

**B) Adicionar na tela de batalha** (page.tsx, seção BATTLE SCREEN ~968):
- Substituir o "Round indicator" simples pela barra de iniciativa completa
- Incluir número da rodada e da onda

#### Critérios de Aceitação
- [ ] Barra mostra todos os personagens na ordem correta
- [ ] O ativo está destacado
- [ ] Mortos ficam em cinza
- [ ] Atualiza ao avançar turno
- [ ] Build passa com zero erros

---

### TAREFA 6: Corrigir Ouro no HeroCard
**Prioridade:** MÉDIA | **Complexidade:** ⭐ | **Depende de:** Nada

#### Problema
`HeroCard.tsx` linha 15: `const gold = 125;` — hardcoded! Não reflete o ouro real.

#### O Que Fazer
- Adicionar prop `gold?: number` no HeroCardProps
- Passar `gold` do state de page.tsx para o BattleScene e para cada HeroCard
- Remover a constante hardcoded

#### Critérios de Aceitação
- [ ] O ouro exibido no HeroCard reflete o valor real do state
- [ ] Build passa com zero erros

---

### TAREFA 7: Screen Shake no Dano
**Prioridade:** MÉDIA | **Complexidade:** ⭐ | **Depende de:** Nada

#### O Que Fazer

**A) Adicionar CSS no `globals.css`:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px) rotate(-1deg); }
  40% { transform: translateX(8px) rotate(1deg); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.screen-shake { animation: shake 0.4s ease-in-out; }
```

**B) Em `page.tsx`:** quando dano é aplicado ao herói, adicionar classe `screen-shake` ao container da batalha por 400ms.

#### Critérios de Aceitação
- [ ] Tela treme quando herói toma dano
- [ ] Não treme quando inimigo toma dano
- [ ] Build passa com zero erros

---

### TAREFA 8: Battle Log Mobile (Bottom Sheet)
**Prioridade:** MÉDIA | **Complexidade:** ⭐⭐ | **Depende de:** Nada

#### Problema
`page.tsx` linha 996: `hidden lg:block` — log invisível em mobile.

#### O Que Fazer
- Em telas < 1024px: mostrar botão fixo "📜 Log" no canto
- Ao clicar: abre bottom sheet com o log (slide-up animation)
- Usar `useState` para controlar visibilidade
- Pode ser implementado diretamente no mesmo bloco ou como componente separado

#### Critérios de Aceitação
- [ ] Em desktop: log continua na sidebar direita (sem mudança)
- [ ] Em mobile: botão "📜 Log" visível, abre bottom sheet
- [ ] Bottom sheet pode ser fechado com botão ou clique fora
- [ ] Build passa com zero erros

---

### TAREFA 9: Layout Mobile da Batalha
**Prioridade:** ALTA | **Complexidade:** ⭐⭐⭐ | **Depende de:** Tarefa 8

#### Problema
7 heróis com `w-48` ficam amontoados em mobile. ActionPanel com 5 botões não cabe.

#### O Que Fazer

**A) `BattleScene.tsx`:**
- Mobile (< 768px): heróis em scroll horizontal com snap
- Desktop: manter layout atual
- Cards menores em mobile (w-28 ao invés de w-48)

**B) `ActionPanel.tsx`:**
- Mobile: botões como ícones circulares em uma row
- ⚔️ Atacar | ✨ Skill1 | ✨ Skill2 | 🛡️ Defender | 🧪 Poção
- Desktop: manter layout atual com texto

#### Critérios de Aceitação
- [ ] Em telas < 768px: heróis em scroll horizontal
- [ ] Botões de ação como ícones em mobile
- [ ] Desktop sem mudanças visuais
- [ ] Build passa com zero erros

---

### TAREFA 10: Persistência no Supabase
**Prioridade:** CRÍTICA (mas por último pois é a mais complexa) | **Complexidade:** ⭐⭐⭐⭐ | **Depende de:** Tarefas 1-6

#### O Que Fazer

**A) Criar tabela via migration:**
```sql
CREATE TABLE IF NOT EXISTS public.game_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hero_id TEXT NOT NULL,
  gold INTEGER DEFAULT 20,
  current_wave INTEGER DEFAULT 0,
  hero_level INTEGER DEFAULT 1,
  hero_xp INTEGER DEFAULT 0,
  hero_hp INTEGER,
  hero_mana INTEGER,
  hero_forca INTEGER,
  hero_potion_count INTEGER DEFAULT 2,
  quests_completed TEXT[] DEFAULT '{}',
  visited_locations TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.game_progress
  FOR ALL USING (auth.uid() = user_id);
```

**B) Criar `src/lib/saveGame.ts`:**
```typescript
export async function saveGameProgress(userId, data): Promise<void>
export async function loadGameProgress(userId): Promise<GameProgress | null>
```

**C) Em `page.tsx`:**
- No `useEffect` de inicialização: chamar `loadGameProgress` e aplicar os dados
- Ao voltar para a vila (victory → village): chamar `saveGameProgress`
- Auto-save a cada 60s quando na vila

#### Critérios de Aceitação
- [ ] Ao recarregar a página, ouro, XP, nível e onda são restaurados
- [ ] Quests completadas permanecem completadas
- [ ] Cada usuário tem seu próprio save
- [ ] RLS aplicada corretamente
- [ ] Build passa com zero erros

---

## 🔄 Ordem de Execução (Grafo de Dependências)

```
Paralelo 1 (sem dependência):
  ├── TAREFA 3: Floating Damage Numbers
  ├── TAREFA 5: Initiative Bar
  ├── TAREFA 6: Fix Gold HeroCard
  ├── TAREFA 7: Screen Shake
  └── TAREFA 8: Battle Log Mobile

Sequencial:
  TAREFA 1: Skills → TAREFA 2: Target Selection → TAREFA 4: Defend + Potions

Depois de tudo:
  TAREFA 9: Layout Mobile (depende de 8)
  TAREFA 10: Persistência (depende de 1-6)
```

**Sugestão de execução ótima:**
1. Tarefa 6 (1 min — fix trivial)
2. Tarefa 7 (5 min — CSS)
3. Tarefa 3 (15 min — floating numbers)
4. Tarefa 5 (15 min — initiative bar)
5. Tarefa 1 (30 min — skills ⚡ maior impacto)
6. Tarefa 4 (15 min — defend + potions)
7. Tarefa 2 (20 min — target selection)
8. Tarefa 8 (10 min — log mobile)
9. Tarefa 9 (20 min — layout mobile)
10. Tarefa 10 (30 min — persistência)

---

## ✅ Checklist Final (Rodar Após Todas as Tarefas)

```bash
# 1. Type check
npx tsc --noEmit

# 2. Production build
npx next build

# 3. Teste manual mental:
# - Login → Lobby → Selecionar herói → Vila
# - Vila: verificar ouro, onda, quests
# - Forja: gastar ouro (verificar se desconta)
# - Batalha: usar SKILL (verificar mana desconta)
# - Batalha: escolher alvo (clicar inimigo)
# - Batalha: DEFENDER (verificar redução dano)
# - Batalha: USAR POÇÃO (verificar cura)
# - Vitória: verificar XP + ouro ganhos
# - Próxima onda → Boss → Vitória Final
# - Voltar à vila: verificar persistência (reload page)
```

---

> **NOTA PARA AGENTES FUTUROS:** Este PRD é autocontido. Todas as informações necessárias para implementar cada tarefa estão aqui. Siga a ordem de execução e valide a build após cada tarefa. O projeto está em `c:\Sa_Pires_Warriors\sapires-warriors`.
