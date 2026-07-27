# Marta Confeitaria — o que falta para funcionar

Situação em 27/07/2026.

**A loja está no ar e o código está pronto.** Fluxo de compra completo, estoque, painel administrativo, 70 testes passando, deploy automático. O que falta é **conteúdo, configuração e uma decisão de negócio** — quase nada exige programação.

Duas partes: o que **pedir para ela** e o que **você executa**.

> Detalhe técnico de cada pendência: [`PENDENCIAS.md`](./PENDENCIAS.md).
> Modelo reutilizável para os próximos clientes: [`docs/onboarding-novo-cliente.md`](./docs/onboarding-novo-cliente.md).

---

# PARTE 1 — Pedir para a Marta

Mensagens prontas. Mande **um bloco por vez**, conforme ela responder.

## Bloco 1 — Identidade

> Oi Marta! Pra deixar a loja com a sua cara, preciso de:
>
> 1. **Sua logo** — o melhor arquivo que você tiver, de preferência PNG com fundo transparente.
> 2. **Suas cores**, se você já usa alguma fixa nas embalagens ou no Instagram.
> 3. Como quer que apareça o **nome** no site: "Marta Confeitaria" mesmo, ou outra grafia?

## Bloco 2 — Cardápio

> Agora o principal: o que vai estar à venda.
>
> Pra cada item, me manda:
>
> - **Nome** do sabor
> - **Preço**
> - Se é **fatia** ou **bolo inteiro**
> - **Uma foto** — pode ser do celular, mas de dia e com fundo limpo fica bem melhor
>
> Pode mandar em lista mesmo, tipo *"Red velvet — R$ 14 — fatia"*, e as fotos em seguida.
>
> Cadastro até 25 produtos pra você. Se tiver mais, a gente combina.

## Bloco 3 — Quantidade por dia

> Tem algum sabor que você faz **em quantidade fixa**? Tipo "só saem 12 fatias de red velvet por dia".
>
> Se tiver, me diz quais e quantos. A loja desconta sozinha a cada venda e marca como esgotado quando acaba — assim você não vende o que já saiu.
>
> Pros outros deixo sem limite, que é o normal.

## Bloco 4 — Entrega ⚠️ *o mais importante*

> Preciso entender como funciona sua entrega. É a parte que mais muda o site:
>
> 1. Você **entrega**, o cliente **retira**, ou os dois?
> 2. Se entrega: **quais bairros** você atende?
> 3. **Quanto cobra** em cada um? Pode ser um valor só, ou diferente por região.
> 4. Tem **entrega grátis** acima de algum valor? Ex: "acima de R$ 50".
> 5. Tem **pedido mínimo**?
> 6. Você **marca horário** de entrega, ou entrega quando sai?
> 7. Se tem retirada: o cliente **escolhe dia e hora**?
> 8. Pra **bolo inteiro**, quantos dias de antecedência você precisa?

## Bloco 5 — Contato e endereço

> 1. **Endereço completo** de onde você produz — rua, número, bairro, cidade.
> 2. **Horário de funcionamento**, por dia da semana.
> 3. Confirma que o WhatsApp da loja é o **(87) 99902-1574**?
> 4. **Instagram** e **Facebook** da confeitaria.

## Bloco 6 — Pontos de revenda

> Você já vende em algum **outro ponto** — padaria, mercadinho, cafeteria?
>
> Se sim, me manda **nome e endereço** de cada um. Eles aparecem num mapa no site, mostrando onde encontrar seus doces.
>
> Se ainda não tem, tudo bem — tiro essa parte por enquanto.

## Bloco 7 — Pagamento e documentos ⚠️

> Pra loja receber cartão e Pix direto no site:
>
> 1. Você já tem conta no **Mercado Pago**? Se não, é gratuito e eu te ajudo a criar.
> 2. Tem **CNPJ**? Me manda número e razão social — precisa aparecer no rodapé, é exigência pra loja online. Se for CPF, também serve.
> 3. Tem um **e-mail da confeitaria** (tipo contato@...)? É ele que envia a confirmação de cadastro pros clientes.
> 4. Quer que eu registre um **domínio** (endereço próprio do site)?

## Bloco 8 — Trocas ⚠️

> Última coisa: como você lida hoje quando um cliente **desiste ou reclama** de um pedido? Devolve, troca, refaz?
>
> Preciso escrever isso na política do site — é obrigatório em loja online.

---

## Ficha de recebimento

| Bloco | Item | Recebido |
|---|---|---|
| 1 | Logo em arquivo | ☐ |
| 1 | Cores da marca | ☐ |
| 1 | Grafia do nome | ☐ |
| 2 | Lista de produtos com preço e categoria | ☐ |
| 2 | Fotos dos produtos | ☐ |
| 3 | Sabores com quantidade fixa por dia | ☐ |
| **4** | **Entrega, retirada ou ambos** | ☐ |
| **4** | **Bairros atendidos** | ☐ |
| **4** | **Valor do frete por bairro** | ☐ |
| **4** | **Frete grátis / pedido mínimo** | ☐ |
| **4** | **Agenda horário** | ☐ |
| **4** | **Antecedência para bolo inteiro** | ☐ |
| 5 | Endereço completo | ☐ |
| 5 | Horário de funcionamento | ☐ |
| 5 | Confirmação do WhatsApp | ☐ |
| 5 | Instagram e Facebook | ☐ |
| 6 | Pontos de revenda | ☐ |
| **7** | **Conta Mercado Pago** | ☐ |
| **7** | **CNPJ/CPF e razão social** | ☐ |
| **7** | **E-mail da confeitaria** | ☐ |
| 7 | Decisão sobre domínio | ☐ |
| **8** | **Política de troca** | ☐ |

---

# PARTE 2 — O que você faz

## Agora, sem esperar ninguém

### 1. Limpar os dados de demonstração · 2 min

O banco tem **23 usuários e 85 pedidos falsos**, e o painel mostra faturamento inventado. Enquanto estiverem lá, todo número que a Marta olhar está errado.

```bash
npm run db:limpar-demo              # mostra o que sairia, não apaga nada
npm run db:limpar-demo -- --confirmar
```

Suas 2 contas reais e o catálogo não são tocados.

### 2. Testar no celular · 10 min

Corrigi três problemas de iPhone (zoom em formulário, `backdrop-filter`, altura de tela) e confirmei no CSS publicado, mas **não testei em aparelho**. Confira:

- Tocar num campo **não** deve dar zoom na página
- O botão redondo do cardápio (canto inferior direito) aparece nítido
- `/cardapio` numa tela estreita — o card de fatia é o candidato a ficar estranho

---

## Assim que ela responder

### 3. Aplicar a marca · 1–2 h · *Bloco 1*

Logo, cores e nome. Me passe os arquivos que eu aplico.

### 4. Cadastrar o catálogo · 1–2 h · *Blocos 2 e 3*

Painel → **Produtos**. Nome, preço, categoria, foto e estoque. Depois desative os 12 produtos de exemplo que vieram do seed.

### 5. E-mail transacional · 15 min · *Bloco 7*

**Hoje nenhum cliente recebe e-mail** — nem confirmação de cadastro, nem "esqueci a senha". E não dá erro: o Resend aceita e não entrega, porque o remetente cai no domínio de teste.

1. Resend → **Domains** → adicionar o domínio dela
2. Cadastrar os registros DNS onde o domínio está registrado
3. Esperar verificar
4. Vercel → **Settings → Environment Variables**:
   ```
   RESEND_FROM_EMAIL = Marta Confeitaria <contato@dominiodela.com.br>
   ```
5. Novo deploy e **testar criando conta com um Gmail** para confirmar que chega

> O painel administrativo avisa em destaque enquanto isso não estiver resolvido.

### 6. Domínio próprio · 30 min + propagação · *Bloco 7*

1. Registrar no Registro.br (para `.com.br`)
2. Vercel → **Settings → Domains** → adicionar e seguir o DNS
3. Criar a variável:
   ```
   NEXT_PUBLIC_SITE_URL = https://dominiodela.com.br
   ```

Não precisa mexer em código — já está centralizado em `lib/site.ts`.

### 7. Endereço e pontos de venda · 20 min · *Blocos 5 e 6*

Hoje há dados fictícios em lugares que o Google indexa:

| Onde | O que está lá |
|---|---|
| Mapa e página de contato | "Rua das Framboesas, 122 — Centro, Salgueiro - PE" |
| Pontos de venda | "Padaria Bela Vista" e "Empório Vila Doce" |
| Dados estruturados (`app/layout.tsx`) | Mesmo endereço fictício |
| Horário (`app/contato/page.tsx`) | Terça a sábado 9h–18h, domingo 9h–13h |

Endereço e pontos você resolve pelo painel. Se não houver revendedores ainda, **remova os dois pontos fictícios**.

O endereço em `app/layout.tsx` e o horário em `app/contato/page.tsx` são código — **me passe os dados que eu troco**.

### 8. Redes sociais · 5 min · *Bloco 5*

`components/layout/Footer.tsx`, linhas 11–12: `FACEBOOK_URL` e `INSTAGRAM_URL` estão vazios e os ícones não levam a lugar nenhum. **Me passe os links que eu preencho.** Se ela não tiver Facebook, removo o ícone.

---

## Depois da entrega definida

### 9. Me passar as regras de entrega ⚠️ *Bloco 4*

**É o único bloqueador que ainda exige programação.** Com as respostas eu construo: tabela de bairros no banco, cadastro no painel (pra ela mudar o frete sozinha), seletor de bairro no carrinho somando ao total, endereço gravado no pedido e exibido no painel.

Hoje o pedido **não tem endereço nenhum** — nem campo no banco. Só não quebrou ainda porque tudo cai no WhatsApp.

### 10. Ativar o pagamento · 30 min · *só depois do item 9*

1. Access Token de produção no painel de desenvolvedores do Mercado Pago dela
2. Colar em **Painel → Pagamentos** (não precisa deploy)
3. No Mercado Pago, cadastrar webhook do evento `payment` para:
   ```
   https://DOMINIO/api/checkout/webhook
   ```
4. Colar a chave secreta do webhook no mesmo lugar do painel
5. **Fazer uma compra real de valor baixo** e conferir se marca como pago sozinho

> Sem a chave secreta o webhook rejeita as notificações — é ela que prova que a notificação veio do Mercado Pago, e não de alguém forjando "pedido pago".
>
> Esse fluxo **nunca foi testado de ponta a ponta**. Nenhum centavo passou pelo sistema.

**Não ative antes do item 9.** Pedido pago sem endereço é pior que pedido pelo WhatsApp.

### 11. Textos legais · 1 h · *Blocos 7 e 8*

Com CNPJ, razão social e a política de troca dela, **me passe que eu escrevo** as páginas de termos e privacidade, mais a identificação do vendedor no rodapé.

Não escrevi antes porque inventar cláusula legal é pior que não ter. Vale uma conferida de contador depois.

### 12. Treinamento · 1–2 h

Faz parte do que você vendeu. Passe tela por tela: cadastrar produto, mudar preço, acompanhar pedido, controlar estoque.

---

## Quando sobrar tempo

### 13. Banco de desenvolvimento separado

Sua máquina escreve direto no banco de produção — todo `migrate dev` local altera o schema em produção. Passo a passo no `README.md`, seção *Separando um banco de desenvolvimento*.

Não é urgente, mas fica mais arriscado conforme entrar dado real.

---

# Antes de considerar entregue

- [ ] `npm run db:limpar-demo -- --confirmar` executado
- [ ] Nenhum produto, endereço ou ponto de venda fictício no ar
- [ ] Painel administrativo sem avisos de configuração pendente
- [ ] E-mail de confirmação testado com um Gmail
- [ ] Uma compra de teste concluída de ponta a ponta
- [ ] Loja aberta no celular, conferindo formulário e botões
- [ ] Conta de administrador da Marta com senha que só ela saiba
- [ ] Treinamento feito

---

# Mapa de dependência

| Você precisa de | Para poder |
|---|---|
| Nada | Limpar o banco, testar no celular |
| Bloco 1 | Aplicar a marca |
| Blocos 2 e 3 | Cadastrar o catálogo real |
| Blocos 5 e 6 | Tirar os dados fictícios do ar |
| Bloco 7 (e-mail) | Fazer o e-mail chegar aos clientes |
| Bloco 7 (domínio) | Endereço próprio |
| **Bloco 4** | **Eu programar a entrega** |
| Bloco 4 + 7 | **Ativar o pagamento** |
| Blocos 7 e 8 | Escrever as páginas legais |

---

# O que já está pronto

Não precisa mais de você nem dela:

- Fluxo de compra completo, com contato do visitante e proteção contra pedido duplicado
- Estoque com desconto atômico, devolução no cancelamento e aviso de "últimas unidades"
- Erro de checkout nunca esvazia o carrinho
- Nenhum catálogo inventado em lugar nenhum
- Carrinho identificado por id — renomear produto não quebra mais nada
- Carrinho acessível por teclado, site inteiro navegável sem mouse
- Busca no cardápio
- Painel avisa quando e-mail ou pagamento estão mal configurados
- Script de limpeza do banco, com simulação
- **70 testes automatizados**, `build` e `tsc` limpos
- Migrations aplicadas automaticamente no deploy
- Documentos de venda em `docs/`
