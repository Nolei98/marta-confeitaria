# Coleta de informações

Duas listas separadas: o que **pedir para a cliente** e o que **você faz**.

---

# PARTE A — Pedir para a cliente

## Mensagem pronta para enviar

Copie daqui para baixo e mande no WhatsApp. Está dividida em blocos para ela responder aos poucos, sem se assustar com o tamanho.

---

**Bloco 1 — Identidade da loja**

> Oi! Pra deixar sua loja com a sua cara, preciso de:
>
> 1. **Sua logo** — no melhor arquivo que você tiver (de preferência PNG com fundo transparente).
> 2. **Suas cores**, se você já usa alguma fixa nas embalagens ou no Instagram.
> 3. Como você quer que apareça o **nome da loja** no site (exatamente com a grafia que preferir).

**Bloco 2 — Cardápio**

> Agora o principal: o que vai estar à venda.
>
> Pra cada item, me manda:
>
> - **Nome** do sabor/produto
> - **Preço**
> - Se é **fatia** ou **bolo inteiro**
> - **Uma foto** (pode ser do celular mesmo, mas de dia e com fundo limpo fica bem melhor)
>
> Pode mandar em lista mesmo, tipo:
> *"Red velvet — R$ 14 — fatia"* e a foto em seguida.
>
> Eu cadastro até 25 produtos pra você. Se tiver mais, também dá — a gente combina.

**Bloco 3 — Estoque**

> Tem algum produto que você faz **em quantidade fixa por dia**? Tipo "só saem 12 fatias de red velvet".
>
> Se tiver, me diz quais e quantos. A loja desconta sozinha a cada venda e marca como esgotado quando acaba — assim você não vende o que não tem.
>
> Pros outros, deixo sem limite, que é o normal.

**Bloco 4 — Entrega** ← *o mais importante, sem isso a loja não cobra pelo site*

> Preciso entender como funciona sua entrega:
>
> 1. Você **entrega** ou o cliente **retira** com você? Ou os dois?
> 2. Se entrega: **quais bairros** você atende?
> 3. **Quanto cobra de entrega** em cada bairro? (pode ser um valor pra todos, ou diferente por região)
> 4. Tem **entrega grátis** acima de algum valor? Ex: "acima de R$ 50 é grátis"
> 5. Tem **pedido mínimo**?
> 6. Você **marca horário** de entrega, ou entrega quando sai?
> 7. Se tem retirada: o cliente **escolhe dia e hora**?

**Bloco 5 — Contato e endereço**

> 1. **Endereço completo** de onde você produz/atende (rua, número, bairro, cidade).
> 2. **Horário de funcionamento** — quais dias e horas.
> 3. Confirma que o **WhatsApp da loja** é o **(87) 99902-1574**?
> 4. **Instagram** e **Facebook** da confeitaria (link ou @).

**Bloco 6 — Revenda**

> Você já vende em algum **outro ponto** — padaria, mercadinho, cafeteria?
>
> Se sim, me manda **nome e endereço** de cada um. Eles aparecem num mapa no site, mostrando onde encontrar seus doces.
>
> Se ainda não tem, tudo bem — a gente tira essa parte por enquanto.

**Bloco 7 — Pagamento e documentos**

> Pra loja receber pagamento por cartão e Pix direto no site:
>
> 1. Você já tem conta no **Mercado Pago**? Se não, é gratuito e eu te ajudo a criar.
> 2. Você tem **CNPJ**? Se sim, me manda o número e a razão social — precisa aparecer no rodapé do site, é exigência pra loja online. Se for CPF, também serve.
> 3. Tem um **e-mail da confeitaria** (tipo contato@...)? Se não tiver, a gente resolve.

**Bloco 8 — Trocas**

> Última coisa: como você lida hoje quando um cliente **desiste ou reclama** de um pedido? Devolve o dinheiro, troca, refaz?
>
> Preciso escrever isso na política do site — é obrigatório em loja online.

---

## Checklist de recebimento

Vá marcando conforme ela responde:

- [ ] Logo em arquivo
- [ ] Cores da marca
- [ ] Grafia do nome da loja
- [ ] Lista de produtos (nome, preço, categoria)
- [ ] Fotos dos produtos
- [ ] Quais produtos têm quantidade fixa por dia
- [ ] Entrega, retirada ou os dois
- [ ] Lista de bairros atendidos
- [ ] Valor do frete por bairro/região
- [ ] Frete grátis acima de quanto
- [ ] Pedido mínimo
- [ ] Agenda horário de entrega
- [ ] Endereço completo
- [ ] Horário de funcionamento
- [ ] Confirmação do WhatsApp
- [ ] Instagram e Facebook
- [ ] Pontos de revenda (nome e endereço)
- [ ] Tem conta no Mercado Pago
- [ ] CNPJ ou CPF + razão social
- [ ] E-mail da confeitaria
- [ ] Como lida com troca/devolução

---

# PARTE B — O que você faz

## Agora, sem esperar ninguém

**1. Limpar os dados de demonstração** · 2 min

```bash
npm run db:limpar-demo              # mostra o que sairia, não apaga
npm run db:limpar-demo -- --confirmar
```

Tira 23 usuários e 85 pedidos falsos. Suas 2 contas reais e o catálogo ficam.

**2. Testar no celular** · 10 min

Abra a loja no seu iPhone/Android e confira:

- Tocar num campo de formulário **não** deve dar zoom
- O botão redondo do cardápio (canto inferior direito) aparece nítido
- `/cardapio` numa tela estreita — o card de fatia é o candidato a ficar estranho

---

## Assim que ela mandar os dados

**3. E-mail transacional** · 15 min · *precisa do domínio dela (Bloco 7)*

1. Resend → **Domains** → adicionar o domínio
2. Cadastrar os registros DNS onde o domínio está registrado
3. Esperar verificar
4. Vercel → **Settings → Environment Variables**:
   ```
   RESEND_FROM_EMAIL = Marta Confeitaria <contato@dominiodela.com.br>
   ```
5. Novo deploy e **testar criando conta com um Gmail** pra confirmar que chega

**4. Domínio próprio** · 30 min + propagação

1. Registrar (Registro.br para `.com.br`)
2. Vercel → **Settings → Domains** → adicionar e seguir o DNS
3. Criar a variável:
   ```
   NEXT_PUBLIC_SITE_URL = https://dominiodela.com.br
   ```

Não precisa mexer em código — já está centralizado em `lib/site.ts`.

**5. Cadastrar o catálogo** · 1–2 h · *precisa dos Blocos 2 e 3*

Painel → **Produtos**. Nome, preço, categoria, foto e estoque. Desativar os produtos de exemplo.

**6. Endereço e pontos de venda** · 20 min · *precisa dos Blocos 5 e 6*

Painel → **Pontos de venda**. Remover "Padaria Bela Vista" e "Empório Vila Doce" se forem fictícios.

O endereço em `app/layout.tsx` e o horário em `app/contato/page.tsx` são código — **me passe que eu troco**.

**7. Redes sociais** · *precisa do Bloco 5*

`components/layout/Footer.tsx` linhas 11–12 estão vazias. **Me passe os links que eu preencho.**

---

## Depois que a entrega estiver definida

**8. Me passar as regras de entrega** ← *destrava o resto*

Com as respostas do Bloco 4, eu construo: tabela de bairros no banco, cadastro no painel (pra ela mudar o frete sozinha), seletor de bairro no carrinho somando ao total, endereço no pedido e no painel.

**9. Ativar o pagamento** · 30 min · *só depois do item 8*

1. Access Token de produção no painel de desenvolvedores do Mercado Pago dela
2. Colar em **Painel → Pagamentos** (não precisa deploy)
3. Cadastrar webhook do evento `payment` para `https://DOMINIO/api/checkout/webhook`
4. Colar a chave secreta do webhook no mesmo lugar
5. **Fazer uma compra real de valor baixo** e conferir se marca como pago sozinho

> Nunca foi testado de ponta a ponta. Nenhum centavo passou pelo sistema.

**10. Textos legais** · *precisa dos Blocos 7 e 8*

Com CNPJ, razão social e a política de troca dela, **me passe que eu escrevo** as páginas de termos e privacidade. Vale uma conferida de contador depois.

---

## Quando sobrar tempo

**11. Banco de desenvolvimento separado**

Hoje sua máquina escreve direto no banco de produção. Passo a passo no `README.md`, seção *Separando um banco de desenvolvimento*. Não é urgente, mas fica mais arriscado conforme entrar dado real.

---

## Resumo da dependência

| Você precisa de | Para poder |
|---|---|
| Nada | Limpar o banco, testar no celular |
| Domínio de e-mail dela | Fazer o e-mail chegar aos clientes |
| Produtos e fotos | Cadastrar o catálogo real |
| Endereço e horário | Tirar os dados fictícios do ar |
| **Regras de entrega** | **Eu programar a entrega — e só então ativar o pagamento** |
| CNPJ e política de troca | Escrever as páginas legais |
