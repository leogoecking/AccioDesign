# Reconhecer e integrar o pacote

## Conferir a estrutura

1. Localize a raiz extraída pelo `manifest.json`. Confirme `format: acciodesign.design-export`, `formatVersion: "1.0"` e a identificação do projeto. Se a versão for desconhecida, procure documentação ou uma exportação compatível antes de aplicar o pacote.
2. Confirme que `design.json`, `tokens.json` e `manifest.json` são JSON legível. Confira `root.props` e o array `content` em `design.json`, `modes.light` e `modes.dark` em `tokens.json` e a coerência entre o modo ativo do tema e o do manifesto. Verifique a presença de `theme.css`, `DESIGN.md`, `components.md` e `SKILL.md`. Essas checagens verificam a estrutura do pacote. O manifesto não fornece assinatura nem hashes.
3. Para o frontend executável, confira `frontend/package.json`, `frontend/README.md`, `frontend/src/main.tsx`, `frontend/src/design.json` e `frontend/src/theme.css`. Em um pacote recém-extraído, o documento e o CSS devem corresponder aos da raiz. Pacotes antigos do formato 1.0 podem trazer somente o contrato visual. Se a tarefa depender das views fornecidas ou o frontend estiver incompleto, solicite uma nova exportação.

Use os caminhos definidos pelo pacote e pelo código existente. Antes de instalar dependências ou executar o frontend de um pacote recebido de terceiros, inspecione os scripts e a origem do código. Mantenha os avisos e licenças ao transportar as views.

## Escolher o ponto de integração

- **Projeto novo**. Inicie em `frontend/` e use o registro de views em `src/main.tsx`. Conecte dados reais por props, callbacks, slots ou um adaptador junto à entrada.
- **Código existente**. Leia primeiro as convenções do repositório e mapeie rotas, componentes, dependências, estilos e contratos de dados que se sobrepõem ao pacote. Reutilize a implementação compatível e conecte apenas as views exportadas necessárias, de preferência por adaptadores. Preserve arquivos existentes ao resolver conflitos e integre mudanças de forma explícita.

Use `components.md` para encontrar a hierarquia e as propriedades dos blocos da tarefa. As views do ZIP ficam em `frontend/src/puck/config/components/`. O inventário pode apontar para caminhos do repositório AccioDesign. No destino, confira os imports reais das views antes de adicionar dependências. Leia apenas os arquivos envolvidos no fluxo solicitado.

## Separar responsabilidades

Se o fluxo combinar operações de negócio e persistência, mantenha pontos de entrada testáveis para as seguintes responsabilidades.

- **Apresentação** renderiza os dados e encaminha interações por props e callbacks.
- **Domínio** normaliza, valida e aplica as regras em funções testáveis sem montar React.
- **Persistência** concentra leitura e gravação em uma função ou adaptador que possa ser exercitado com dados e falhas controlados.
- **Estado**, quando necessário, coordena rascunhos, consultas e o resultado das operações. Use o mecanismo já adotado pelo projeto, como um hook ou controlador.

Extraia responsabilidades independentes do componente que renderiza a tela. Use o menor arranjo que permita testá-las separadamente, de acordo com as convenções do destino. Funções com limites claros podem bastar para um fluxo simples.
