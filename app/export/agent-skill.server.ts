import skill from "../../skills/acciodesign/SKILL.md?raw";
import integration from "../../skills/acciodesign/references/integration.md?raw";
import visualContract from "../../skills/acciodesign/references/visual-contract.md?raw";
import businessLogic from "../../skills/acciodesign/references/business-logic.md?raw";
import validation from "../../skills/acciodesign/references/validation.md?raw";

const directory = "skills/acciodesign";

// Keep the legacy entrypoint name and resolve its links from the archive root.
const rootSkill = skill
  .replace(/^name: acciodesign$/m, "name: acciodesign-design")
  .replaceAll("](references/", `](${directory}/references/`);

export const agentSkillFiles = {
  "SKILL.md": rootSkill,
  [`${directory}/SKILL.md`]: skill,
  [`${directory}/references/integration.md`]: integration,
  [`${directory}/references/visual-contract.md`]: visualContract,
  [`${directory}/references/business-logic.md`]: businessLogic,
  [`${directory}/references/validation.md`]: validation,
};
