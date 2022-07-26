// ==UserScript==
// @name					Gust
// @namespace			https://esfalsa.github.io
// @description		Keybinds for NationStates.
// @match					*://*.nationstates.net/*
// @run-at				document-start
// @icon					https://www.nationstates.net/favicon.ico
// ==/UserScript==

const config: any = {
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
		viewDossier: "v",
		clearDossier: "x",
		apply: "[",
		resign: "]",
		joinWA: "Enter",
		reload: "n",
		back: ",",
		forward: ".",
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
	jumpPoint: "Artificial Solar System",
	get userAgent() {
		return `Script: Gust v${this.version}; User: ${this.user}; Script author: Pronoun (esfalsa.github.io)`;
	},
};
