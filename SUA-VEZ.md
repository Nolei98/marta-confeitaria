# O que só você pode fazer

Tudo que dependia apenas de código está feito. O que sobrou depende de **conta, senha, dinheiro ou de uma decisão da cliente** — coisas que eu não posso resolver sozinho.

Ordenado por impacto. Os três primeiros destravam a loja para vender de verdade.

---

## 1. Limpar os dados de demonstração — 2 minutos

O banco de produção tem **23 usuários e 85 pedidos falsos**, e o painel mostra faturamento inventado.

Já deixei o script pronto. Ele **não apaga nada** sem confirmação — primeiro mostra tudo:

```bash
npm run db:limpar-demo
```

Confira a lista. As duas contas reais (a sua e a da Marta) aparecem como preservadas, e o catálogo de produtos não é tocado. Quando estiver certo:

```bash
npm run db:limpar-demo -- --confirmar
```

> Não fiz isso por você porque apaga dados de produção sem volta.

---

## 2. Fazer o e-mail chegar — 15 minutos

**Hoje nenhum cliente recebe e-mail de confirmação nem de "esqueci minha senha".** E não aparece erro nenhum: o Resend aceita o envio e simplesmente não entrega.

O motivo é que `RESEND_FROM_EMAIL` não existe, então o remetente cai no domínio de teste `onboarding@resend.dev`, que só entrega para o dono da conta Resend.

1. No painel do Resend, em **Domains**, adicione o domínio de e-mail da Marta.
2. Cadastre os registros DNS que ele pedir (onde o domínio está registrado).
3. Espere verificar.
4. Na Vercel, em **Settings → Environment Variables**, crie:

   ```
   RESEND_FROM_EMAIL = Marta Confeitaria <contato@seudominio.com.br>
   ```

5. Faça um novo deploy e **teste criando uma conta com um e-mail externo** (Gmail, por exemplo) para confirmar que chega.

> O painel administrativo agora avisa em destaque enquanto isso não estiver resolvido.

---

## 3. Decidir as regras de entrega — conversa com a cliente

**Este é o único bloqueador que ainda exige programação**, e não posso começar sem as respostas. Você escolheu frete variável por bairro, então preciso saber:

- **Quais bairros ela atende?** Lista completa.
- **Quanto custa cada um?** Valor por bairro, ou faixas (ex.: centro R$ 5, demais R$ 10).
- **Tem frete grátis** acima de algum valor de pedido?
- **Tem pedido mínimo?**
- **Ela agenda horário** de entrega ou entrega quando sai?
- **Também tem retirada no local?** Se sim, com data e hora marcadas?

Com isso eu faço: tabela de bairros no banco, cadastro no painel (para ela mudar o frete sozinha), seletor de bairro no carrinho com o frete somando ao total, endereço gravado no pedido e exibido no painel.

> **Enquanto isso não existir, não ative o pagamento pelo site (item 4).** Pedido pago sem endereço é pior que pedido pelo WhatsApp.

---

## 4. Ativar o pagamento no site — 30 minutos

Depende do item 3 estar resolvido.

1. Marta cria (ou usa) uma conta no **Mercado Pago**.
2. No painel de desenvolvedores dela, copie o **Access Token de produção**.
3. Cole em **Painel administrativo → Pagamentos**. Não precisa de deploy.
4. Ainda no Mercado Pago, cadastre um **webhook** do evento `payment` apontando para:

   ```
   https://SEU-DOMINIO/api/checkout/webhook
   ```

5. Copie a **chave secreta** do webhook e cole no mesmo lugar do painel.

> Sem a chave secreta, o webhook rejeita as notificações — é ela que prova que a notificação veio mesmo do Mercado Pago, e não de alguém forjando "pedido pago".

Depois de configurar, **faça uma compra de verdade de valor baixo** e confira se o pedido é marcado como pago sozinho. Esse fluxo nunca foi testado de ponta a ponta — nenhum centavo passou pelo sistema ainda.

---

## 5. Catálogo real da Marta

Os 12 produtos no banco vieram do seed de exemplo, com fotos genéricas.

Precisa dela: **sabores, preços, categorias e fotos**. Você cadastra pelo painel (aba Produtos) e desativa os de exemplo.

Aproveite para definir quais produtos terão **estoque controlado**. Deixar em branco = venda ilimitada, que é o certo para a maioria. Preencher só faz sentido quando ela assa uma quantidade fixa por dia.

---

## 6. Endereço e pontos de venda reais

Hoje aparecem dados fictícios em lugares que o Google indexa:

| Onde | O que está lá agora |
|---|---|
| Mapa e página de contato | "Rua das Framboesas, 122 — Centro, Salgueiro - PE" |
| Pontos de venda | "Padaria Bela Vista" e "Empório Vila Doce" |
| Dados estruturados (`app/layout.tsx`) | Mesmo endereço fictício |
| Horário de funcionamento (`app/contato/page.tsx`) | Terça a sábado 9h–18h, domingo 9h–13h |

O endereço e os pontos você resolve pelo painel. O endereço em `app/layout.tsx` e o horário em `app/contato/page.tsx` são código — me passe os dados corretos que eu troco.

Se ainda não houver revendedores, o melhor é **remover os dois pontos fictícios** em vez de deixá-los no mapa.

---

## 7. Domínio próprio

A loja está em `marta-confeitaria.vercel.app`.

1. Registre o domínio (Registro.br para `.com.br`).
2. Na Vercel, **Settings → Domains**, adicione e siga as instruções de DNS.
3. Crie a variável de ambiente:

   ```
   NEXT_PUBLIC_SITE_URL = https://seudominio.com.br
   ```

Já deixei o endereço centralizado em `lib/site.ts`, então **não precisa mexer em código** — só na variável.

---

## 8. Redes sociais

`components/layout/Footer.tsx`, linhas 11 e 12: `FACEBOOK_URL` e `INSTAGRAM_URL` estão vazios e os ícones não levam a lugar nenhum.

Me passe os perfis reais que eu preencho. Se ela não tiver Facebook, eu removo o ícone em vez de deixá-lo morto.

---

## 9. Obrigações legais

Vale confirmar com contador ou advogado o que se aplica ao caso dela:

- **Identificação do vendedor** — CNPJ (ou CPF), razão social e endereço, normalmente no rodapé.
- **Política de troca e devolução** — o Código de Defesa do Consumidor dá 7 dias de arrependimento em compra online; alimento perecível tem particularidades, mas a política precisa estar escrita.
- **Prazo de entrega** informado antes da compra.
- **Revisar `/termos` e `/privacidade`** — as duas páginas existem, mas foram escritas como texto de partida e precisam refletir o que a operação realmente faz e coleta.

Não escrevi esses textos porque inventar cláusula legal é pior que não ter.

---

## 10. Banco de desenvolvimento separado

Hoje sua máquina escreve direto no banco de produção. Todo `migrate dev` local é alteração de schema em produção.

O Neon resolve com branches (cópia instantânea, sem custo extra no plano atual). O passo a passo está no `README.md`, seção **Separando um banco de desenvolvimento**.

Não é urgente, mas fica mais arriscado conforme a loja tiver dados reais.

---

## 11. Testar no celular de verdade

Corrigi três problemas de iPhone — zoom automático nos formulários, `backdrop-filter` sem prefixo e altura de tela — e confirmei no CSS publicado. Mas **não testei em aparelho nenhum**.

Vale abrir no seu celular e conferir:

- Tocar num campo de formulário **não** deve dar zoom na página.
- O botão redondo do cardápio (canto inferior direito) deve aparecer nítido.
- `/cardapio` a 320px de largura (iPhone SE) — o card de fatia tem imagem em pixels fixos e é o candidato mais provável a ficar estranho.

---

## O que já está pronto

Para referência, o que **não** precisa mais de você:

- Fluxo de compra completo, com contato do visitante e proteção contra pedido duplicado
- Estoque com desconto atômico, devolução no cancelamento e aviso de "últimas unidades"
- Erro de checkout nunca esvazia o carrinho
- Nenhum catálogo inventado em lugar nenhum (cardápio e home)
- Carrinho identificado por id — renomear produto não quebra mais nada
- Carrinho acessível por teclado, e o site inteiro navegável sem mouse
- Busca no cardápio
- Painel avisa quando e-mail ou pagamento estão mal configurados
- Script de limpeza do banco, com simulação
- **70 testes automatizados**, `build` e `tsc` limpos
- Migrations aplicadas automaticamente no deploy
- Documentos de venda em `docs/`

O detalhamento técnico de cada pendência está em [`PENDENCIAS.md`](./PENDENCIAS.md).
