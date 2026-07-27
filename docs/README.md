# Documentos

Materiais de apresentação e documentação, em PDF e no HTML que os gerou.

| Arquivo | Páginas | Para quem |
|---|---|---|
| `portfolio-loja.pdf` | 4 | **Cliente em potencial.** Versão curta, para convencer numa leitura. É o principal. |
| `apresentacao-plataforma.pdf` | 22 | Cliente que quer se aprofundar antes de decidir. |
| `plataforma-documentacao.pdf` | 31 | Documentação técnica e funcional da plataforma. |

Os três são para leigo, exceto o último.

## Como regenerar

Cada `.pdf` vem do `.html` de mesmo nome. Os HTML são **autocontidos** — as imagens estão embutidas como data URI, então não dependem de pasta de imagens.

Para editar: mexa no `.html` e gere o PDF de novo com o Chrome:

```bash
chrome --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=90000 \
  --print-to-pdf=docs/portfolio-loja.pdf \
  file:///caminho/completo/docs/portfolio-loja.html
```

No Windows, o executável costuma ficar em
`C:\Program Files\Google\Chrome\Application\chrome.exe`.

As quebras de página, margens A4 e a regra de não cortar figura no meio já estão no CSS de impressão de cada arquivo.

## Cuidados ao editar

- **A logo do negócio foi substituída** por um marcador escrito `logo` em todas as capturas, de propósito.
- **E-mails do painel de usuários estão mascarados** nas capturas.
- **Os números do painel são de demonstração** (faturamento, pedidos, clientes) e estão rotulados como tal no texto. Não apresentar como resultado real de ninguém.
- **Nenhuma porcentagem de taxa** — de aplicativo de entrega ou de meio de pagamento — é citada, porque não foram confirmadas. O texto explica a estrutura de custo e convida a cliente a fazer a conta com os números dela.

## Nota sobre o tamanho

Os HTML carregam as imagens embutidas, então cada arquivo tem alguns megabytes. Gerar uma versão nova cria um blob novo no histórico do git. Se isso for incomodar com o tempo, vale passar a versionar só os HTML e gerar os PDF sob demanda.
