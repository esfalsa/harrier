// ==UserScript==
// @name        harrier
// @description Key bindings and shortcuts for NationStates.
// @namespace   github.com/esfalsa
// @match       *://*.nationstates.net/*
// @run-at      document-start
// @updateURL   https://github.com/esfalsa/harrier/raw/main/dist/harrier.user.js
// @downloadURL https://github.com/esfalsa/harrier/raw/main/dist/harrier.user.js
// @homepageURL https://esfalsa.github.io/harrier/
// @version     0.2.1
// @author      Pronoun
// @license     AGPL-3.0-or-later
// @grant       none
// ==/UserScript==
var version = "0.2.1";

const config = {
    version: version,
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
    get jumpPoint() {
        return config.jumpPointName.toLowerCase().replaceAll(" ", "_");
    },
    get dossPoints() {
        return config.dossPointNames.map((name) => name.toLowerCase().replaceAll(" ", "_"));
    },
};

const siteData = {
    currentNation: null,
    dossed: null,
};
let localid;
let chk;
async function initialize() {
    if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(location.pathname) || // quick endo
        location.pathname.includes("page=reports") // preload for chasing moves
    ) {
        [siteData.currentNation, localid] = await getLocalId();
    }
    else {
        [chk, siteData.dossed] = await getChkDoss();
    }
}
async function loadRemaining() {
    if (!siteData.currentNation && !localid) {
        [siteData.currentNation, localid] = await getLocalId();
    }
    else if (!chk && !siteData.dossed) {
        [chk, siteData.dossed] = await getChkDoss();
    }
}
function createElement(tagName, properties = {}) {
    return Object.assign(document.createElement(tagName), properties);
}
async function fetchNS(pathname, searchParams = "", options = {}) {
    const search = new URLSearchParams(searchParams);
    search.append("user-agent", config.userAgent);
    const resource = Object.assign(new URL(pathname, "https://www.nationstates.net"), {
        search: search,
    });
    options.headers = { ...options.headers, "User-Agent": config.userAgent };
    options.redirect = "manual";
    return fetch(resource, options);
}
async function postNS(endpoint, data) {
    const payload = new FormData();
    if ("chk" in data && !chk) {
        await loadRemaining();
        showToast("Code chk not loaded. Please try again.");
        throw new Error("Chk not loaded.");
    }
    else if ("localid" in data && !localid) {
        await loadRemaining();
        showToast("Code localid not loaded. Please try again.");
        throw new Error("LocalId not loaded.");
    }
    for (const [key, value] of Object.entries(data)) {
        payload.append(key, value);
    }
    return fetchNS(endpoint, "", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: payload,
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
    const response = await (await fetchNS("template-overall=none/page=create_region")).text();
    return [
        response.match(/<a href="nation=(?<nation>.+)" class="nlink">/).groups
            .nation,
        response.match(/<input type="hidden" name="localid" value="(?<localid>.+)">/).groups.localid,
    ];
}
/* ACTIONS */
async function doss(nation) {
    await postNS("template-overall=none/page=dossier", {
        nation: nation,
        chk: chk,
        action: "add",
    });
}
async function endo(nation) {
    await postNS("cgi-bin/endorse.cgi", {
        nation: nation,
        localid: localid,
        action: "endorse",
    });
}
async function move(region) {
    await postNS("template-overall=none/page=change_region", {
        localid: localid,
        region_name: region,
        move_region: "1",
    });
}
async function applyWA() {
    await postNS("template-overall=none/page=UN_status", {
        action: "join_UN",
        chk: chk,
        submit: "1",
    });
}
async function resignWA() {
    await postNS("template-overall=none/page=UN_status", {
        action: "leave_UN",
        chk: chk,
        submit: "1",
    });
}
async function clearDossier() {
    await postNS("template-overall=none/page=dossier", {
        chk: chk,
        clear_dossier: "1",
    });
}
async function appointRO(region) {
    await postNS(`page=region_control/region=${region}`, {
        page: "region_control",
        region: region,
        chk: chk,
        nation: siteData.currentNation,
        office_name: config.officerName,
        authority_A: "on",
        authority_C: "on",
        authority_E: "on",
        authority_P: "on",
        editofficer: "1",
    });
}
document.body.appendChild(createElement("div", {
    id: "toast-container",
}));
function showToast(text, styles = []) {
    const toast = createElement("div", {
        textContent: text,
        className: ["toast", ...styles].join(" "),
    });
    toast.style.maxHeight = "0";
    toast.style.paddingTop = "0";
    toast.style.paddingBottom = "0";
    toast.style.opacity = "0";
    toast.style.marginBottom = "0";
    document.querySelector("#toast-container").prepend(toast);
    setTimeout(() => {
        toast.removeAttribute("style");
    }, 100);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 1500);
    }, 1500);
}

var css$2 = "h1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n\tcolor: var(--headingColor);\n}\n\na {\n\tcolor: var(--linkColor);\n}\n\ninput {\n\tfont-size: 1rem; /* Prevent iOS from zooming in to text box when focused. */\n\tfont-family: var(--fontSans);\n\tcolor: var(--headingColor);\n\tbackground-color: var(--linkBackground);\n\tpadding: 0.25rem 0.5rem;\n\tborder-radius: 0.25rem;\n\tborder: none;\n\tbox-shadow: var(--shadowInner), var(--shadow);\n\tcursor: pointer;\n}\n\nul,\nbody {\n\tlist-style-type: none;\n\tpadding-left: 0;\n}\n\nli {\n\tmargin: 0.5rem 0;\n\tmin-height: 1.5rem;\n}\n\n.rlink {\n\tcolor: var(--regionColor);\n\tdisplay: inline-block;\n}\n\n.nlink {\n\tcolor: var(--nationColor);\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 0.25rem;\n}\n\n.rlink,\n.nlink {\n\tbackground-color: var(--linkBackground);\n\tfont-weight: bold;\n\ttext-decoration: none;\n\tpadding: 0.25rem 0.5rem;\n\tborder-radius: 0.25rem;\n\tbox-shadow: var(--shadow);\n}\n\nbutton,\ninput[type=\"button\"],\ninput[type=\"submit\"] {\n\tfont-family: var(--fontSans);\n\tfont-size: 1rem;\n\tcolor: var(--text-color);\n\tbackground-color: var(--linkBackground);\n\tpadding: 0.25rem 0.5rem;\n\tborder-radius: 0.25rem;\n\tfont-weight: bold;\n\tborder: none;\n\tbox-shadow: var(--shadow);\n\tcursor: pointer;\n}\n\nbutton:disabled,\ninput[type=\"button\"]:disabled,\ninput[type=\"submit\"]:disabled {\n\topacity: 0.5;\n}\n\nbutton[data-action] {\n\tmargin-left: 0.5rem;\n\tfont-weight: normal;\n}\n\nimg.miniflag {\n\theight: 11px;\n}\n\nimg.smallflag {\n\tmax-height: 26px;\n}\n\n.newflagbox a img {\n\tmax-height: 60px;\n}\n";

var css$1 = ".newmainlinebox {\n\tdisplay: inline-block;\n}\n\n.newmainlinebubble {\n\tdisplay: inline-flex;\n\tflex-direction: row;\n\tgap: 0.25rem;\n\talign-items: center;\n\tmargin-right: 1.5rem;\n}\n\n.newmainlinebubbletop {\n\tfont-weight: bold;\n}\n.newmainlinebubbletop::after {\n\tcontent: \":\";\n}\n\n.newmainlinebubblebottom[style] {\n\tcolor: transparent;\n\t-webkit-background-clip: text !important;\n\tbackground-clip: text;\n}\n\n.lineundercover,\n.newnonflagstuff {\n\tdisplay: flex;\n\tflex-direction: row;\n\talign-items: center;\n\tgap: 1rem;\n}\n\n.newtitlepretitle,\n.newtitlename,\n.newtitlecategory {\n\tdisplay: inline-block;\n\tfont-size: 1.5rem;\n}\n\n.newtitlename {\n\tfont-weight: bold;\n}\n\n.newtitlecategory {\n\topacity: 0.5;\n}\n\n.newtitlecategory::before {\n\tcontent: \"(\";\n}\n.newtitlecategory::after {\n\tcontent: \")\";\n}\n\n#nationcover,\n#badge_rack,\n#trophycabinet,\n.newsloganbox,\n.nationnavbar,\n.nationsummarybox,\n.nationsummary,\n.trophyline,\n#tgcompose,\n.newsbox > p.smalltext {\n\tdisplay: none;\n}\n";

var css = ":root {\n\t--fontSans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,\n\t\t\"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif,\n\t\t\"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n\t--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n\t--shadowInner: inset 0 2px 4px 0 rgb(0 0 0 / 0.075);\n\tfont-family: var(--fontSans);\n\tcolor: var(--textColor);\n\tbackground-color: var(--backgroundColor);\n}\n\n#toast-container {\n\tz-index: 100;\n\tfont-family: var(--fontSans);\n\tfont-size: 1rem;\n\tposition: fixed;\n\ttop: 1rem;\n\tright: 1rem;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: flex-end;\n}\n\n.toast {\n\tbackground-color: var(--textColor);\n\tcolor: var(--backgroundColor);\n\ttransform: translate(0px, 0px);\n\tpadding: 0.5rem;\n\tborder-radius: 0.5rem;\n\tbox-shadow: var(--shadow);\n\ttransition: 0.25s ease-in-out;\n\ttransition-property: all;\n\tmax-width: 50vw;\n\tline-height: 1.2;\n\tmax-height: calc(1.2em + 1rem);\n\ttext-overflow: ellipsis;\n\toverflow: hidden;\n\twhite-space: nowrap;\n\tmargin-bottom: 0.5rem;\n}\n\n.toast.success {\n\tbackground-color: var(--successColor);\n}\n\n.toast.error {\n\tbackground-color: var(--errorColor);\n}\n";

const root = document.documentElement.style;
if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    for (const [name, value] of Object.entries(config.styles.dark)) {
        root.setProperty(`--${name}`, value);
    }
}
else {
    for (const [name, value] of Object.entries(config.styles.light)) {
        root.setProperty(`--${name}`, value);
    }
}
function addCSS(css) {
    document.head.appendChild(document.createElement("style")).innerHTML = css;
}
addCSS(css);
if (!document.querySelectorAll('meta[name="viewport"]').length) {
    document.head.append(createElement("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1.0",
    }));
}
if ((location.pathname.includes("template-overall=none") ||
    location.pathname.includes("page=ajax2")) &&
    !location.pathname.includes("page=blank")) {
    addCSS(css$2);
}
if (location.pathname.includes("template-overall=none") &&
    location.pathname.includes("nation=")) {
    addCSS(css$1);
}

/* QUICK ENDO */
async function quickEndo(nation) {
    document
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = true));
    await endo(nation);
    document
        .querySelectorAll(`[id="${nation}"]`)
        .forEach((button) => button.classList.add("endorsed"));
    document
        .querySelectorAll("button:not(.endorsed)")
        .forEach((button) => (button.disabled = false));
}
function initializeQuickEndo() {
    const happenings = document.querySelectorAll("li[id^='happening-']");
    happenings.forEach((happening) => {
        if (happening.textContent?.includes("was admitted to the World Assembly") ||
            happening.textContent?.includes("endorsed")) {
            const nation = happening
                ?.querySelector(".nnameblock")
                .textContent.toLowerCase()
                .replaceAll(" ", "_");
            if (nation !== siteData.currentNation) {
                const button = createElement("button", {
                    textContent: "Endo",
                    id: nation,
                });
                button.dataset.action = "endorse";
                happening.querySelector(".nlink").after(button);
                button.addEventListener("click", () => {
                    void quickEndo(nation);
                });
            }
        }
    });
}
/* QUICK DOSS */
async function quickDoss(nation) {
    document
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = true));
    await doss(nation);
    showToast(`Added ${nation} to dossier`, ["success"]);
    document
        .querySelectorAll(`[id="${nation}"]`)
        .forEach((button) => button.classList.add("dossed"));
    document
        .querySelectorAll("button:not(.dossed)")
        .forEach((button) => (button.disabled = false));
}
function initializeQuickDoss() {
    document.querySelectorAll("a.nlink").forEach((link) => {
        const nation = link
            .querySelector(".nnameblock")
            .textContent.toLowerCase()
            .replaceAll(" ", "_");
        const button = createElement("button", {
            textContent: "Doss",
            id: nation,
            disabled: siteData.dossed.includes(nation),
        });
        button.dataset.action = "doss";
        if (siteData.dossed.includes(nation)) {
            button.classList.add("dossed");
        }
        link.after(button);
        button.addEventListener("click", () => {
            void quickDoss(nation);
        });
    });
}
/* REPORTS LOAD TIME */
function timePerformance() {
    const duration = performance.getEntriesByType("navigation")[0].duration;
    if (!duration) {
        setTimeout(timePerformance, 0);
    }
    else {
        document.querySelector("h1").textContent += ` (${duration.toFixed(1)}ms)`;
    }
}
if (location.pathname.includes("page=reports")) {
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
/* SCROLLING */
window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
});

let disableKeybinds = false;
// track prep progress
let resigned = false;
let applied = false;
let dossCleared = false;
let movedBack = false;
/* KEYBINDS */
document.addEventListener("keydown", (event) => {
    if (event.key === " " && event.target === document.body) {
        event.preventDefault();
        event.stopPropagation();
    }
});
function initializeKeybinds() {
    document.addEventListener("keyup", (event) => {
        if (disableKeybinds) {
            showToast("Previous request not yet completed.", ["error"]);
            return;
        }
        const target = event.target;
        if (target.tagName == "INPUT" ||
            target.tagName == "SELECT" ||
            target.tagName == "TEXTAREA" ||
            target.isContentEditable) {
            return;
        }
        disableKeybinds = true;
        handleKeystroke(event.key)
            .then(() => {
            disableKeybinds = false;
        })
            .catch((e) => {
            console.error(e);
            disableKeybinds = false;
        });
    });
}
async function handleKeystroke(key) {
    if (key === config.keybinds.reports) {
        location.assign(location.pathname.includes("page=reports")
            ? "/page=ajax2/a=reports/view=world/filter=move+member+endo"
            : "/template-overall=none/page=reports");
    }
    else if (key === config.keybinds.updated) {
        location.assign("/page=ajax2/a=reports/view=self/filter=change");
    }
    else if (key === config.keybinds.toggle) {
        location.replace(location.pathname.includes("template-overall=none")
            ? location.pathname.replaceAll("/template-overall=none", "")
            : `/template-overall=none${location.pathname}${location.search}${location.hash}`);
    }
    else if (key === config.keybinds.moveJP) {
        await move(config.jumpPoint);
        showToast(`Moved back to ${config.jumpPointName}.`, ["success"]);
        movedBack = true;
    }
    else if (key === config.keybinds.move) {
        if (location.pathname.includes("/region=")) {
            const moveButton = document.querySelector("button[name=move_region]");
            moveButton.click();
        }
        else {
            const region = document.querySelector("li a.rlink:nth-of-type(3)").textContent;
            await move(region.toLowerCase().replaceAll(" ", "_"));
            showToast(`Moved to ${region}`, ["success"]);
        }
    }
    else if (key === config.keybinds.endorse) {
        if (location.pathname.includes("/nation=")) {
            const endorseButton = document.querySelector("button.endorse");
            endorseButton.click();
        }
        else if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(location.pathname)) {
            await quickEndo(document.querySelector("button[data-action=endorse]:not([disabled])")
                .id);
        }
    }
    else if (key === config.keybinds.doss &&
        location.pathname.includes("/nation=")) {
        const dossButton = document.querySelector("button[name=action][value=add]");
        dossButton.click();
    }
    else if (key === config.keybinds.doss &&
        /\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(location.pathname)) {
        await quickDoss(document.querySelector("button[data-action=doss]:not([disabled])").id);
    }
    else if (key === config.keybinds.viewDossier) {
        location.assign("/template-overall=none/page=dossier");
    }
    else if (key === config.keybinds.clearDossier) {
        await clearDossier();
        document
            .querySelectorAll("button.dossed")
            .forEach((button) => {
            button.disabled = false;
            button.classList.remove("dossed");
        });
        showToast("Cleared dossier.", ["success"]);
        dossCleared = true;
    }
    else if (key === config.keybinds.appointRO &&
        location.pathname.includes("/region=")) {
        const region = location.pathname.match(/\/region=(?<region>.*)\/?/).groups
            .region;
        await appointRO(region);
        showToast(`Appointed ${siteData.currentNation} as RO in ${region}`, [
            "success",
        ]);
    }
    else if (key === config.keybinds.global) {
        location.assign("/page=ajax2/a=reports/view=world/filter=change");
    }
    else if (key === config.keybinds.apply) {
        await applyWA();
        showToast("Applied to the World Assembly.", ["success"]);
        applied = true;
    }
    else if (key === config.keybinds.resign) {
        await resignWA();
        showToast("Resigned from the World Assembly.", ["success"]);
        resigned = true;
    }
    else if (key === config.keybinds.prep) {
        if (!resigned) {
            await resignWA();
            showToast("Resigned from the World Assembly.", ["success"]);
            resigned = true;
        }
        else if (!applied) {
            await applyWA();
            showToast("Applied to the World Assembly.", ["success"]);
            applied = true;
        }
        else if (!dossCleared) {
            await clearDossier();
            document
                .querySelectorAll("button.dossed")
                .forEach((button) => {
                button.disabled = false;
                button.classList.remove("dossed");
            });
            showToast("Cleared dossier.", ["success"]);
            dossCleared = true;
        }
        else if (!movedBack) {
            await move(config.jumpPoint);
            showToast(`Moved back to ${config.jumpPointName}.`, ["success"]);
            movedBack = true;
        }
        else {
            showToast("Already prepped.");
        }
    }
    else if (key === config.keybinds.joinWA) {
        const joinButton = document.querySelector("form[action='/cgi-bin/join_un.cgi'] button[type='submit']");
        joinButton.click();
    }
    else if (key === config.keybinds.reload) {
        location.reload();
    }
    else if (key === config.keybinds.back) {
        history.back();
    }
    else if (key === config.keybinds.forward) {
        history.forward();
    }
    else if (key === config.keybinds.copy) {
        await navigator.clipboard.writeText(location.href);
    }
    else if (key === config.keybinds.endoActivity) {
        location.assign(`/page=ajax2/a=reports/view=region.${config.jumpPoint}/filter=member/action=endo`);
    }
    else if (config.keybinds.dossPoints.includes(key)) {
        const index = config.keybinds.dossPoints.indexOf(key);
        if (index < config.dossPoints.length) {
            location.assign(`/page=ajax2/a=reports/view=region.${config.dossPoints[index]}/filter=member/action=doss`);
        }
    }
    return true;
}

initialize()
    .then(() => {
    if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(location.pathname)) {
        initializeQuickEndo();
    }
    else if (/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(location.pathname)) {
        initializeQuickDoss();
    }
    initializeKeybinds();
})
    .catch((error) => {
    console.error(error);
});
