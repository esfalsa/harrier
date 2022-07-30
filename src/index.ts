import "./utils";

import "./styles";
import "./keybinds";
import { initializeQuickDoss, initializeQuickEndo } from "./main";
import { initialize } from "./utils";
import { initializeKeybinds } from "./keybinds";

initialize()
	.then(() => {
		if (
			/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(
				location.pathname,
			)
		) {
			initializeQuickEndo();
		} else if (
			/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(
				location.pathname,
			)
		) {
			initializeQuickDoss();
		}

		initializeKeybinds();
	})
	.catch((error) => {
		console.error(error);
	});
