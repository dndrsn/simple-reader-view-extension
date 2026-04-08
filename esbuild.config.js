
module.exports = {
  entryPoints: [
    'src/background.js',
    'src/content.js',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [],
};

