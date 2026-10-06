# Terreiro do Vovô — landing page demonstrativa

Projeto de portfólio de uma landing page responsiva para apresentar almoço self-service, delivery de marmitas e serviços para eventos em Piranga-MG.

A interface é uma demonstração: não recebe pedidos, pagamentos, reservas ou orçamentos e não possui integração operacional com WhatsApp.

## Tecnologias

- HTML5 semântico
- CSS responsivo
- JavaScript puro
- Google Analytics opcional, após consentimento

Não há processo de build, gerenciador de pacotes, backend ou banco de dados.

## Estrutura

```text
Terreiro/
├── imagens/                  # Logo e ilustrações SVG
├── index.html                # Landing page
├── style.css                 # Layout, componentes e responsividade
├── script.js                 # Abas, galeria, modal, consentimento e medição
├── politica_privacidade.html # Comportamento de dados implementado
├── termos_uso.html           # Limites do projeto demonstrativo
└── README.md
```

## Execução local

Como o projeto é estático, os arquivos podem ser servidos por qualquer servidor HTTP local.

Com Node.js e `npx` disponíveis:

```bash
npx serve .
```

Com a extensão Live Server do editor, abra `index.html` usando a opção de servidor local.

Abrir o arquivo diretamente no navegador permite testar a maior parte da interface, mas um servidor HTTP representa melhor o comportamento de hospedagem e de recursos externos.

## Conteúdo e ordem comercial

A página segue esta prioridade:

1. Almoço self-service
2. Delivery
3. Eventos
4. Localização e horários gerais

Os principais pontos de atualização ficam em `index.html`:

- preços e modalidades do almoço;
- tamanhos e preços das marmitas;
- horários e cobertura do delivery;
- capacidades, inclusões e modalidades de eventos;
- endereço e aviso de acesso por escadas.

A seção de eventos usa um modelo híbrido de planos para comparar locação do salão, buffet com reposição e entrega de refeições. Mesas, cadeiras, caixas de som, pula-pula, escorrega, montagem dos brinquedos e limpeza posterior são inclusões confirmadas da locação. A capacidade conjunta de até 160 pessoas depende da contratação dos dois espaços.

Não replique automaticamente regras do self-service nas marmitas. Antes de publicar alterações, confirme cada preço, horário, capacidade e condição de serviço com a fonte responsável.

## Imagens

As dez ilustrações exibidas na página são SVGs vetoriais locais, com paleta coordenada, gradientes, padrões leves e componentes reutilizados por `defs`/`use`. Não usam imagens raster embutidas, scripts, animações internas ou dependências externas. Cada arquivo fica abaixo de 20 KB, sem compressão HTTP.

As cenas de refeições e eventos são conceituais: não representam o cardápio, a estrutura ou a decoração real dos espaços. Os textos alternativos e as legendas deixam sua natureza ilustrativa explícita. O hero usa proporção 800 × 640; as demais imagens preservam as dimensões declaradas no HTML para evitar mudanças de layout.

Ao receber fotografias reais com autorização de uso:

1. gere versões otimizadas nos tamanhos necessários;
2. preserve `width` e `height` ou `aspect-ratio` para evitar mudanças de layout;
3. mantenha carregamento imediato somente para recursos da área inicial;
4. use `loading="lazy"` nas imagens fora da primeira área visível;
5. escreva textos alternativos que descrevam o conteúdo real, sem linguagem promocional desnecessária.

A imagem Open Graph permanece relativa porque o endereço definitivo de hospedagem não está definido. Configure uma URL absoluta somente depois de conhecer o domínio de produção.

## Interações e acessibilidade

- A navegação interna usa âncoras com compensação para o cabeçalho fixo; o link da seção atual recebe `aria-current="location"`.
- Cabeçalho, botões e cartões usam transições CSS discretas. Efeitos de elevação ficam restritos a dispositivos com mouse.
- Elementos com `data-reveal` entram uma única vez ao aparecer na tela, usando `IntersectionObserver`; `data-reveal-delay="1"` ou `"2"` escalona os cartões no desktop. O conteúdo é visível por padrão, inclusive sem JavaScript ou sem suporte ao observador.
- As abas aceitam clique, `ArrowLeft`, `ArrowRight`, `Home` e `End`.
- A galeria de eventos é manual, aceita setas do teclado quando focada e gestos de arraste (touch swipe) em dispositivos móveis.
- Abas, galeria e modal têm transições próprias, sem reprodução automática ou rolagem controlada por JavaScript.
- O modal recebe o foco ao abrir, contém a navegação por `Tab`, fecha com `Escape` e devolve o foco ao botão de origem após a animação de saída.
- O conteúdo de fundo fica inerte enquanto o modal está aberto.
- A interface respeita `prefers-reduced-motion`, inclusive quando a preferência é alterada durante a visita: sem animações, deslocamentos de hover ou rolagem suave.
- Elementos interativos têm foco visível e áreas de toque adequadas.

Os tempos e a curva de movimento ficam em `--duracao-curta`, `--duracao-media` e `--curva`, no início de `style.css`. Não há biblioteca de animação, novo pacote ou etapa de build. A imagem principal e o título não aguardam animações para aparecer.

Faça também testes manuais com teclado, zoom de 200%, leitores de tela, celulares estreitos e diferentes níveis de contraste. Pontuações automáticas ajudam a encontrar problemas, mas não substituem essa validação.

## Consentimento e Analytics

O identificador do Google Analytics está definido em `script.js`:

```js
var GA_ID = "G-5WRWWNTSXB";
```

Substitua-o antes de reutilizar o projeto em outra propriedade. O script do Analytics só é carregado após aceite. A preferência é armazenada no `localStorage` com a chave `terreiro.analytics.consent`.

O rodapé oferece “Preferências de cookies” para revisar a decisão. A recusa ou revogação:

- mantém todos os recursos essenciais funcionando;
- desabilita coletas futuras para a propriedade configurada;
- atualiza o estado de consentimento;
- tenta remover cookies analíticos acessíveis no domínio atual.

Eventos disponíveis após consentimento:

| Evento | Parâmetros principais | Uso |
| --- | --- | --- |
| `view_service` | `service_name` | Visualização de almoço, delivery ou eventos |
| `select_lunch_day` | `lunch_day` | Troca do período do almoço |
| `click_demo_cta` | `service_name`, `service_option`, `cta_position` | Clique em CTA demonstrativo |
| `open_portfolio_modal` | `service_name`, `service_option` | Abertura do aviso de portfólio |

Todos incluem `project_context: "portfolio_demo"` e não representam vendas ou leads reais. Não adicione dados pessoais aos parâmetros.

## Checklist de manutenção

- [ ] Confirmar preços e horários antes de publicar.
- [ ] Confirmar endereço, cobertura e capacidades aproximadas.
- [ ] Manter o aviso de escadas nas seções de almoço e eventos.
- [ ] Não anunciar inclusões de eventos sem confirmação.
- [ ] Atualizar política e termos ao adicionar integrações ou coleta de dados.
- [ ] Validar os IDs e controles ARIA ao alterar abas, modal ou galeria.
- [ ] Testar aceite, recusa, revogação e ausência de requisições analíticas sem consentimento.
- [ ] Verificar console, navegação por teclado, zoom e ausência de rolagem horizontal.
- [ ] Testar entrada das seções, troca de abas e abertura/fechamento repetido do modal.
- [ ] Ativar movimento reduzido antes e durante a visita; confirmar que o conteúdo permanece visível.
- [ ] Desativar JavaScript e conferir leitura do conteúdo e navegação por âncoras.
