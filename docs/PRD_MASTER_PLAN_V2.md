# 📋 PRD Mestre — Sá Pires Warriors: Expansão Fase 2 (Co-Op & Metaverso)

> **Versão:** 2.0 | **Data:** Maio 2026
> **Escopo:** Persistência Supabase, Multiplayer Co-Op, Loja e Inventário, Sistema Dinâmico de Eventos RPG.
> **Modelo de Execução:** Orquestração Multi-Agente Paralela

---

## 🎯 1. Visão Geral do Produto
O Sá Pires Warriors concluiu sua maturação como MVP de combate e UX. A **Fase 2** transforma o jogo em um **Metaverso de RPG Síncrono e Persistente**. Os jogadores não perderão mais seu progresso, poderão gastar ouro em lojas interativas, interagirão com eventos aleatórios narrados por IA antes do combate, e o mais importante: poderão **jogar juntos ao vivo (Co-Op Sync)**.

---

## 🤖 2. Matriz de Orquestração (Agentes & Skills)

Para executar essas funcionalidades complexas sem perder estabilidade, acionaremos a skill `/agent-orchestrator` para gerenciar a skill `/dispatching-parallel-agents`, dividindo a equipe de IA em **Tracks (Trilhas)** simultâneas.

### Agentes Necessários:
1. **Agente DB/Backend (Supabase Expert):** Responsável pelas Migrations e WebSockets.
2. **Agente UI/UX (Frontend UI Engineer):** Usa `antigravity-design-expert` para lojas, modais e layouts de mapa tático.
3. **Agente IA/Narrativa (Prompt Engineer):** Configura as chamadas do Gemini 2.0 para eventos táticos de RPG.
4. **Agente de Integração (Game Engine Dev):** Conecta a persistência e UI no motor de turnos existente (`combat.ts`, `page.tsx`).

---

## 🚀 3. Trilhas de Execução Paralela (Tracks)

O **Orquestrador** deve delegar simultaneamente a **Track A** e a **Track B** para os respectivos agentes, pois não têm dependência direta no frontend num primeiro momento.

### 🟡 TRACK A: Persistência & Multiplayer Real-time (Prioridade Máxima)
**Agente Alocado:** Agente DB/Backend
**Objetivo:** Permitir salvamento e co-op usando o Supabase.
*   **Step A1 (Database):** Criar migration no Supabase (`0001_game_state.sql`). Tabelas: `profiles` (XP, Gold, Nível), `game_sessions` (Estado da Batalha), `session_players` (Quem tá em qual batalha).
*   **Step A2 (Sync):** Criar os hooks no Next.js (`useGameState`) que se conectam ao Supabase Channel (WebSocket).
*   **Step A3 (Multiplayer Logic):** Substituir a IA aliada por ações que vêm do banco de dados (escutando o evento `broadcast` de quando outro jogador clica em "Atacar").

### 🟢 TRACK B: Economia (Inventário & Loja da Vila)
**Agente Alocado:** Agente UI/UX 
**Objetivo:** Dar utilidade real ao Ouro conquistado (Gold).
*   **Step B1 (Estado):** Expandir a store ou state atual para incluir `Inventory` (array de itens) e `Equipped` (arma equipada).
*   **Step B2 (Shop UI):** Criar o componente `TavernShop.tsx` no modo "village". Usar o `antigravity-design-expert` para um visual *glassmorphism* premium, com cartas de itens (ex: "Espada Larga - 50 Gold").
*   **Step B3 (Engine Integrada):** Modificar o botão "Usar Poção" para consumir poções do novo sistema de inventário. Fazer o `combat.ts` ler o `weaponDamage` dinamicamente da arma equipada.

### 🟣 TRACK C: Eventos de Lore (Sistema de D&D)
**Agente Alocado:** Agente IA/Narrativa
**Objetivo:** Interações de texto ricas que afetam atributos antes da batalha.
*   **Step C1 (API):** Criar novo endpoint `/api/ai/encounter` focado em narrar eventos de viagem (Ex: *"Você acha uma carroça virada"*).
*   **Step C2 (Modal RPG):** Criar a UI `EncounterEvent.tsx` onde o jogador recebe a narrativa e 3 opções de escolha geradas dinamicamente pelo LLM.
*   **Step C3 (Mecânica):** Se o jogador tiver sucesso em um "teste de habilidade" pelo texto, o jogo aplica um `buff_defense` no `game-engine` antes do combate iniciar.

### 🔵 TRACK D: Merge & Quality Assurance (Orquestrador)
**Agente Alocado:** Agent Orchestrator & Web Design Guidelines
*   **Step D1:** Unir as lógicas de Multiplayer (Track A) com a tela de Batalha de forma responsiva.
*   **Step D2:** Passar o `web-design-guidelines` (auditoria de UI/UX) para garantir que a loja e o combate online rodam perfeitamente a 60fps no mobile, sem renderizações duplas desnecessárias no React.

---

## 🚦 4. Critérios de Sucesso & Restrições (Gateways)
- **Leveza:** `next build` DEVE compilar 100% sem erros de TS. Nenhum componente online (`Track A`) pode forçar renders na árvore inteira do React (`page.tsx` precisa de memoization).
- **Graceful Degradation:** Se o Supabase Realtime falhar, o jogo DEVE ter fallback silencioso e voltar a ser single-player (a IA volta a controlar os aliados).
- **Design Padrão:** As novas UIs (Inventário/Lojas) DEVEM reutilizar variáveis do tailwind em `globals.css` (Gold, Destructive, Primary) para manter a coesão visual implementada na Fase 1.

---

> **COMANDO RECOMENDADO PARA INÍCIO:**
> `@[/multi-agent-task-orchestrator] Analise o PRD_MASTER_PLAN_V2.md, separe as Tracks A e B em sub-agentes e inicie a execução da Track A focada no Supabase.`
