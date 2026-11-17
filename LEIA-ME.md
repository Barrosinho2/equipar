# Equipar Som & Acessórios: site institucional

Site estático (HTML, CSS e JS puros), mobile first. Abra o `index.html` direto no navegador ou rode um servidor local (`npx serve .`) para testar. Cada push na `main` publica automaticamente na Vercel.

## Estrutura

```
index.html
css/style.css        estilos (tokens de cor e tipografia no topo)
js/main.js           interações e animações
js/vendor/           GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG) e Lenis 1.3, locais
fonts/               Anton, Barlow e Barlow Condensed (woff2, auto-hospedadas)
img/                 logo vetorizado (3 versões), fotos em WebP + JPG, favicon e imagem de compartilhamento
```

## Antes de publicar

1. **Horário de funcionamento.** Está como exemplo (seg. a sex. 8h–18h, sáb. 8h–12h). Procure `TODO` no `index.html`: aparece no topo, no contato e no rodapé.
2. **WhatsApp.** O número fica em `CONFIG.whatsapp` no `js/main.js` e nos links `wa.me/551532517000` do HTML.
3. **Domínio.** O site está em https://equipar.vercel.app. Se for usar um domínio próprio, troque esse endereço no `canonical`, no `og:url`, no `og:image` e no JSON-LD do `<head>`.
4. **Textos para validar com o cliente:** garantia no serviço, "orçamento antes de tudo", "atendemos carros de passeio, SUVs e utilitários" e a resposta sobre insulfilm e Contran.

## Formulário

Monta a mensagem (tipo de pedido, serviços, carro, descrição, nome e WhatsApp) e abre a conversa no WhatsApp da loja. O site está publicado na Vercel, então `CONFIG.netlifyForms` está `false`. Se um dia for para a Netlify, mude para `true` e os pedidos também ficam salvos em **Forms**.

Os links "Pedir orçamento" de cada serviço já marcam o serviço no formulário.

## Animações

- Abertura curta na primeira visita da sessão, depois entrada do hero.
- Faixas que aceleram e invertem com a rolagem.
- Verbete "e·qui·par" que acende palavra por palavra e hodômetro que roda até 33 anos.
- Raio-x do carro: o desenho se traça ao entrar na tela e cada serviço da lista acende sua parte do carro (som, alarme, travas, vidros, insulfilm, LED, multimídia, câmera, engate, bagageiro). Os pontos amarelos levam até cada serviço.
- Fotos reveladas como um rodo aplicando película; carrinho que percorre a estrada do "Como funciona".
- Desktop: cursor próprio, botões magnéticos e textos que trocam no hover.
- Com "reduzir movimento" ativado no sistema, as animações são desligadas. Sem JavaScript, todo o conteúdo aparece normalmente.

## Créditos e licenças

GSAP (licença padrão gratuita da GreenSock), Lenis (MIT), fontes Anton e Barlow (SIL OFL), ícones com base no Lucide (ISC). Logo e fotos são da Equipar.
