
import { is_storage_available } from './storage.js';

var local = 'en';
export var I18N = {};

export function updateLocal(value) {
	try {
		local = value;
		$('html').attr('lang', local);

		if (is_storage_available('localStorage') && window.localStorage) {
			localStorage.setItem('local', local);
		}
	} catch (e) {
		// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
		console.error(e.stack);
	}
}

async function loadLocal() {
	try {
		if (is_storage_available('localStorage') && window.localStorage) {
			local = localStorage.getItem('local') || local;
		}

		$('html').attr('lang', local);

		const module = await import('./i18n_' + local + '.js');
		I18N = module.I18N;
	} catch (e) {
		// TODO GREGOIRE: If the local store load failed notify the user that the loading failed
		console.error(e.stack);
	}
}

(async () => {
	await loadLocal();
})();
