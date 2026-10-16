# Saguiar Premoldados — site institucional

Site estático (HTML, CSS e JavaScript puros, sem build). Funciona abrindo o
`index.html` direto no navegador e publica em Vercel ou GitHub Pages sem configuração.

## Estrutura

```
index.html              Conteúdo e SEO (todo o texto vive aqui)
404.html                Página de erro
vercel.json             Cabeçalhos de segurança e cache (Vercel)
robots.txt              Regras para buscadores
site.webmanifest        Ícones e cores do site
assets/
  css/styles.css        Estilos (tokens, componentes, seções, responsivo)
  js/boot.js            Marca que o JS está ativo (roda antes da pintura)
  js/config.js          Telefone (WhatsApp) e Instagram
  js/main.js            Menu, filtros, carrossel, contadores e formulário
  img/                  Favicon, ícones e imagem de compartilhamento
  img/produtos/         Fotos reais dos produtos (veja LEIAME.txt)
```

## Publicar na Vercel

1. Em vercel.com, **Add New → Project** e importe o repositório `saguiar-premoldados`.
2. Framework Preset: **Other**. Deixe Build Command e Output Directory em branco.
3. **Deploy**.
4. Para usar o domínio próprio: **Settings → Domains → Add** e siga as instruções de DNS.

## Depois de definir o domínio

Peça para atualizar no `index.html`: `<link rel="canonical">`, `og:url` e `og:image`
com endereço completo, e criar o `sitemap.xml`. Isso melhora o Google e a prévia no WhatsApp.

## Como editar

- **Telefone e Instagram:** `assets/js/config.js` e os links `wa.me` e `instagram.com` no `index.html`.
- **Textos, produtos e avaliações:** direto no `index.html`.
- **Fotos dos produtos:** ficam em `assets/img/produtos/` (JPG 960x720, fundo branco). Para trocar uma
  foto, substitua o arquivo mantendo o nome.
- **Cores e fontes:** tokens no início de `assets/css/styles.css`.

## Rodar localmente

```bash
python -m http.server 8000
```

Abra http://localhost:8000.
