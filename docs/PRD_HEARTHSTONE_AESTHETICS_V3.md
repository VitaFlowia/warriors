# 📋 PRD — Sá Pires Warriors: Fase 3 (Estética Hearthstone & Game Feel)

> **Versão:** 3.0 | **Data:** Maio 2026
> **Foco:** Reestruturação Visual, Animações CSS Avançadas, "Card Revelador" e Feedback de Combate.
> **Modelo de Execução:** Orquestração do Agente UI/UX (antigravity-design-expert)

---

## 🎯 1. Visão Geral do Produto
O jogador apontou a necessidade de uma interface menos "fria" e mais dinâmica, com a pegada de jogos de tabuleiro digitais AAA como *Hearthstone* e *Marvel Snap*. A meta desta fase é injetar **Game Feel** no Sá Pires Warriors. Tudo deve ter movimento, peso, brilho e fluidez usando animações CSS hiper-otimizadas que rodam a 60 FPS até em celulares antigos, abolindo temporizadores pesados (setInterval) que travam o DOM.

---

## 🃏 2. O "Card de Destino" (Novo Dado)
Adeus ao quadrado com número piscando. 
*   **A Mecânica:** Quando o jogador atacar, uma Carta de Costas (com o brasão do jogo) salta do baralho para o centro da tela. Ela flutua por 1 segundo (criando suspense) e então vira (efeito de Flip 3D) revelando de forma explosiva o resultado: *Dano Crítico*, *Sucesso* ou *Falha*.
*   **Aparência:** O verso da carta terá um brilho contínuo (`drop-shadow` pulsante). Ao virar, um raio de luz (CSS gradient) passa por cima da carta revelada.

---

## 🪄 3. Reestruturação do "Game Feel" (Infraestrutura UI)

Para dar vida ao jogo, aplicaremos 4 pilares visuais em todos os elementos:

### Pilar A: Movimento de Cartas (Hover e Idle)
Todos os `HeroCard` e `EnemyCard` deixarão de ser elementos estáticos colados na tela. 
*   **Idle Animation:** Cartas respiram levemente (sobem e descem 2 pixels) quando ociosas.
*   **Hover 3D (Efeito Parallax):** Quando o usuário passa o dedo/mouse por cima do herói ou do inimigo na hora de atacar, a carta inclina levemente na direção do mouse e emite um brilho dourado em volta da borda, mostrando que a entidade está viva e interagível.

### Pilar B: Impacto e Dano (Hit e Shake)
*   **Dano Físico:** Quando a carta do inimigo recebe dano, além de perder HP, ela pisca na cor Branca (Flash) por 0.1 segundo e recua para trás, voltando para o lugar (simulando que tomou uma "pancada").
*   **Morte (Desintegração):** Em vez de apenas ficar cinza, a carta do inimigo derrotado irá encolher, tremer intensamente e "queimar" até desaparecer da mesa, liberando espaço.

### Pilar C: O Action Panel (Mesa de Jogo)
*   Em vez de apenas botões de UI quadrados, a parte inferior da tela ganhará a estética de uma "Mesa de Madeira Escura" ou "Pedra Rúnica", separando claramente a zona do jogador da zona de batalha.
*   Os botões de "ATACAR" e "POÇÃO" parecerão fichas de poker pesadas ou selos mágicos que "afundam" quando clicados.

### Pilar D: O Campo de Batalha 
*   O fundo de batalha terá partículas suaves caindo (ex: brasas de fogo, folhas voando ou poeira flutuante, feito em puro CSS sem pesar a CPU). Isso acaba com a sensação de "site morto" e transforma a tela num mundo vivo.

---

## 🚀 4. Trilhas de Execução do Orquestrador

*   **Step 1:** Criar e polir o `DestinyCard.tsx` (Substituto do `DiceRoller.tsx`) com animação `@keyframes flip-card` e partículas visuais (CSS puro).
*   **Step 2:** Refatorar o `HeroCard.tsx` e `EnemyCard.tsx` implementando os efeitos `idle-breathe` e `on-hit-flash`.
*   **Step 3:** Atualizar `globals.css` adicionando todos os tokens de animações avançadas da estética "Hearthstone" (sombras dinâmicas, glassmorphism e gradients de luz).
*   **Step 4:** Aplicar a "Mesa de Madeira/Pedra" no `ActionPanel.tsx`.

---

## 🚦 5. Restrições e Garantia de Performance
*   **PROIBIDO:** Usar `setInterval` para animações ou bibliotecas React gigantescas (como Framer Motion ou ThreeJS se não for estritamente necessário). 
*   **OBRIGATÓRIO:** Toda animação de Flip, Brilho, Tremor e Suspiro deve ser feita através das propriedades CSS `transform` e `opacity`, que são delegadas diretamente para a Placa de Vídeo (GPU) e garantem que qualquer smartphone de 2018 rode o jogo suave.
