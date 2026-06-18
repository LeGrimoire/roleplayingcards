
export function is_storage_available(type) {
	let storage = window[type],
		x = '__storage_test__';
	try {
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return e instanceof DOMException && (
			// Everything except Firefox
			e.code === 22 ||
			// Firefox
			e.code === 1014 ||
			// Test name field too, because code might not be present
			// Everything except Firefox
			e.name === 'QuotaExceededError' ||
			// Firefox
			e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// Acknowledge QuotaExceededError only if there's something already stored
			storage.length !== 0;
	}
}
