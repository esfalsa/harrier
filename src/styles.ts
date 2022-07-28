import config from "./config";
import { createElement } from "./utils";

function addCSS(css: string) {
	document.head.appendChild(document.createElement("style")).innerHTML = css;
}

/* STYLING */
const styles = /*css*/ `
:root {
  --background-color: ${config.styles.backgroundColor};
  --text-color: ${config.styles.textColor};
  --heading-color: ${config.styles.headingColor};
  --link-background: ${config.styles.linkBackground};
  --region-color: ${config.styles.regionColor};
  --nation-color: ${config.styles.nationColor};
  --link-color: ${config.styles.linkColor};

  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.075);

  background-color: var(--background-color);
  font-family: var(--font-sans);
  color: var(--text-color);
}

${
	config.styles?.dark &&
	/*css*/ `@media (prefers-color-scheme: dark) {
  :root {
    --background-color: ${config.styles.dark.backgroundColor};
    --text-color: ${config.styles.dark.textColor};
    --heading-color: ${config.styles.dark.headingColor};
    --link-background: ${config.styles.dark.linkBackground};
    --region-color: ${config.styles.dark.regionColor};
    --nation-color: ${config.styles.dark.nationColor};
    --link-color: ${config.styles.dark.linkColor};
  }
}`
}

h1, h2, h3, h4, h5, h6 {
  color: var(--heading-color);
}

a {
  color: var(--link-color);
}

input {
  font-size: 1rem; /* Prevent iOS from zooming in to text box when focused. */
  font-family: var(--font-sans);
  color: var(--heading-color);
  background-color: var(--link-background);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  box-shadow: var(--shadow-inner), var(--shadow);
  cursor: pointer;
}

ul, body {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin: 0.5rem 0;
  min-height: 1.5rem;
}

.rlink {
  color: var(--region-color);
  display: inline-block;
}

.nlink {
  color: var(--nation-color);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.rlink, .nlink {
  background-color: var(--link-background);
  font-weight: bold;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: var(--shadow);
}

button, input[type="button"], input[type="submit"] {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--text-color);
  background-color: var(--link-background);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
  border: none;
  box-shadow: var(--shadow);
  cursor: pointer;
}

button:disabled, input[type="button"]:disabled, input[type="submit"]:disabled {
  opacity: 0.5;
}

button[data-action] {
  margin-left: 0.5rem;
  font-weight: normal;
}

img.miniflag {
  height: 11px;
}

img.smallflag {
  max-height: 26px;
}

.newflagbox a img {
  max-height: 60px;
}
`;

const nationStyles = /*css*/ `
.newmainlinebox {
  display: inline-block;
}

.newmainlinebubble {
  display: inline-flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
  margin-right: 1.5rem;
}

.newmainlinebubbletop {
  font-weight: bold;
}
.newmainlinebubbletop::after {
  content: ":";
}

.newmainlinebubblebottom[style] {
  color: transparent;
  -webkit-background-clip: text !important;
  background-clip: text;
}

.lineundercover, .newnonflagstuff {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.newtitlepretitle, .newtitlename, .newtitlecategory {
  display: inline-block;
  font-size: 1.5rem;
}

.newtitlename {
  font-weight: bold;
}

.newtitlecategory {
  opacity: 0.5;
}

.newtitlecategory::before {
  content: "(";
}
.newtitlecategory::after {
  content: ")";
}

#nationcover, #badge_rack, #trophycabinet, .newsloganbox, .nationnavbar, .nationsummarybox, .nationsummary, .trophyline, #tgcompose, .newsbox > p.smalltext {
  display: none;
}
`;

if (
	(location.pathname.includes("template-overall=none") ||
		location.pathname.includes("page=ajax2")) &&
	!location.pathname.includes("page=blank") &&
	!document.querySelectorAll('meta[name="viewport"]').length
) {
	createElement("meta", {
		name: "viewport",
		content: "width=device-width,initial-scale=1.0",
	});
	addCSS(styles);
}

if (
	location.pathname.includes("template-overall=none") &&
	location.pathname.includes("nation=")
) {
	addCSS(nationStyles);
}
