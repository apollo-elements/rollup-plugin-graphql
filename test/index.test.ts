import { rollup } from 'rollup';
import { expect } from 'chai'
import graphql from '../src';
import { writeFileSync } from 'fs';
import { unlinkSync } from 'fs';

process.chdir(__dirname);

describe('plugin', () => {
  afterEach(() => {
    try {
      unlinkSync('./tmp.js')
    } catch { }
  });

  it('should parse a simple graphql file', async function() {
    const bundle = await rollup({
      input: 'samples/basic/basic.graphql',
      output: { exports: 'default' },
      plugins: [graphql()]
    });

    const { output: [{ code }] } = await bundle.generate({ format: 'cjs' });

    writeFileSync('./tmp.js', code, 'utf8');

    const result = require('./tmp.js');

    expect(result).to.be.ok;
    expect(result.kind, 'kind').to.equal('Document');
    expect(result.definitions).to.be.an.instanceof(Array);

    const [definition] = result.definitions;
    expect(definition.kind).to.equal('OperationDefinition');
    expect(definition.name.value).to.equal('GetHero');
    expect(result.loc).to.be.ok;
    expect(result.loc.source).to.be.ok;
    expect(result.loc.source.body).to.equal('query GetHero{hero{id name __typename}}')
    const [{selectionSet: { selections }}] = definition.selectionSet.selections;
    // fragment field3
    expect(selections.length).to.equal(3);
    expect(selections[0].name.value).to.equal('id');
    expect(selections[1].name.value).to.equal('name');
    expect(selections[2].name.value).to.equal('__typename');
  });

  it('should include a fragment', async function() {
    const bundle = await rollup({
      input: 'samples/fragments/allHeroesQuery.graphql',
      output: { exports: 'default' },
      plugins: [graphql()]
    });

    const { output: [{ code }] } = await bundle.generate({ format: 'cjs' });

    writeFileSync('./tmp.js', code, 'utf8');

    const result = require('./tmp.js');

    expect(result).to.be.ok;
    expect(result.kind, 'kind').to.equal('Document');
    expect(result.definitions).to.be.an.instanceof(Array);
    const [definition] = result.definitions;
    expect(definition.kind).to.equal('OperationDefinition');
    expect(definition.operation).to.equal('query');
    expect(definition.name.value).to.equal('GetHero');
    const [{selectionSet: { selections }}] = definition.selectionSet.selections;
    // fragment fields
    expect(selections.length).to.equal(3);
    expect(selections[0].name.value).to.equal('id');
    expect(selections[1].name.value).to.equal('name');
    expect(selections[2].name.value).to.equal('__typename');
    expect(result.loc.source.body).to.equal('query GetHero{hero{id name __typename}}')
  });
});
