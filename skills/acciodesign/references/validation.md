# Validar implementação e fidelidade

## Referência inicial

Quando possível, execute o frontend fornecido em um diretório separado da aplicação de destino. Registre a rota, viewport, modo de tema, largura, navegação e estado da tela relevante. Uma captura ou medidas do navegador ajudam a comparar o resultado sob as mesmas condições. Se a referência não puder ser executada, use o contrato e registre a limitação.

## Quality Gate

Antes de concluir, classifique cada verificação e registre a evidência, o motivo da inaplicabilidade ou o impedimento.

| Verificação | Evidência esperada |
| --- | --- |
| Funcionalidades solicitadas | Resultado observado ao executar os fluxos e estados solicitados. |
| Regras de negócio | Resultado dos testes automatizados para as invariantes novas ou alteradas. |
| Persistência e integridade | Resultado de uma nova leitura após salvar e das falhas pertinentes, com os dados anteriores preservados quando a operação for rejeitada. |
| Separação de responsabilidades | Pontos de entrada testáveis para as responsabilidades independentes do fluxo. |
| Alterações visuais | Inventário comparado com a tela renderizada após conectar os dados, com justificativa para as diferenças necessárias. |
| Reutilização de componentes | Componentes reutilizados, modificados e criados, com o motivo quando uma view existente não atender. |
| Responsividade e runtime | Tela conferida nas larguras, temas e estados afetados. Quando houver slots ou estado interativo, verifique foco, edição e aba ativa após atualizar os dados. |
| Typecheck e build | Resultado dos comandos aplicáveis ao destino. Num frontend recém-exportado, consulte `frontend/README.md` e `frontend/package.json`. |

- **Aprovada** quando a evidência obtida atende ao critério.
- **Reprovada** quando a evidência mostra uma falha.
- **Não aplicável** quando o critério fica fora do fluxo, com o motivo.
- **Não verificada** quando falta evidência ou a verificação não foi executada.

Corrija falhas relevantes e repita as verificações afetadas antes de declarar a implementação concluída. Informe os bloqueios que persistirem e distinga inspeção de código de validação no ambiente executável.
