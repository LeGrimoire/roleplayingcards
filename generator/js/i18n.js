
import { is_storage_available } from './storage.js';

let local = 'fr';
export let I18N = {};

/**
 * @param {string} id
 */
function getText(id) {
	let symbols = id.split('.');
	let child = this;
	for (let i = 0; i < symbols.length; i++) {
		if (!child.hasOwnProperty(symbols[ i ]))
			return '';
		child = child[ symbols[ i ] ];
	}
	return child;
}

export async function updateLang(value) {
	try {
		local = value;
		$('html').attr('lang', local);

		if (is_storage_available('localStorage') && window.localStorage) {
			localStorage.setItem('local', local);
		}

		const module = await import('./i18n_' + local + '.js');
		I18N = module.I18N;
		I18N.get = getText;
	} catch (e) {
		// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
		console.error(e.stack);
	}
}

export async function loadLocal() {
	try {
		if (is_storage_available('localStorage') && window.localStorage) {
			local = localStorage.getItem('local') || local;
		}

		$('html').attr('lang', local);

		const module = await import('./i18n_' + local + '.js');
		I18N = module.I18N;
		I18N.get = getText;
	} catch (e) {
		// TODO GREGOIRE: If the local store load failed notify the user that the loading failed
		console.error(e.stack);
	}
}
