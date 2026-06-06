import path from 'path';

const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames.map((f) => `"${path.relative(process.cwd(), f)}"`).join(' ')}`;

export default {
  '*.{ts,tsx}': [buildEslintCommand, 'prettier --write'],
  '*.{js,mjs,cjs}': [buildEslintCommand, 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
};
