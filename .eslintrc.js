module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"prettier",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	ignorePatterns: [".eslintrc.js", "*.config.js", "dist/*"],
	plugins: ["@typescript-eslint"],
	root: true,
	env: {
		browser: true,
		node: true,
	},
};
