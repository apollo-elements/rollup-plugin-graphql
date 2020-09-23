# @apollo-elements/rollup-plugin-graphql

[![Actions Status](https://github.com/apollo-elements/rollup-plugin-graphql/workflows/main/badge.svg)](https://github.com/apollo-elements/rollup-plugin-graphql/actions)
[![npm](https://img.shields.io/npm/v/@apollo-elements/rollup-plugin-graphql)](https://npm.im/@apollo-elements/rollup-plugin-graphql)

Import GraphQL Documents in your Modules.

```ts
import { ApolloQuery, html } from '@apollo-elements/lit-apollo';
import LaunchesQuery from './Launches.query.graphql';

import { LaunchesQueryData as Data, LaunchesQueryVariables as Variables } from '../codegen';

class LaunchesElement extends ApolloQuery<Data, Variables> {
  query = LaunchesQuery;

  formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

  render() {
    const names =
      (this.data?.launches ?? []).map(x => x.mission_name);

    return html`
      <p ?hidden="${this.loading}">
        ${this.formatter.format(names)} recently launched!!
      </p>
    `
  }
}
```

## Installation

```bash
npm i -D @apollo-elements/rollup-plugin-graphql
```

```bash
yarn add -D @apollo-elements/rollup-plugin-graphql
```

## Usage with Rollup

```js
import { rollup } from 'rollup';
import graphql from '@apollo-elements/rollup-plugin-graphql';

export default {
  input: 'main.js',
  plugins: [
    graphql()
  ]
}
```

## Usage with `@web/dev-server`

```js
import { fromRollup } from '@web/dev-server-rollup';
import graphqlRollup from '@apollo-elements/rollup-plugin-graphql';

const graphql = fromRollup(graphqlRollup);

export default {
  mimeTypes: {
    '**/*.graphql': 'js;
  },
  plugins: [
    graphql()
  ]
}
```

## Acknowledgements

This is based on the excellent [`graphql-mini-transforms`](https://github.com/Shopify/graphql-tools-web/tree/main/packages/graphql-mini-transforms) from Shopify. Prior art in `rollup-plugin-graphl` by Kamil Kisiela.

## Why?

This plugin reduces bundle sizes by exporting simple `JSON.parse`-d objects.

See https://github.com/apollographql/graphql-tag/issues/249
