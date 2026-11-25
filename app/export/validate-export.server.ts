// Fail closed on common credential fields or recognizable secrets in project data.
// Arbitrary user text cannot be classified perfectly; never read environment files.
const SECRET_KEY = /^(?:password|passwd|senha|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|authorization|credential|credentials)$/i;
const SECRET_VALUE = /(?:\bsk-(?:proj-)?[a-zA-Z0-9_-]{20,}\b|\bBearer\s+[a-zA-Z0-9._~+\/-]{16,})/i;
export function assertNoCredentials(value: unknown): void {
  const visit = (node: unknown) => {
    if (typeof node === "string" && SECRET_VALUE.test(node)) throw new Error("Dados sensíveis não podem ser exportados.");
    if (!node || typeof node !== "object") return;
    for (const [key, item] of Object.entries(node)) {
      if (SECRET_KEY.test(key) && item != null && item !== "" && item !== false) {
        throw new Error("Dados sensíveis não podem ser exportados.");
      }
      visit(item);
    }
  };
  visit(value);
}
