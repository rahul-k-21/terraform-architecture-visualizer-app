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
  edges: {
    from: string;
    to: string;
  }[];
  providers: string[];
};

const RESOURCE_RE =
  /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;

const PROVIDER_RE =
  /provider\s+"([^"]+)"\s*\{/g;

function lineNumber(
  text: string,
  index: number
) {
  return text
    .slice(0, index)
    .split("\n")
    .length;
}

function matchingBrace(
  text: string,
  openIndex: number
) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (
    let i = openIndex;
    i < text.length;
    i++
  ) {
    const character = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (
      character === "\\" &&
      inString
    ) {
      escaped = true;
      continue;
    }

    if (
      character === '"' &&
      text[i - 1] !== "\\"
    ) {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth++;
    }

    if (character === "}") {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return text.length - 1;
}

function attributesFromBlock(
  block: string
) {
  const attributes: Record<
    string,
    string
  > = {};

  const lines = block.split("\n");

  for (const rawLine of lines) {
    const match = rawLine.match(
      /^\s*([A-Za-z_][\w-]*)\s*=\s*(.+?)\s*$/
    );

    if (match) {
      attributes[match[1]] =
        match[2];
    }
  }

  return attributes;
}

export function parseTerraform(
  text: string
): TerraformGraph {
  const resources: TerraformResource[] =
    [];

  const providers =
    new Set<string>();

  for (const match of text.matchAll(
    PROVIDER_RE
  )) {
    providers.add(match[1]);
  }

  for (const match of text.matchAll(
    RESOURCE_RE
  )) {
    const type = match[1];
    const name = match[2];

    const address =
      `${type}.${name}`;

    const matchIndex =
      match.index ?? 0;

    const openIndex =
      matchIndex +
      match[0].length -
      1;

    const closeIndex =
      matchingBrace(
        text,
        openIndex
      );

    const block =
      text.slice(
        openIndex + 1,
        closeIndex
      );

    resources.push({
      id: address,
      type,
      name,
      address,
      provider:
        type.includes("_")
          ? type.split("_")[0]
          : "terraform",
      line:
        lineNumber(
          text,
          matchIndex
        ),
      attributes:
        attributesFromBlock(
          block
        ),
    });
  }

  const edges: {
    from: string;
    to: string;
  }[] = [];

  const addresses =
    resources.map(
      (resource) =>
        resource.address
    );

  for (const resource of resources) {
    const resourceStart =
      text.indexOf(
        `resource "${resource.type}" "${resource.name}"`
      );

    const resourceText =
      resourceStart >= 0
        ? text.slice(
            resourceStart
          )
        : "";

    for (const target of addresses) {
      if (
        target ===
        resource.address
      ) {
        continue;
      }

      const escapedTarget =
        target.replace(
          ".",
          "\\."
        );

      const reference =
        new RegExp(
          `\\b${escapedTarget}(?:\\.|\\[)`
        );

      if (
        reference.test(
          resourceText
        )
      ) {
        edges.push({
          from:
            resource.address,
          to: target,
        });
      }
    }
  }

  const uniqueEdges =
    Array.from(
      new Map(
        edges.map((edge) => [
          `${edge.from}->${edge.to}`,
          edge,
        ])
      ).values()
    );

  return {
    resources,
    edges: uniqueEdges,
    providers:
      Array.from(providers),
  };
}