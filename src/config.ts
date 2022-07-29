import * as pkg from "../package.json";

type Config = {
	version: string;
	user: string;
	keybinds: {
		reports: string;
		updated: string;
		toggle: string;
		moveJP: string;
		move: string;
		endorse: string;
		doss: string;
		appointRO: string;
		global: string;
		viewDossier: string;
		clearDossier: string;
		apply: string;
		resign: string;
		prep: string;
		joinWA: string;
		reload: string;
		back: string;
		forward: string;
		copy: string;
		endoActivity: string;
		dossPoints: string[];
	};
	styles: {
		light: {
			backgroundColor: string;
			textColor: string;
			headingColor: string;
			linkBackground: string;
			regionColor: string;
			nationColor: string;
			linkColor: string;
			successColor: string;
			errorColor: string;
		};
		dark: {
			backgroundColor: string;
			textColor: string;
			headingColor: string;
			linkBackground: string;
			regionColor: string;
			nationColor: string;
			linkColor: string;
			successColor: string;
			errorColor: string;
		};
	};
	officerName: string;
	jumpPointName: string;
	dossPointNames: string[];
	userAgent: string;
	jumpPoint: string;
	dossPoints: string[];
};

const config: Config = {
	version: pkg.version,
	user: "Pronoun",
	keybinds: {
		reports: " ",
		updated: "u",
		toggle: "t",
		moveJP: "b",
		move: "m",
		endorse: "e",
		doss: "d",
		appointRO: "o",
		global: "g",
		viewDossier: "v",
		clearDossier: "x",
		apply: "[",
		resign: "]",
		prep: "p",
		joinWA: "Enter",
		reload: "n",
		back: ",",
		forward: ".",
		copy: "=",
		endoActivity: "`",
		dossPoints: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
	},
	styles: {
		light: {
			backgroundColor: "#f9f9f9",
			textColor: "#383c42",
			headingColor: "#000000",
			linkBackground: "#fff",
			regionColor: "#a626a4",
			nationColor: "#4078f2",
			linkColor: "#4078f2",
			successColor: "#50a14f",
			errorColor: "#e45649",
		},
		dark: {
			backgroundColor: "#282c34",
			textColor: "#ABB2BF",
			headingColor: "#ffffff",
			linkBackground: "#444444",
			regionColor: "#c678dd",
			nationColor: "#61afef",
			linkColor: "#61afef",
			successColor: "#98c379",
			errorColor: "#e06c75",
		},
	},
	officerName: "SPSF",
	jumpPointName: "Artificial Solar System",
	dossPointNames: ["Suspicious", "The Allied Nations of Egalaria"],
	get userAgent() {
		return `Script: Harrier v${config.version}; User: ${config.user}; Script author: Pronoun (esfalsa.github.io)`;
	},
	get jumpPoint(): string {
		return config.jumpPointName.toLowerCase().replaceAll(" ", "_");
	},
	get dossPoints() {
		return config.dossPointNames.map((name) =>
			name.toLowerCase().replaceAll(" ", "_"),
		);
	},
};

export default config;
