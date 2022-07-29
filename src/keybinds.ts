import config from "./config";
import {
	applyWA,
	appointRO,
	clearDossier,
	currentNation,
	move,
	resignWA,
	showToast,
} from "./utils";
import { quickDoss, quickEndo } from "./main";

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

document.addEventListener("keyup", (event) => {
	if (disableKeybinds) {
		showToast("Previous request not yet completed.", ["error"]);
		return;
	}

	const target = event.target as HTMLElement;
	if (
		target.tagName == "INPUT" ||
		target.tagName == "SELECT" ||
		target.tagName == "TEXTAREA" ||
		target.isContentEditable
	) {
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

async function handleKeystroke(key: string) {
	if (key === config.keybinds.reports) {
		location.assign(
			location.pathname.includes("page=reports")
				? "/page=ajax2/a=reports/view=world/filter=move+member+endo"
				: "/template-overall=none/page=reports",
		);
	} else if (key === config.keybinds.updated) {
		location.assign("/page=ajax2/a=reports/view=self/filter=change");
	} else if (key === config.keybinds.toggle) {
		location.replace(
			location.pathname.includes("template-overall=none")
				? location.pathname.replaceAll("/template-overall=none", "")
				: `/template-overall=none${location.pathname}${location.search}${location.hash}`,
		);
	} else if (key === config.keybinds.moveJP) {
		await move(config.jumpPoint);
		showToast(`Moved back to ${config.jumpPointName}.`, ["success"]);
		movedBack = true;
	} else if (key === config.keybinds.move) {
		if (location.pathname.includes("/region=")) {
			(
				document.querySelector("button[name=move_region]") as HTMLButtonElement
			).click();
		} else {
			let region = document.querySelector(
				"li a.rlink:nth-of-type(3)",
			).textContent;
			await move(region.toLowerCase().replaceAll(" ", "_"));
			showToast(`Moved to ${region}`, ["success"]);
		}
	} else if (key === config.keybinds.endorse) {
		if (location.pathname.includes("/nation=")) {
			(document.querySelector("button.endorse") as HTMLButtonElement).click();
		} else if (
			/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(
				location.pathname,
			)
		) {
			await quickEndo(
				document.querySelector("button[data-action=endorse]:not([disabled])")
					.id,
			);
		}
	} else if (
		key === config.keybinds.doss &&
		location.pathname.includes("/nation=")
	) {
		(
			document.querySelector(
				"button[name=action][value=add]",
			) as HTMLButtonElement
		).click();
	} else if (
		key === config.keybinds.doss &&
		/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(
			location.pathname,
		)
	) {
		await quickDoss(
			document.querySelector("button[data-action=doss]:not([disabled])").id,
		);
	} else if (key === config.keybinds.viewDossier) {
		location.assign("/template-overall=none/page=dossier");
	} else if (key === config.keybinds.clearDossier) {
		await clearDossier();
		document
			.querySelectorAll("button.dossed")
			.forEach((button: HTMLButtonElement) => {
				button.disabled = false;
				button.classList.remove("dossed");
			});
		showToast("Cleared dossier.", ["success"]);
		dossCleared = true;
	} else if (
		key === config.keybinds.appointRO &&
		location.pathname.includes("/region=")
	) {
		const region = location.pathname.match(/\/region=(?<region>.*)\/?/).groups
			.region;
		await appointRO(region);
		showToast(`Appointed ${currentNation} as RO in ${region}`, ["success"]);
	} else if (key === config.keybinds.global) {
		location.assign("/page=ajax2/a=reports/view=world/filter=change");
	} else if (key === config.keybinds.apply) {
		await applyWA();
		showToast("Applied to the World Assembly.", ["success"]);
		applied = true;
	} else if (key === config.keybinds.resign) {
		await resignWA();
		showToast("Resigned from the World Assembly.", ["success"]);
		resigned = true;
	} else if (key === config.keybinds.prep) {
		if (!resigned) {
			await resignWA();
			showToast("Resigned from the World Assembly.", ["success"]);
			resigned = true;
		} else if (!applied) {
			await applyWA();
			showToast("Applied to the World Assembly.", ["success"]);
			applied = true;
		} else if (!dossCleared) {
			await clearDossier();
			document
				.querySelectorAll("button.dossed")
				.forEach((button: HTMLButtonElement) => {
					button.disabled = false;
					button.classList.remove("dossed");
				});
			showToast("Cleared dossier.", ["success"]);
			dossCleared = true;
		} else if (!movedBack) {
			await move(config.jumpPoint);
			showToast(`Moved back to ${config.jumpPointName}.`, ["success"]);
			movedBack = true;
		} else {
			showToast("Already prepped.");
		}
	} else if (key === config.keybinds.joinWA) {
		(
			document.querySelector(
				"form[action='/cgi-bin/join_un.cgi'] button[type='submit']",
			) as HTMLButtonElement
		).click();
	} else if (key === config.keybinds.reload) {
		location.reload();
	} else if (key === config.keybinds.back) {
		history.back();
	} else if (key === config.keybinds.forward) {
		history.forward();
	} else if (key === config.keybinds.copy) {
		navigator.clipboard.writeText(location.href);
	} else if (key === config.keybinds.endoActivity) {
		location.assign(
			`/page=ajax2/a=reports/view=region.${config.jumpPoint}/filter=member/action=endo`,
		);
	} else if (config.keybinds.dossPoints.includes(key)) {
		const index = config.keybinds.dossPoints.indexOf(key);
		if (index < config.dossPoints.length) {
			location.assign(
				`/page=ajax2/a=reports/view=region.${config.dossPoints[index]}/filter=member/action=doss`,
			);
		}
	}

	return true;
}
