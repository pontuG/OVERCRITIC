# 📻 Overcritic Radio - Guia de Áudio & Hospedagem Própria (Opção 1)

Este diretório gerencia as faixas de áudio reproduzidas no tocador flutuante da **Overcritic Radio**.

---

## 📂 Estrutura de Pastas

```text
assets/audio/
├── playlist.json               # Configuração das estações, faixas e links
├── README.md                   # Este guia de uso
├── synthwave/                  # Faixas da estação Cyberpunk 88.4 FM
│   └── retrofuture_clean.mp3
├── lofi/                       # Faixas da estação Chill Lo-Fi 92.1 FM
│   └── hypnothis.mp3
└── arcade/                     # Faixas da estação Arcade 104.5 FM
    └── pixelland.mp3
```

---

## 🚀 Como Funciona a Reprodução (Abordagem Híbrida 100% à Prova de Falhas)

O tocador da Overcritic Radio utiliza uma cascata inteligente de 3 camadas:
1. **Prioridade 1: Arquivo Local (`assets/audio/...`)**: Se o arquivo `.mp3` estiver presente na sua pasta local, ele toca imediatamente em 0ms sem consumir dados de internet.
2. **Prioridade 2: URL Remota / Supabase Storage (`urlRemota`)**: Caso o arquivo local não esteja presente, ele faz streaming contínuo da URL configurada com som de alta qualidade de estúdio.
3. **Prioridade 3: Sintetizador Procedural Web Audio**: Se o usuário estiver offline e o arquivo não estiver em cache, o motor Web Audio sintetiza a música em tempo real usando osciladores analógicos, garantindo que a rádio nunca falhe nem pare de tocar.

---

## ☁️ Como Hospedar suas Músicas no Supabase Storage

Você pode hospedar suas próprias músicas no Supabase do Overcritic para economizar espaço no repositório Git:

1. Acesse o painel do seu projeto no **[Supabase](https://supabase.com)**.
2. Vá em **Storage** no menu lateral esquerdo.
3. Crie um novo bucket público chamado: `radio-audio` (marque a opção **Public Bucket**).
4. Crie as pastas `synthwave`, `lofi` e `arcade` dentro do bucket.
5. Faça o upload dos seus arquivos `.mp3`.
6. Copie a URL pública gerada para cada arquivo (ex: `https://lvvihjlvyniqsmihnkof.supabase.co/storage/v1/object/public/radio-audio/synthwave/minha_faixa.mp3`).
7. Abra o arquivo `assets/audio/playlist.json` e cole a URL no campo `"urlRemota"`.

---

## 🎵 Onde Baixar Músicas Livres de Direitos Autorais (Royalty-Free)

Para adicionar mais músicas com 100% de segurança jurídica:
- **[Incompetech (Kevin MacLeod)](https://incompetech.com/)**: Músicas sob licença Creative Commons (atribuição).
- **[Pixabay Music](https://pixabay.com/music/)**: Milhares de faixas gratuitas para uso comercial e pessoal.
- **[Chosic](https://www.chosic.com/free-music/all/)**: Catálogo filtrável por gênero (Lo-Fi, Synthwave, 8-Bit Chiptune).
- **[Free Music Archive (FMA)](https://freemusicarchive.org/)**: Faixas independentes de artistas globais sob CC.
