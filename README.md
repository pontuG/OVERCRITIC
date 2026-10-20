<div align="center">

  <img src="assets/overcritic_icon.png" alt="OVERCRITIC Logo" width="120" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(0, 240, 255, 0.25);" />

  # OVERCRITIC
  **Portal definitivo de críticas, notícias geek, catálogo multimídia e rastreador de platinas.**

  [![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
  [![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)](https://docs.microsoft.com/dotnet/csharp/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:5000/swagger)

  <p align="center">
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-funcionalidades-principais">Funcionalidades</a> •
    <a href="#-tecnologias-e-stack">Tecnologias</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-endpoints-da-api">API REST</a> •
    <a href="#-estrutura-do-projeto">Estrutura</a> •
    <a href="#-integracoes-externas">Integrações</a>
  </p>

</div>

---

## 🌟 Sobre o Projeto

O **OVERCRITIC** é uma plataforma moderna e imersiva criada para entusiastas de jogos eletrônicos, cinema, séries e cultura pop. O ecossistema combina um agregador social de resenhas detalhadas, um explorador de lançamentos conectado a bases de dados mundiais e um gerenciador avançado de conquistas e platinas com integração direta à Steam.

Com estética futurista baseada em *Dark Glassmorphism* e acentos neon ciano e roxo, o projeto foi projetado com arquitetura **Offline-First**, permitindo uso contínuo mesmo sem conexão à internet através de cache local inteligente e sincronização com backend em **C# .NET 8** e nuvem **Supabase**.

---

## 🚀 Funcionalidades Principais

### 🎮 Críticas & Avaliações de Jogos
- **Ficha Técnica Completa**: Registro de nota geral, pontuação por critérios específicos (jogabilidade, narrativa, gráficos, trilha sonora, etc.).
- **Prós, Contras e Veredito**: Estruturação de análises críticas com registro de plataforma jogada e tempo de gameplay.
- **Feed da Comunidade**: Timeline interativa com filtros dinâmicos, curtidas e comentários.

### 🎬 Catálogo de Filmes, Séries & Animes
- **Explorador Multimídia**: Busca integrada via **TMDB API** com sinopse, elenco, avaliações internacionais e posters em alta definição.
- **Onde Assistir**: Indicadores visuais de disponibilidade nos principais streamings (Netflix, Prime Video, Max, Disney+, Apple TV+, Crunchyroll).

### 🏆 Gerenciador de Platinas & Troféus
- **Sincronização com a Steam**: Busca automatizada de conquistas em tempo real informando o AppID da Steam ou nome do jogo.
- **Categorização Automática**: Separação inteligente dos troféus em Bronze, Prata, Ouro e Platina com base na raridade e porcentagem global de desbloqueio.
- **Vitrine de 100%**: Mural comemorativo para exibir seus jogos platinados.

### ⚡ Gamificação & Perfil Gamer
- **Sistema de XP e Níveis**: Ganho de experiência e subida de nível ao postar análises, platinas e interagir na comunidade.
- **🏆 Mural de Insígnias & Conquistas Desbloqueáveis**: Estante de troféus virtuais interativa no perfil com popups animados de desbloqueio, arpeggio de áudio sintetizado (*Web Audio API*) e recompensas reais de XP (*Soulslike Slayer*, *Caçador de Platinas*, *Crítico Respeitado*, *Cineasta*).
- **Gamer Card & Avatar Customizável**: Cartão de jogador personalizável com títulos honorários e estatísticas em tempo real, exportável em alta resolução para Stories (9:16) e Feed/Discord (4:5).

### 📰 Radar Geek & Notícias
- Feed diário de notícias sobre o mercado de games, trailers cinematográficos e lançamentos iminentes.

### 🔍 Busca Global Instantânea (Spotlight / Raycast)
- **Atalho Universal (Ctrl + K)**: Acesso imediato a partir de qualquer página através do atalho global ou botão no cabeçalho.
- **Multibusca em Tempo Real**: Pesquisa unificada e instantânea em 6 categorias simultâneas (Jogos, Críticas opinativas, Filmes/Séries, Platinas & Troféus, Perfis da Comunidade e Ações Rápidas do sistema).
- **Navegação Completa por Teclado**: Navegação por setas (↑ / ↓), seleção de item com Enter (↵), alternância rápida de filtros com Tab e cancelamento com Escape (ESC).
- **Scroll Lock Total & Sound FX**: Congelamento de scroll em toda a página e retorno sonoro tecnológico sutil sintetizado via Web Audio API.

### 📱 Progressive Web App (PWA)
- Instalável como aplicativo nativo no Windows, Android e iOS.
- Service Worker com estratégia de cache offline e carregamento ultra-rápido.

---

## 🛠️ Tecnologias e Stack

### **Frontend**
- **Linguagens**: HTML5 Semântico, CSS3 Moderno (Custom Properties, Flexbox, CSS Grid, Glassmorphism).
- **Lógica e Aplicação**: JavaScript Moderno (ES6+ Vanilla, sem dependências pesadas de framework).
- **PWA**: Service Worker (`sw.js`), Web App Manifest (`manifest.json`), Cache API.
- **Tipografia**: Google Fonts (*Inter*).

### **Backend (.NET 8 Web API)**
- **Framework**: C# / ASP.NET Core 8.0 Web API.
- **Documentação de API**: Swagger / OpenAPI integrado (`/swagger`).
- **Servidor Integrado de Arquivos Estáticos**: O próprio servidor .NET serve os arquivos do frontend, eliminando conflitos de CORS durante o desenvolvimento.
- **HTTP Client Factory**: Requisições assíncronas com tratamento resiliente para APIs externas.

### **Persistência & Resiliência**
- **Supabase**: Banco de dados relacional PostgreSQL na nuvem, autenticação e REST API.
- **Fallback Local**: O `apiClient.js` chaveia automaticamente entre a API C#, o Supabase direto ou o `localStorage` do navegador caso o backend esteja offline.

---

## 📂 Estrutura do Projeto

```text
Index/
├── assets/                  # Ícones, favicons, logos e identidades visuais
├── backend/                 # Backend ASP.NET Core (.NET 8 Web API)
│   ├── Controllers/         # Endpoints REST (Jogos, Midias, Platinas, Troféus, Estatísticas)
│   ├── Models/              # DTOs e Modelos de domínio
│   ├── Services/            # Integração HTTP e Supabase Client
│   ├── appsettings.json     # Configurações do backend e credenciais Supabase
│   ├── Overcritic.Api.csproj# Configuração do projeto .NET 8
│   └── Program.cs           # Pipeline da aplicação, CORS, Swagger e Static Files
├── css/                     # Estilos complementares e temas
├── js/                      # Módulos JavaScript da plataforma
│   ├── apiClient.js         # Camada de comunicação com Backend C# e Supabase
│   ├── avatarManager.js     # Gerenciamento de avatares e customização visual
│   ├── gamerProfile.js      # Sistema de perfil de jogador e cartões gamer
│   ├── geekNewsManager.js   # Feed e gerenciador de notícias geek
│   ├── notifications.js     # Sistema de notificações em tempo real
│   ├── overcriticGamification.js # Motor de XP, níveis e badges
│   ├── pwaManager.js        # Ciclo de vida do Service Worker e instalação PWA
│   └── trofeusDatabase.js   # Banco local e mapeador de conquistas
├── index.html               # Painel principal e feed do Overcritic
├── descobrir_jogos.html     # Catálogo e busca de games (RAWG & Steam)
├── descobrir_titulos.html   # Catálogo e busca de filmes e séries (TMDB)
├── adicionar_jogos.html     # Formulário de criação de review de jogos
├── adicionar_midias.html    # Formulário de avaliação de filmes e séries
├── adicionar_platinas.html  # Registrador de platinas com integração Steam
├── conta_login.html         # Página de login de usuários
├── cadastrar_conta.html     # Página de registro de novas contas
├── suporte_overcritic.html  # Central de suporte e abertura de tickets
├── supabaseClient.js        # Inicialização do SDK Supabase no frontend
├── manifest.json            # Manifesto PWA
├── sw.js                    # Service Worker para suporte offline
├── iniciar_backend.bat      # Script batch para inicialização rápida do backend
└── README.md                # Documentação do projeto
```

---

## ⚡ Como Executar

### Pré-requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) instalado.
- Navegador moderno com suporte a ES6 e Service Workers (Chrome, Edge, Firefox, Brave).

---

### Opção 1: Inicialização Rápida (Recomendado no Windows)
Dê um duplo clique no arquivo:
```cmd
iniciar_backend.bat
```
O script compilará a API .NET 8, inicializará o servidor local e servirá tanto a API quanto a aplicação web completa.

---

### Opção 2: Linha de Comando (.NET CLI)

1. Abra o terminal na raiz do projeto (`Index`).
2. Execute o comando:
   ```bash
   dotnet run --project backend/Overcritic.Api.csproj
   ```
3. O servidor estará disponível nos seguintes endereços:
   - 🌐 **Aplicação Web**: [http://localhost:5000](http://localhost:5000)
   - 📄 **Documentação Swagger**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

### Opção 3: Frontend Avulso (Modo Offline / Live Server)
Caso queira rodar apenas a interface sem compilar o backend C#:
- Abra diretamente o arquivo `index.html` em seu navegador ou use uma extensão como o *Live Server* do VS Code.
- A plataforma detectará a ausência do backend e funcionará automaticamente com o **Supabase direto** ou **Armazenamento Local (LocalStorage)**.

---

## 📡 Endpoints da API (.NET 8)

Abaixo estão os principais endpoints disponibilizados pelo backend em `http://localhost:5000/api`:

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/jogos` | Retorna a lista de todas as críticas de jogos cadastradas |
| `POST` | `/api/jogos` | Cadastra ou atualiza uma avaliação de jogo |
| `DELETE` | `/api/jogos/{id}` | Remove uma análise de jogo por ID |
| `GET` | `/api/midias` | Lista as avaliações de filmes, séries e animes |
| `POST` | `/api/midias` | Cadastra uma nova crítica de mídia audiovisual |
| `DELETE` | `/api/midias/{id}` | Remove uma análise de mídia por ID |
| `GET` | `/api/platinas` | Retorna o feed global de platinas registradas |
| `POST` | `/api/platinas` | Registra uma nova platina conquistada |
| `GET` | `/api/trofeus/steam/{appId}` | Obtém troféus em tempo real diretamente da Steam para o AppID informado |
| `GET` | `/api/trofeus/buscar?nome={nome}` | Busca AppID e conquistas da Steam por nome do jogo |
| `GET` | `/api/estatisticas` | Retorna o total consolidado de jogos, mídias e platinas cadastradas |

> 💡 *Dica:* Você pode testar e inspecionar os esquemas JSON de cada rota de forma interativa através do painel do **Swagger** em `/swagger`.

---

## 🔑 Integrações Externas

O Overcritic conecta-se com diversas APIs públicas para enriquecer a experiência do usuário:

| Integração | Finalidade | Status / Configuração |
|---|---|---|
| **RAWG Video Games Database** | Metadados de jogos, notas Metacritic, capturas de tela e plataformas | Pool de chaves com rotação e fallback automático |
| **The Movie Database (TMDB)** | Catálogo mundial de filmes, séries, animes e dados de streaming | Pool de chaves e busca online em tempo real |
| **Steam Community / Web** | Extração e sincronização de troféus e porcentagens de desbloqueio | Integrado nativamente no backend via `TrofeusController` |
| **CheapShark API** | Consulta de títulos e busca inteligente de Steam AppIDs | Requisições HTTP sem necessidade de autenticação |
| **Supabase (PostgreSQL)** | Persistência remota de reviews, perfis e sincronização de dados | Configurado via `appsettings.json` e `supabaseClient.js` |

---

## 🎨 Identidade Visual

- **Tema Principal**: Dark Theme Futurista / Cyberpunk (`#07090f`).
- **Cores de Destaque**:
  - Ciano Neon: `#00f0ff`
  - Roxo Neon: `#9d4edd`
  - Ouro/Platina: `#ffd700` / `#00e5ff`
- **Efeitos**: Backdrop Blur (*Glassmorphism*), bordas translúcidas sutis e micro-interações animadas em hover.

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Se você deseja colaborar com melhorias, novos recursos ou correções:

1. Faça um **Fork** do repositório.
2. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/minha-nova-funcionalidade
   ```
3. Faça o commit das suas alterações:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade incrível"
   ```
4. Envie sua branch para o repositório remoto:
   ```bash
   git push origin feature/minha-nova-funcionalidade
   ```
5. Abra um **Pull Request** detalhando as modificações realizadas.

---

## 📄 Licença

Este projeto é desenvolvido para fins de entretenimento, portfólio e aprendizado na comunidade gamer & geek. Consulte os arquivos do projeto para detalhes sobre termos de uso e diretrizes.

<div align="center">
  <sub>Desenvolvido com 💜 e dedicação para a comunidade gamer e cinéfila.</sub>
</div>
