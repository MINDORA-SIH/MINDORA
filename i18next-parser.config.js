module.exports = {
  locales: ['en', 'hi', 'ne', 'as', 'bn', 'brx', 'mni', 'lus', 'kha', 'trp'],
  output: 'src/locales/$LOCALE.json',
  input: ['src/**/*.{ts,tsx}'],
  defaultNamespace: 'translation',
  keepRemoved: false,
  namespaceSeparator: ':',
  keySeparator: '.',
};
