# AEB — Analisador de Extrato Bancário

Aplicação web estática para analisar lançamentos de extratos bancários em PDF. O AEB identifica entradas e saídas em um período escolhido e apresenta os lançamentos considerados no cálculo.

Nesta versão, são aceitos os formatos de extrato **Pix** e **conta corrente do Itaú** que contenham texto selecionável.

## Funcionalidades

- Envio de extrato em PDF.
- Leitura do documento diretamente no navegador.
- Seleção de data inicial e final, com inclusão das duas datas no resultado.
- Cálculo separado de entradas e saídas.
- Exibição dos lançamentos que compõem os totais.
- Formatação de datas e valores no padrão brasileiro.
- Avisos para linhas que não puderam ser interpretadas e para possíveis lançamentos duplicados.
- Validação de datas e de valores monetários.

## Privacidade

O processamento acontece inteiramente no navegador. O PDF e os dados extraídos não são enviados a servidores externos nem armazenados de forma persistente.

O PDF.js e seu *worker* são incluídos no pacote gerado pelo projeto; não há carregamento de recursos de CDN.

## Limitações atuais

- Há suporte apenas aos layouts compatíveis de extrato Pix e conta corrente do Itaú.
- PDFs digitalizados, protegidos por senha, corrompidos ou sem texto selecionável não são suportados.
- Possíveis duplicidades são sinalizadas e mantidas para conferência; o AEB não as remove automaticamente.
- Linhas que não podem ser interpretadas geram um aviso, portanto os totais podem estar incompletos e devem ser revisados.

## Tecnologias

- [Vite](https://vite.dev/)
- TypeScript
- HTML e CSS
- [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/)

## Como executar localmente

Pré-requisito: Node.js instalado.

```bash
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir a aplicação no navegador.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Executa a checagem de tipos e gera a versão estática de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão gerada em `dist/`. |
| `npm test` | Compila e executa os testes automatizados. |

## Testes

Os testes usam apenas dados sintéticos e cobrem, entre outros casos:

- conversão e validação de datas brasileiras;
- limites inclusivos do período selecionado;
- conversão de valores em reais para centavos inteiros;
- valores monetários malformados;
- interpretação dos formatos Pix e conta corrente do Itaú;
- identificação de possíveis duplicidades e de linhas não interpretadas.

Execute-os com:

```bash
npm test
```

## Estrutura do projeto

```text
src/
├── components/  # Interface e lógica de apresentação
├── services/    # Leitura de PDF, interpretação e cálculos
├── styles/      # Estilos da aplicação
├── types/       # Tipos compartilhados
└── main.ts      # Inicialização da aplicação
tests/           # Testes automatizados com dados sintéticos
docs/            # Decisões técnicas e registros de implementação
public/          # Arquivos públicos estáticos
```

## Desenvolvimento

Valores são tratados internamente como centavos inteiros, evitando imprecisões de ponto flutuante. Datas são tratadas como datas de calendário, sem conversão de fuso horário.

Para detalhes sobre a extração de PDFs e o formato inicial suportado, consulte [as decisões técnicas](docs/decisoes-tecnicas.md).
