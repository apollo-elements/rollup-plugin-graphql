import { rollup, RollupOutput } from 'rollup';
import { expect } from 'chai';
import graphql from '../src';
import { writeFileSync } from 'fs';
import { unlinkSync } from 'fs';

process.chdir(__dirname);

// dynamic import() from a data uri doesn't work, and between ts and node,
// import()ing the file didn't work either 🤷‍♂️
/* eslint-disable @typescript-eslint/no-var-requires */

async function generateCjsBundle(input: string): Promise<RollupOutput> {
  return rollup({
    input,
    output: { exports: 'default' },
    plugins: [graphql()],
  })
    .then(bundle => bundle.generate({ format: 'cjs' }));
}

describe('plugin', () => {
  afterEach(() => {
    try {
      unlinkSync('./tmp.js');
    } catch { null; }
  });

  it('should parse a simple graphql file', async function() {
    const { output: [{ code }] } = await generateCjsBundle('samples/basic/index.js');

    writeFileSync('./tmp.js', code, 'utf8');

    const { result } = require('./tmp.js');

    expect(result).to.be.ok;
    expect(result.kind, 'kind').to.equal('Document');
    expect(result.definitions).to.be.an.instanceof(Array);

    const [definition] = result.definitions;
    expect(definition.kind).to.equal('OperationDefinition');
    expect(definition.name.value).to.equal('GetHero');
    expect(result.loc).to.be.ok;
    expect(result.loc.source).to.be.ok;
    expect(result.loc.source.body).to.equal('query GetHero{hero{id name __typename}}');
    const [{ selectionSet: { selections } }] = definition.selectionSet.selections;

    // fragment fields
    expect(selections.length).to.equal(3);
    expect(selections[0].name.value).to.equal('id');
    expect(selections[1].name.value).to.equal('name');
    expect(selections[2].name.value).to.equal('__typename');
  });

  it('should include a fragment', async function() {
    const { output: [{ code }] } = await generateCjsBundle('samples/fragments/index.js');

    writeFileSync('./tmp.js', code, 'utf8');

    const { result } = require('./tmp.js');

    expect(result).to.be.ok;
    expect(result.kind, 'kind').to.equal('Document');
    expect(result.definitions).to.be.an.instanceof(Array);
    const [definition] = result.definitions;
    expect(definition.kind).to.equal('OperationDefinition');
    expect(definition.operation).to.equal('query');
    expect(definition.name.value).to.equal('GetHero');
    const [{ selectionSet: { selections } }] = definition.selectionSet.selections;
    // fragment fields
    expect(selections.length).to.equal(3);
    expect(selections[0].name.value).to.equal('id');
    expect(selections[1].name.value).to.equal('name');
    expect(selections[2].name.value).to.equal('__typename');
    expect(result.loc.source.body).to.equal('query GetHero{hero{id name __typename}}');
  });
});
