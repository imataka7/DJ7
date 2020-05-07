module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-async-promise-executor': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "@typescript-eslint/ban-ts-ignore": process.env.NODE_ENV === 'production' ? 'warn' : 'off', 
    "@typescript-eslint/no-var-requires" : process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/camelcase': 'off'
  }
}
