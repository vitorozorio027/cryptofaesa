# Jogo de Decodificação Rápida (Time Attack Multiplayer)

Um jogo multiplayer em tempo real onde os jogadores competem para decifrar palavras usando a Cifra de César.

## Tecnologias Utilizadas

- Nuxt 3
- Vue 3
- Vuetify 3
- Supabase (para banco de dados e comunicação em tempo real)

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   ```

4. Configure o banco de dados Supabase:
   - Crie uma tabela `players` com as colunas:
     - `id` (integer, primary key, auto increment)
     - `username` (text, unique)
     - `score` (integer, default: 0)

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Como Jogar

1. Acesse o jogo no navegador
2. Digite um nome de usuário único
3. Aguarde outros jogadores entrarem na sala
4. O primeiro jogador pode iniciar o jogo
5. Todos os jogadores receberão a mesma palavra cifrada
6. Decifre a palavra dentro do tempo limite
7. Ganhe pontos por respostas corretas
8. Acompanhe o ranking em tempo real

## Funcionalidades

- Registro de usuário único por dispositivo
- Salas multiplayer em tempo real
- Sistema de pontuação
- Ranking em tempo real
- Cifra de César com deslocamento aleatório
- Cronômetro regressivo
- Interface responsiva com Vuetify 