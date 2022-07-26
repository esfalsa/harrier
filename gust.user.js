// ==UserScript==
// @name					Gust
// @namespace			https://esfalsa.github.io
// @description		Keybinds for NationStates.
// @match					*://*.nationstates.net/*
// @run-at				document-start
// @icon					https://www.nationstates.net/favicon.ico
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
/* UTILITIES */
function createElement(tagName, properties) {
    return Object.assign(document.createElement(tagName), properties);
}
async function fetchNS(pathname, searchParams = "", options = {}) {
    let resource = Object.assign(new URL(pathname, "https://www.nationstates.net"), {
        search: new URLSearchParams(searchParams),
    });
    options.headers = { ...options.headers, "User-Agent": config.userAgent };
    options.redirect = "manual";
    return fetch(resource, options);
}
/* VARIABLES */
let currentNation, localid;
let chk, dossed;
let disableKeybinds = false;
async function initialize() {
    [[currentNation, localid], [chk, dossed]] = await Promise.all([
        getLocalId(),
        getChkDoss(),
    ]);
}
/* INITIALIZATION */
initialize().then(() => {
    if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(location.pathname)) {
        quickEndo();
    }
    else if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(location.pathname)) {
        quickDoss();
    }
});
/* QUICK ENDO */
async function quickEndo() {
    let happenings = document.querySelectorAll("li[id^='happening-']");
    happenings.forEach((happening) => {
        if (happening.textContent.includes("was admitted to the World Assembly") ||
            happening.textContent.includes("endorsed")) {
            let nation = happening
                .querySelector(".nnameblock")
                .textContent.toLowerCase()
                .replaceAll(" ", "_");
            if (nation !== currentNation) {
                let button = createElement("button", {
                    textContent: "Endo",
                    id: nation,
                });
                button.dataset.action = "endorse";
                happening.querySelector(".nlink").after(button);
                button.addEventListener("click", () => {
                    document
                        .querySelectorAll("button")
                        .forEach((button) => (button.disabled = true));
                    endo(nation).then(() => {
                        document
                            .querySelectorAll(`[id="${nation}"]`)
                            .forEach((button) => button.classList.add("endorsed"));
                        document
                            .querySelectorAll("button:not(.endorsed)")
                            .forEach((button) => (button.disabled = false));
                    });
                });
            }
        }
    });
}
/* QUICK DOSS */
async function quickDoss() {
    document.querySelectorAll("a.nlink").forEach((link) => {
        let nation = link
            .querySelector(".nnameblock")
            .textContent.toLowerCase()
            .replaceAll(" ", "_");
        let button = createElement("button", {
            textContent: "Doss",
            id: nation,
            disabled: dossed.includes(nation),
        });
        button.dataset.action = "doss";
        if (dossed.includes(nation)) {
            button.classList.add("dossed");
        }
        link.after(button);
        button.addEventListener("click", () => {
            document
                .querySelectorAll("button")
                .forEach((button) => (button.disabled = true));
            doss(nation).then(() => {
                document
                    .querySelectorAll(`[id="${nation}"]`)
                    .forEach((button) => button.classList.add("dossed"));
                document
                    .querySelectorAll("button:not(.dossed)")
                    .forEach((button) => (button.disabled = false));
            });
        });
    });
}
/* REPORTS LOAD TIME */
if (location.pathname.includes("page=reports")) {
    function timePerformance() {
        const duration = performance.getEntriesByType("navigation")[0].duration;
        if (!duration) {
            setTimeout(timePerformance, 0);
        }
        else {
            document.querySelector("h1").textContent += ` (${duration.toFixed(1)}ms)`;
        }
    }
    timePerformance();
}
/* REPLACE AJAX2 LINKS */
if (location.pathname.includes("page=ajax2")) {
    document
        .querySelectorAll("a.rlink, a.nlink")
        .forEach((link) => {
        link.href = `/template-overall=none/${link.getAttribute("href")}`;
    });
}
/* REQUESTS */
async function getChkDoss() {
    const response = await (await fetchNS("template-overall=none/page=dossier")).text();
    const chk = response.match(/<input type="hidden" name="chk" value="(?<chk>.+)">/).groups.chk;
    const dossed = [
        ...response.matchAll(/<input type="checkbox" name="remove_nation_(?<nation>.+?)">/g),
    ].map((match) => match.groups.nation);
    return [chk, dossed];
}
async function getLocalId() {
    let response = await (await fetchNS("template-overall=none/page=create_region")).text();
    return [
        response.match(/<a href="nation=(?<nation>.+)" class="nlink">/).groups
            .nation,
        response.match(/<input type="hidden" name="localid" value="(?<localid>.+)">/).groups.localid,
    ];
}
async function doss(nation) {
    let data = new FormData();
    data.append("nation", nation);
    data.append("chk", chk);
    data.append("action", "add");
    fetchNS("template-overall=none/page=dossier", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function endo(nation) {
    let data = new FormData();
    data.append("nation", nation);
    data.append("localid", localid);
    data.append("action", "endorse");
    fetchNS("cgi-bin/endorse.cgi", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function move(region) {
    let data = new FormData();
    data.append("localid", localid);
    data.append("region_name", region);
    data.append("move_region", "1");
    fetchNS("page=change_region", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function applyWA() {
    let data = new FormData();
    data.append("action", "join_UN");
    data.append("chk", chk);
    data.append("submit", "1");
    fetchNS("page=UN_status", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function resignWA() {
    let data = new FormData();
    data.append("action", "leave_UN");
    data.append("chk", chk);
    data.append("submit", "1");
    fetchNS("page=UN_status", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function clearDossier() {
    let data = new FormData();
    data.append("chk", chk);
    data.append("clear_dossier", "1");
    fetchNS("page=dossier", "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
async function appointRO(region) {
    let data = new FormData();
    data.append("page", "region_control");
    data.append("region", region);
    data.append("chk", chk);
    data.append("nation", currentNation);
    data.append("office_name", config.officerName);
    data.append("authority_A", "on");
    data.append("authority_C", "on");
    data.append("authority_E", "on");
    data.append("authority_P", "on");
    data.append("editofficer", "1");
    fetchNS(`page=region_control/region=${region}`, "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
}
function addCSS(css) {
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

${config.styles?.dark &&
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
}`}

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
if ((location.pathname.includes("template-overall=none") ||
    location.pathname.includes("page=ajax2")) &&
    !location.pathname.includes("page=blank")) {
    document.head.append(!document.querySelectorAll('meta[name="viewport"]').length &&
        createElement("meta", {
            name: "viewport",
            content: "width=device-width,initial-scale=1.0",
        }));
    addCSS(styles);
}
if (location.pathname.includes("template-overall=none") &&
    location.pathname.includes("nation=")) {
    addCSS(nationStyles);
}
/* KEYBINDS */
document.addEventListener("keydown", (event) => {
    if (event.key === " " && event.target === document.body) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.addEventListener("keyup", (event) => {
    if (disableKeybinds) {
        return;
    }
    const target = event.target;
    if (target.tagName == "INPUT" ||
        target.tagName == "SELECT" ||
        target.tagName == "TEXTAREA" ||
        target.isContentEditable) {
        return;
    }
    switch (event.key) {
        case config.keybinds.reports:
            location.assign(location.pathname.includes("page=reports")
                ? "https://www.nationstates.net/page=ajax2/a=reports/view=world/filter=move+member+endo"
                : "https://www.nationstates.net/template-overall=none/page=reports");
            break;
        case config.keybinds.updated:
            location.assign("https://www.nationstates.net/page=ajax2/a=reports/view=self/filter=change");
            break;
        case config.keybinds.toggle:
            if (location.pathname.includes("template-overall=none")) {
                location.replace(location.href.replaceAll("/template-overall=none", ""));
            }
            else {
                location.replace(`/template-overall=none${location.pathname}${location.search}${location.hash}`);
            }
            break;
        case config.keybinds.moveJP:
            disableKeybinds = true;
            move(config.jumpPoint.toLowerCase().replaceAll(" ", "_")).then(() => {
                disableKeybinds = false;
                alert(`Moved back to ${config.jumpPoint}.`);
            });
            break;
        case config.keybinds.move:
            if (location.pathname.includes("/region=")) {
                document.querySelector("button[name=move_region]").click();
            }
            else {
                let region = document.querySelector("li a:nth-of-type(3)").textContent;
                disableKeybinds = true;
                move(region.toLowerCase().replaceAll(" ", "_")).then(() => {
                    disableKeybinds = false;
                    alert(`Moved to ${region}`);
                });
            }
            break;
        case config.keybinds.endorse:
            if (location.pathname.includes("/nation=")) {
                document.querySelector("button.endorse").click();
            }
            else {
                document.querySelector("button[data-action=endorse]:not([disabled])").click();
            }
            break;
        case config.keybinds.doss:
            if (location.pathname.includes("/nation=")) {
                document.querySelector("button[name=action][value=add]").click();
            }
            else {
                document.querySelector("button[data-action=doss]:not([disabled])").click();
            }
            break;
        case config.keybinds.viewDossier:
            location.assign("/template-overall=none/page=dossier");
            break;
        case config.keybinds.clearDossier:
            disableKeybinds = true;
            clearDossier().then(() => {
                disableKeybinds = false;
                dossed = [];
                document
                    .querySelectorAll("button.dossed")
                    .forEach((button) => {
                    button.disabled = false;
                    button.classList.remove("dossed");
                });
                alert("Cleared dossier.");
            });
            break;
        case config.keybinds.appointRO:
            if (location.pathname.includes("/region=")) {
                const region = location.pathname.match(/\/region=(?<region>.*)\/?/)
                    .groups.region;
                disableKeybinds = true;
                appointRO(region).then(() => {
                    disableKeybinds = false;
                    alert(`Appointed ${currentNation} as RO in ${region}`);
                });
            }
            break;
        case config.keybinds.apply:
            disableKeybinds = true;
            applyWA().then(() => {
                disableKeybinds = false;
                alert("Applied to the World Assembly.");
            });
            break;
        case config.keybinds.resign:
            disableKeybinds = true;
            resignWA().then(() => {
                disableKeybinds = false;
                alert("Resigned from the World Assembly.");
            });
            break;
        case config.keybinds.joinWA:
            document.querySelector("form[action='/cgi-bin/join_un.cgi'] button[type='submit']").click();
            break;
        case config.keybinds.reload:
            disableKeybinds = true;
            location.reload();
            break;
        case config.keybinds.back:
            history.back();
            break;
        case config.keybinds.forward:
            history.forward();
            break;
    }
});
