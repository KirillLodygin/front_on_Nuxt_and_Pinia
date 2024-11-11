module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  extends: ['@nuxtjs', 'plugin:nuxt/recommended', 'prettier'],
  plugins: [],
  // add your custom rules here
  rules: {
    'no-var': 0,
    'prefer-const': ['error', {
      'destructuring': 'all',
      'ignoreReadBeforeAssign': true
    }],
    'vue/multi-word-component-names': 0,
  },
}
