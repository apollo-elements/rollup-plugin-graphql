const pkg = require('./package.json');

export default {
  external: Object.keys(pkg.dependencies),
  sourceMap: true,
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
};
