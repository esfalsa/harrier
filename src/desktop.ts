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
		move(config.jumpPoint).then(() => {
			alert(`Moved back to ${config.jumpPointName}.`);
		});
	} else if (key === config.keybinds.move) {
		if (location.pathname.includes("/region=")) {
			(
				document.querySelector("button[name=move_region]") as HTMLButtonElement
			).click();
		} else {
			let region = document.querySelector(
				"li a.rlink:nth-of-type(3)",
			).textContent;
			move(region.toLowerCase().replaceAll(" ", "_")).then(() => {
				alert(`Moved to ${region}`);
			});
		}
	} else if (key === config.keybinds.endorse) {
		if (location.pathname.includes("/nation=")) {
			(document.querySelector("button.endorse") as HTMLButtonElement).click();
		} else if (
			/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(
				location.pathname,
			)
		) {
			(
				document.querySelector(
					"button[data-action=endorse]:not([disabled])",
				) as HTMLButtonElement
			).click();
		} else {
			location.assign(
				`/page=ajax2/a=reports/view=region.${config.jumpPoint}/filter=member/action=endo`,
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
		(
			document.querySelector(
				"button[data-action=doss]:not([disabled])",
			) as HTMLButtonElement
		).click();
	} else if (key === config.keybinds.viewDossier) {
		location.assign("/template-overall=none/page=dossier");
	} else if (key === config.keybinds.clearDossier) {
		clearDossier().then(() => {
			document
				.querySelectorAll("button.dossed")
				.forEach((button: HTMLButtonElement) => {
					button.disabled = false;
					button.classList.remove("dossed");
				});
			alert("Cleared dossier.");
		});
	} else if (
		key === config.keybinds.appointRO &&
		location.pathname.includes("/region=")
	) {
		const region = location.pathname.match(/\/region=(?<region>.*)\/?/).groups
			.region;
		appointRO(region).then(() => {
			alert(`Appointed ${currentNation} as RO in ${region}`);
		});
	} else if (key === config.keybinds.apply) {
		applyWA().then(() => {
			alert("Applied to the World Assembly.");
		});
	} else if (key === config.keybinds.global) {
		location.assign("/page=ajax2/a=reports/view=world/filter=change");
	} else if (key === config.keybinds.resign) {
		resignWA().then(() => {
			alert("Resigned from the World Assembly.");
		});
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
