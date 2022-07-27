// ==UserScript==
// @name          Harrier
// @namespace     https://esfalsa.github.io
// @description   Keybinds for NationStates.
// @match         *://*.nationstates.net/*
// @run-at        document-start
// @icon          https://www.nationstates.net/favicon.ico
// ==/UserScript==

const config = {
	version: "0.1.0",
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
		joinWA: "Enter",
		reload: "n",
		back: ",",
		forward: ".",
		dossPoints: ["d", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
	},
	styles: {
		backgroundColor: "#f9f9f9",
		textColor: "#383c42",
		headingColor: "#000000",
		linkBackground: "#fff",
		regionColor: "#a626a4",
		nationColor: "#4078f2",
		linkColor: "#4078f2",
		dark: {
			backgroundColor: "#282c34",
			textColor: "#ABB2BF",
			headingColor: "#ffffff",
			linkBackground: "#444444",
			regionColor: "#c678dd",
			nationColor: "#61afef",
			linkColor: "#61afef",
		},
	},
	officerName: "SPSF",
	jumpPointName: "Artificial Solar System",
	dossPointNames: ["Suspicious", "The Allied Nations of Egalaria"],
	get userAgent() {
		return `Script: Harrier v${this.version}; User: ${this.user}; Script author: Pronoun (esfalsa.github.io)`;
	},
	get jumpPoint() {
		return this.jumpPointName.toLowerCase().replaceAll(" ", "_");
	},
	get dossPoints() {
		return this.dossPointNames.map((name) =>
			name.toLowerCase().replaceAll(" ", "_"),
		);
	},
};
