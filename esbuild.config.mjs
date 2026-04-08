
import postcssPlugin from 'esbuild-postcss';


export default {
  entryPoints: [
    'src/background.js',
    'src/content.js',
    'src/reader.css',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [postcssPlugin()],
};
