# Relatório Desafio Dev PTC — Filipe Albuquerque Santos Moreira

branch de entrega: `desafio/filipe-albuquerque-santos-moreira`

## 1. O que foi feito:

Todos os endpoints solicitados foram implementados.

- **POST /plantas**: Cadastra uma planta; todos os campos são obrigatórios => 201;
- **GET /plantas**: Lista plantas, com filtros opcionais `?luminosidade=` e `?petFriendly=`, sozinhos ou combinados;
- **GET /plantas/:id**: Busca uma planta => 200 / id inexistente 404 / id malformado 400;
- **PATCH /plantas/:id**: Edita só os campos enviados, com as mesmas regras do cadastro para o que vier;
- **DELETE /plantas/:id**: Remove uma planta => 204 sem corpo / 404 se não existir;
- **POST /plantas/:id/venda**: Recebe `{ "quantidade": 2 }` e diminui o estoque => 200 com a planta atualizada;
- **GET /plantas/estoque/valor-total**: Soma preco × estoque de todas as plantas e o total de vasos => 200 com `{ "valorTotalEmCentavos": ..., "totalDeVasos": ... }`; com a loja vazia devolve os valores zerados.

Os bônus também foram implementados:

- Busca por nome case-insensitive: `GET /plantas?nome=costela`, utilizando `contains` + `mode: "insensitive"` no Prisma;
- Ordenação: `GET /plantas?ordem=preco` ou `?ordem=nome`, sempre em ordem crescente. Valores inválidos retornam 400;
- Rota de plantas esgotadas: `GET /plantas/esgotadas`, que retorna as plantas com estoque zero no momento da consulta;
- Script de seed: `prisma/seed.ts`, executado com `yarn seed`, cadastrando 12 plantas que contemplam as três luminosidades, ambas as opções de petFriendly e uma planta com estoque zero;

## 2. Como foi feito:

Antes de escrever o código, li o CRUD de usuário para entender qual o padrão de código que era esperado, após entender o projeto, decidi que na implementação do CRUD plantas, faria algumas escolhas diferentes, decidi escrever um padrão de logs um pouco mais complexo e a cada operação, para que o debug fosse mais fácil, decidi também, que deveria separar as responsabilidades entre controller e service, mantive o controller apenas gerenciando o retorno http e as validações de inputs e o service contendo as regras de negócio da aplicação.

Decidi também, que não levantaria erros para contextos previstos na aplicação como por exemplo, não encontrar um dado com ID específico ou fluxos previstos na aplicação. Para que isso fosse possível, escolhi no repository, substituir as funções das operações pela respectiva operação + many (`deleteMany`, `updateMany`, `findUnique` e `findMany`) pois, as funções escolhidas no CRUD usuário, levantavam erros quando não era encontrado no banco o dado que estava sendo procurado, editado ou deletado.

Para isso, implementei o tipo `Result` que retornava um valor booleano de sucesso da operação e em caso `true` o dado, em caso `false` retornava o erro, para que o controller pudesse retornar o código http e o erro correto, fiz isso, pois sei que o runtime do node otimiza trechos de código que não levantam erros, sei também, que capturar o stacktrace do erro é algo custoso e quando for possível evitar, deve ser evitado. As exceções não tratadas são capturadas pelo catch do controller e retornam 500.

### Organização do Git:

Apliquei técnicas de Git Flow, para que cada etapa de desenvolvimento pudesse ser facilmente auditada. O desenvolvimento foi dividido entre as branches:

- **migration/planta**: alterações no schema e nas migrations;
- **feat/plantaLogic**: implementação da lógica da aplicação;
- **feat/loggerImplementation**: implementação do logger;
- **feat/errorType**: implementação do tipo erro.

A branch Homolog foi utilizada como integração, com PRs revisáveis.

Os commits seguiram o padrão utilizado feat, fix e refactor, com descrições em inglês. Para a entrega, criei a branch de entrega `desafio/filipe-albuquerque-santos-moreira`, com o conteúdo final da main, de acordo com a orientação do PDF de desafio.

## 3. Principais dificuldades:

Minhas principais dificuldades giraram em torno da sintaxe do prisma, para isso, usei a IA para me indicar trechos da documentação oficial que me ajudassem a entender o problema.

Também tive dificuldades em versionar o código na mão, para isso, expliquei o que queria fazer para a IA e ela me ensinou como fazer.

## 4. Uso de IA:

Meu uso de IA foi sucinto, usei para gerar o tipo `Result`, usei para gerar as mensagens de commit e de PR de forma que ficasse mais organizado, usei a ferramenta OpenCode para commitar e abrir PR de forma mais fácil, eu defini o nome de cada branch e solicitei que a ferramenta adicionasse ao commit cada arquivo que eu defini, fiz isso, para não cometer algum erro versionamento de código que fosse me gerar retrabalho e custar tempo.

Todas as atividades feitas com IA foram revisadas e entendidas por mim.
