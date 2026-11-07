# Decisões técnicas

## Leitura de PDFs

O AEB usa `pdfjs-dist` para extrair texto de PDFs no navegador. O worker do PDF.js é importado como recurso do Vite, portanto é incluído no build estático e não depende de CDN ou de serviço externo.

O leitor só aceita PDFs com texto selecionável. Documentos digitalizados, protegidos ou corrompidos exibem uma mensagem ao usuário e não são enviados para lugar algum.

## Formato inicial suportado

Esta versão reconhece o cabeçalho de extrato Pix do Itaú e reconstrói lançamentos pela posição horizontal dos itens de texto: data, descrição e valor. O interpretador não assume que uma linha visual é uma única string retornada pelo PDF.js.

Valores são convertidos para centavos inteiros. Valores positivos são entradas e negativos são saídas. Itens com aparência de lançamento que não podem ser lidos são mostrados para revisão; possíveis duplicidades também são mantidas e identificadas.
