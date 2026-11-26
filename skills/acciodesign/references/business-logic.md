# Implementar e testar regras de negócio

## Definir invariantes antes de implementar

Para cada operação do fluxo, anote a regra aplicável, sua origem e o resultado esperado quando ela é satisfeita ou violada. Use o pedido e os contratos já aprovados no destino. Rótulos, campos, métricas e dados da demonstração ajudam a localizar a área da tela. As regras devem vir de requisitos confirmados. Registre uma premissa quando puder avançar com ela e peça esclarecimento quando a regra ausente for indispensável.

Considere apenas as verificações que se aplicam ao fluxo.

- **Entradas e registros.** Defina normalização, validação, unicidade, referências e transições permitidas. Se houver unicidade, verifique duplicidade após normalizar, inclusive em edição. Uma máscara ou o comprimento de um identificador verificam sua forma. Para integrações com servidor, aplique as invariantes onde a gravação é controlada.
- **Dinheiro.** Defina moeda e arredondamento. Calcule com unidades menores inteiras dentro de um intervalo seguro ou decimal exato e formate o resultado para exibição.
- **Persistência.** Diferencie ausência de registros, falhas de leitura e dados corrompidos. Preserve dados anteriores diante de corrupção ou falha de gravação. Só confirme a operação depois de persistir com sucesso. Represente estados vazios e de erro conforme o resultado da operação.
- **Indicadores.** Defina fonte, cálculo e recorte. Verifique se os indicadores e as listas refletem os registros após uma alteração e se filtros diferentes têm recortes intencionais. Sem dados confiáveis, indique indisponibilidade. Use zero quando o cálculo com dados válidos resultar em zero e valores fictícios somente em estados identificados como demonstração.

## Testes obrigatórios

Ao implementar uma nova regra de negócio, crie testes automatizados para as invariantes relevantes. Use as ferramentas existentes ou adote a alternativa mínima compatível se o destino ainda não tiver suíte. Cubra entradas válidas, inválidas, limites e falhas pertinentes. Para persistência, confira que uma gravação bem-sucedida aparece numa nova leitura e que uma operação rejeitada mantém os dados válidos. Typecheck e build são verificações distintas desses testes.
