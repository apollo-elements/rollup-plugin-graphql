import type { Plugin } from 'rollup';
import type { DefinitionNode, DocumentNode } from 'graphql';
import { createFilter } from 'rollup-pluginutils';
import { resolve, dirname } from 'path';
import { parse } from 'graphql';

import { cleanDocument, extractImports } from 'graphql-mini-transforms';
import { readFile } from 'fs/promises';


export interface Options {
  include: string|string[],
  exclude: string|string[],
}

async function loadDocument(rawSource: string | Buffer, id: string): Promise<DocumentNode> {
  const normalizedSource =
    typeof rawSource === 'string' ? rawSource : rawSource.toString();

  const { imports, source } =
    extractImports(normalizedSource);

  const document =
    parse(source) as DocumentNode & { definitions: DefinitionNode[] };

  if (imports.length === 0)
    return document;

  const resolvedImports =
    await Promise.all(
      imports
        .map(relativePath => resolve(dirname(id), relativePath))
        .map(absolutePath => readFile(absolutePath, 'utf-8')
          .then(source => loadDocument(source, absolutePath)))
    );

  for (const { definitions } of resolvedImports)
    document.definitions.push(...definitions);

  return document;
}

export default function graphql(options?: Options): Plugin {
  const filter = createFilter(options?.include, options?.exclude);
  const filterExt = /\.(graphql|gql)$/i;

  return {
    name: 'graphql',
    async transform(source, id) {
      if (!filter(id)) return null;
      if (!filterExt.test(id)) return null;

      const exported =
        await loadDocument(source, id).then(cleanDocument);

      return {
        // code: `export default JSON.parse(${JSON.stringify(JSON.stringify(exported))});`,
        code: `export default JSON.parse('${JSON.stringify(exported)}');`,
        map: { mappings: '' },
      };
    },
  };
}
