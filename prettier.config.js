/** @type {import("prettier").Config} */
const config = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  arrowParens: 'avoid',
  printWidth: 100,
  trailingComma: 'all',
  plugins: ['prettier-plugin-svelte'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
}

export default config
