import config from "./config";
import { createElement } from "./utils";

import templateStyles from "./styles/template.module.css";
import nationStyles from "./styles/nation.module.css";
import generalStyles from "./styles/general.module.css";

const root = document.documentElement.style;

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
	for (const [name, value] of Object.entries(config.styles.dark)) {
		root.setProperty(`--${name}`, value);
	}
} else {
	for (const [name, value] of Object.entries(config.styles.light)) {
		root.setProperty(`--${name}`, value);
	}
}

function addCSS(css: string) {
	document.head.appendChild(document.createElement("style")).innerHTML = css;
}

addCSS(generalStyles);

if (!document.querySelectorAll('meta[name="viewport"]').length) {
	addCSS(templateStyles);
}

if (
	(location.pathname.includes("template-overall=none") ||
		location.pathname.includes("page=ajax2")) &&
	!location.pathname.includes("page=blank")
) {
	addCSS(templateStyles);
}

if (
	location.pathname.includes("template-overall=none") &&
	location.pathname.includes("nation=")
) {
	addCSS(nationStyles);
}
