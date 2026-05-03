# Architecture - Sá Pires Warriors

## Visão Geral
Sá Pires Warriors é construído em Next.js (App Router) utilizando uma arquitetura baseada em camadas.

## Camadas da Aplicação
1. **Presentation Layer (Frontend UI/UX):**
   - Diretório: `src/app`, `src/components`
   - Responsabilidade: Renderizar estado visual (dark fantasy costeiro), gerenciar animações de MapTransition e lidar com interações do usuário. Sem lógica pesada de jogo.
2. **Game Engine Layer:**
   - Diretório: `src/game-engine`
   - Responsabilidade: Funções puras em TypeScript para cálculo de `dice.ts` (d20), `combat.ts`, e `turns.ts`. Testável sem UI.
3. **Data Access Layer:**
   - Diretório: `src/lib/supabaseClient.ts`, `src/server/actions`
   - Responsabilidade: Comunicação segura com Supabase.
4. **AI & Narration Layer:**
   - Diretório: `src/server/ai`
   - Responsabilidade: IA narradora e estrategista rodando no servidor. Chamadas isoladas da UI.

## Data Flow (Turno Básico)
1. O usuário clica "Atacar".
2. UI dispara Action com dados.
3. `combat.ts` roda lógica de d20.
4. Resultado é gravado no Supabase (`saveBattleLog.ts`).
5. AI Agent narra a rodada se configurado.
6. A interface reage através de Realtime/WebSockets ou State Update refletindo a nova HP.
