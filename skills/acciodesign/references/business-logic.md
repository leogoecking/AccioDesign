# Implementar regras de negócio

## Requisitos e fronteiras

- Derive as regras do pedido e dos contratos já aprovados no destino. Dados fictícios, rótulos, filtros, métricas, status e formulários do design servem como referência de apresentação. Se faltar uma regra que muda o resultado, confirme-a ou registre a lacuna. Implemente somente o fluxo solicitado.
- Preserve a separação entre views, regras e acesso a dados na medida que a tarefa exigir. Uma função de validação e um pequeno adaptador de armazenamento podem bastar em um projeto simples. Reutilize os limites e convenções do projeto existente.
- Valide entradas novas e dados carregados na fronteira do domínio. Considere normalização, duplicidade, referências inválidas, campos ausentes, estados vazios e falhas de gravação conforme as regras confirmadas. Para integrações com servidor, aplique as invariantes também no lado que controla a persistência.

## Aprendizados do AccioDesign-Lab

- Uma máscara ou o comprimento de um identificador verificam somente a sua forma. Se o domínio exigir um identificador válido ou único, teste a regra aplicável e a duplicidade após normalização, inclusive em edição.
- Quando houver dinheiro, use unidades menores inteiras dentro de um intervalo seguro ou decimal exato. Defina moeda e regras de arredondamento do domínio. Formate para exibição depois do cálculo.
- Diferencie armazenamento sem registros de falha de leitura ou corrupção. Preserve os dados anteriores e informe a falha. Grave alterações somente quando os dados forem válidos e mantenha uma forma de recuperar ou corrigir registros problemáticos.
- Teste as invariantes implementadas, os limites, duplicidades e erros de leitura ou gravação pertinentes. Verifique que uma gravação bem-sucedida aparece depois de reabrir o fluxo e que uma gravação rejeitada mantém os dados válidos.
