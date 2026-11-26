# Validar implementação e fidelidade

## Antes de editar

Quando possível, execute o frontend fornecido em um diretório separado da aplicação de destino. Registre a rota, viewport, modo de tema, largura, navegação e estado da tela relevante. Uma captura ou medidas do navegador ajudam a comparar o resultado sob as mesmas condições. Se a referência não puder ser executada, use o contrato e registre a limitação.

## Depois de implementar

1. Exercite o fluxo solicitado com dados válidos, vazios e inválidos. Teste invariantes e persistência, inclusive recuperação de erros e reabertura quando fizerem parte do fluxo.
2. Execute os comandos de typecheck, build e testes disponíveis no destino. Em um frontend recém-exportado, consulte o `frontend/README.md` e os scripts de `frontend/package.json`.
3. Compare o resultado visual com a referência nas larguras, temas e estados afetados. Confira os tokens, fontes, navegação, composição, quebra de linha e áreas de rolagem. Nos pontos alterados, verifique também teclado e foco. Ao conectar dados a slots, atualize os dados sem navegação e confira que os controles montados mantêm o estado.
4. Informe componentes reutilizados, modificados e criados. Registre comandos executados, casos conferidos no navegador, diferenças visuais e verificações pendentes. Diferencie inspeção de código de validação no ambiente executável.
