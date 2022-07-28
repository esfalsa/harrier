import typescript from "@rollup/plugin-typescript";
import metablock from "rollup-plugin-userscript-metablock";
import json from "@rollup/plugin-json";

import pkg from "./package.json";

export default {
	input: "src/index.ts",
	output: {
		file: "dist/harrier.user.js",
		format: "es",
	},
	plugins: [
		typescript(),
		json(),
		metablock({
			file: "./meta.json",
			override: {
				name: pkg.name,
				version: pkg.version,
				description: pkg.description,
				author: pkg.author,
				license: pkg.license,
			},
		}),
	],
};
