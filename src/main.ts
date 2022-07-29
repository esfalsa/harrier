import {
	createElement,
	currentNation,
	doss,
	dossed,
	endo,
	getChkDoss,
	getLocalId,
	showToast,
} from "./utils";

/* QUICK ENDO */
export async function quickEndo(nation) {
	document
		.querySelectorAll("button")
		.forEach((button) => (button.disabled = true));

	await endo(nation);
	document
		.querySelectorAll(`[id="${nation}"]`)
		.forEach((button) => button.classList.add("endorsed"));
	document
		.querySelectorAll("button:not(.endorsed)")
		.forEach((button: HTMLButtonElement) => (button.disabled = false));
}

export async function initializeQuickEndo() {
	let happenings = document.querySelectorAll("li[id^='happening-']");

	happenings.forEach((happening) => {
		if (
			happening.textContent?.includes("was admitted to the World Assembly") ||
			happening.textContent?.includes("endorsed")
		) {
			let nation = happening
				?.querySelector(".nnameblock")
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
					quickEndo(nation);
				});
			}
		}
	});
}

/* QUICK DOSS */
export async function quickDoss(nation: string) {
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
		.forEach((button: HTMLButtonElement) => (button.disabled = false));
}

export async function initializeQuickDoss() {
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
			quickDoss(nation);
		});
	});
}

/* REPORTS LOAD TIME */
function timePerformance() {
	const duration = performance.getEntriesByType("navigation")[0].duration;
	if (!duration) {
		setTimeout(timePerformance, 0);
	} else {
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
		.forEach((link: HTMLAnchorElement) => {
			link.href = `/template-overall=none/${link.getAttribute("href")}`;
		});
}

/* SCROLLING */
window.addEventListener("beforeunload", () => {
	window.scrollTo(0, 0);
});
