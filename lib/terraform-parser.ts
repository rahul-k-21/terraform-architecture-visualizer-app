export type TerraformResource = {
  id: string;
  type: string;
  name: string;
  address: string;
  provider: string;
  line: number;
  attributes: Record<string, string>;
};

export type TerraformGraph = {
  resources: TerraformResource[];
  edges: { from: string; to: string }[];
  providers: string[];
};

const RESOURCE_RE = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
const PROVIDER_RE = /provider\s+"([^"]+)"\s*\{/g;

function lineNumber(text: string, index: number) {
  return text.slice(0, index).split("\n").length;
}

function matchingBrace(text: string, openIndex: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\" && inString) { escaped = true; continue; }
    if (ch === '"' && text[i - 1] !== "\\") { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return text.length - 1;
}

function attributesFromBlock(block: string) {
  const attributes: Record<string, string> = {};
  const lines = block.split("\n");
  for (const raw of lines) {
    const m = raw.match(/^\s*([A-Za-z_][\w-]*)\s*=\s*(.+?)\s*$/);
    if (m) attributes[m[1]] = m[2];
  }
  return attributes;
}

export function parseTerraform(text: string): TerraformGraph {
  const resources: TerraformResource[] = [];
  const providers = new Set<string>();

  for (const m of text.matchAll(PROVIDER_RE)) providers.add(m[1]);

  for (const m of text.matchAll(RESOURCE_RE)) {
    const type = m[1];
    const name = m[2];
    const address = `${type}.${name}`;
    const openIndex = (m.index ?? 0) + m[0].length - 1;
    const closeIndex = matchingBrace(text, openIndex);
    const block = text.slice(openIndex + 1, closeIndex);
    resources.push({
      id: address,
      type,
      name,
      address,
      provider: type.includes("_") ? type.split("_")[0] : "terraform",
      line: lineNumber(text, m.index ?? 0),
      attributes: attributesFromBlock(block)
    });
  }

  const edges: { from: string; to: string }[] = [];
  const addresses = resources.map(r => r.address);

  for (const resource of resources) {
    const blockText = text.slice(
      text.indexOf(`resource "${resource.type}" "${resource.name}"`)
    );
    for (const target of addresses) {
      if (target === resource.address) continue;
      const ref = new RegExp(`\\b${target.replace(".", "\\.")}(?:\\.|\\[)`, "m");
      if (ref.test(blockText)) edges.push({ from: resource.address, to: target });
    }
  }

  // Also recognize common implicit references where an attribute value is quoted.
  const unique = Array.from(new Map(edges.map(e => [`${e.from}->${e.to}`, e])).values());
  return { resources, edges: unique, providers: Array.from(providers) };
}