const pkg = require('./package.json');

export default {
  external: Object.keys(pkg.dependencies),
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
};
