module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript'
    ],
    rules: {
        "no-unused-vars": "off",
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-mixed-spaces-and-tabs': ["error", "smart-tabs"],
        "no-unsafe-finally": 0,
        "no-empty": 0,
    },
    parserOptions: {
        parser: '@typescript-eslint/parser'
    }
}
