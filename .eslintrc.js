module.exports = {
    "extends": ["eslint:recommended"],
    "rules": {
        "no-console": ["error", {
            "allow": ["warn", "error", "info"]
        }],
        "semi": 2 // 2就是error 1是warning 0是off
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "script"
    },
    "globals": {
        "window": true
    },
    "env": {
        "node": true,
        "es6": true,
        "mocha": true
    }
};