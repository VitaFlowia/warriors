# Database Schema - Sá Pires Warriors

Este projeto utiliza o Supabase com PostgreSQL. Abaixo a arquitetura de tabelas:

### Tabelas
- **`players`**: Jogadores cadastrados.
- **`characters`**: Definições base dos Heróis.
- **`player_characters`**: Instâncias dos Heróis que pertencem a um jogador (vida, mana, XP atuais).
- **`matches`**: Partidas criadas (estado, rodada, turno).
- **`match_players`**: Relação de jogadores e bots em uma partida específica.
- **`battle_logs`**: Logs das batalhas contendo as ações e resultados para recriar eventos.

### Segurança (RLS)
O Row Level Security (RLS) é habilitado para as tabelas principais.
Para MVP local/estudo, policies abertas podem ser usadas, mas em produção, as policies devem restringir acesso.

### Tabelas Futuras a Serem Criadas
- `enemies`, `match_enemies`, `villages`, `skills`, `items`, `player_inventory`.
