import { CardExamples } from '../data/card_examples.js';
import { CardLexicals } from '../data/card_lexicals.js';
import { CreatureCard } from './card_creature.js';
import { ItemCard } from './card_item.js';
import { PowerCard } from './card_power.js';
import { SpellCard } from './card_spell.js';
import { card_colors } from './colors.js';
import { Deck } from './deck.js';
import { I18N, updateLang } from './i18n.js';
import { icon_names } from './icons.js';
import { is_storage_available } from './storage.js';


/** @type {Deck[]} */
let g_decks = [];

let g_ui = {
	foldedSections: {},
	foldedBlocks: {},
	deckIdx: 0,
	cardIdx: 0,
	generateModalShown: false
};
let g_previousCardIdx = 0;
let g_dontRenderSelectedCard = false;
let g_isSmallLayout = false;
let g_canSave = false;



// ============================================================================
// Data save/load
// ============================================================================

function local_store_current_deck_save() {
	if (g_canSave && is_storage_available('localStorage') && window.localStorage) {
		try {
			localStorage.setItem('nbDecks', g_decks.length);
			if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length)
				localStorage.setItem('deck' + g_ui.deckIdx, g_decks[g_ui.deckIdx].stringify(false));
		} catch (e) {
			// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
			console.error(e.stack);
		}
	}
}

function local_store_decks_save() {
	if (g_canSave && is_storage_available('localStorage') && window.localStorage) {
		try {
			localStorage.setItem('nbDecks', g_decks.length);
			for (let i = 0; i < g_decks.length; i++) {
				localStorage.setItem('deck' + i, g_decks[i].stringify(false));
			}
		} catch (e) {
			// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
			console.error(e.stack);
		}
	}
}

function local_store_decks_load() {
	if (is_storage_available('localStorage') && window.localStorage) {
		try {
			const nbDecks = localStorage.getItem('nbDecks');
			for (let i = 0; i < nbDecks; i++) {
				if (g_decks[i])
					g_decks[i].clear();
				else
					g_decks[i] = new Deck();
				g_decks[i].load(JSON.parse(localStorage.getItem('deck' + i)));
			}
		} catch (e) {
			// TODO GREGOIRE: If the local store load failed notify the user that the loading failed
			console.error(e.stack);
		}
	}
}

function local_store_ui_save() {
	if (is_storage_available('localStorage') && window.localStorage) {
		try {
			localStorage.setItem('ui', JSON.stringify(g_ui));
		} catch (e) {
			// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
			console.error(e.stack);
		}
	}
}

function local_store_ui_load() {
	if (is_storage_available('localStorage') && window.localStorage) {
		try {
			g_ui = JSON.parse(localStorage.getItem('ui')) || g_ui;
		} catch (e) {
			// TODO GREGOIRE: If the local store load failed notify the user that the loading failed
			console.error(e.stack);
		}
	}
}


function update_lang() {
	$('#language-modal').modal('hide');

	let lang = $(this).attr('data-lang');

	// Save the desired lang
	updateLang(lang);

	// Reload the window with the choose lang
	location.reload();
}

/**
 * Event function that stop its progresion if it's a page up or page down key.
 * @param {JQuery.Event} evt
 */
function preventPageDownOrUp(evt) {
	if (evt.key === 'PageUp' || evt.key === 'PageDown') { // Pg up or down
		if (evt.preventDefault)
			evt.preventDefault();
	}
}


/**
 * Insert a new deck with the sample cards.
 */
function load_sample() {
	let deck = new Deck(I18N.get('UI.SAMPLE'));
	deck.addCards(0, CardExamples());
	g_decks = [deck].concat(g_decks);

	deck_list_update();
	deck_select_by_index(0);

	local_store_current_deck_save();
}

/**
 * Insert a new deck with the lexicals cards.
 */
function insert_lexical() {
	let deck = new Deck(I18N.get('UI.LEXICAL'));
	deck.addCards(0, CardLexicals());
	g_decks = [deck].concat(g_decks);

	deck_list_update();
	deck_select_by_index(0);

	local_store_current_deck_save();
}

/**
 * Open the output page with printed cards of all decks.
 */
function decks_generate() {
	if (g_decks.length === 0) {
		alert('You have no deck or load the sample deck.');
		return;
	}

	if (g_ui.generateModalShown === false) {
		$('#print-modal').modal('show');
		g_ui.generateModalShown = true;
	}

	let card_html = '';
	for (let i = 0; i < g_decks.length; i++) {
		let deck = g_decks[i];
	
		// Generate output HTML
		card_html += deck.generatePagesHtml();
	}

	// Open a new window for the output
	// Use a separate window to avoid CSS conflicts
	let tab = window.open('output.html', 'roleplayingcards-output');

	// Send the generated HTML to the new window
	// Use a delay to give the new window time to set up a message listener
	setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}

/**
 * Add all deck at the end of the list after loading it from a rpc.
 * @param {JQuery.Event} evt
 */
function decks_load_from_file(evt) {
	let files = evt.target.files;

	for (let i = 0; i < files.length; i++) {
		let reader = new FileReader();
		reader.onload = function () {
			let parsedObj = JSON.parse(this.result ? this.result.toString() : '');
			
			for (const deckJson of parsedObj) {
				let deck = new Deck();
				deck.load(deckJson);
				deck.options.filename = deck.options.name + '.json';
				g_decks.push(deck);
			}

			deck_list_update();
			deck_select_by_index(g_decks.length - 1);
		};
		reader.readAsText(files[i]);
	}

	// Reset file input
	$('#file-load-form')[0].reset();
	local_store_ui_save();
}

/**
 * Save the current deck to a file.
 */
function decks_save_to_file() {
	let decks = [];
	for (let i = 0; i < g_decks.length; i++) {
		decks.push(g_decks[i].stringify(true));
	}

	let parts = ['[\n', decks, ']'];
	let blob = new Blob(parts, { type: 'application/json' });
	let url = URL.createObjectURL(blob);

	let a = $('#file-save-link')[0];
	a.href = url;
	a.download = 'Decks.rpc';
	if (a.download && a.download !== 'null') {
		a.click();
	}

	setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}


// ============================================================================
// Decks helpers
// ============================================================================

/**
 * Select a deck upon list select event.
 */
function deck_select() {
	const couldSave = g_canSave;
	g_canSave = false;

	let decksList = $('#decks-list');
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length)
		decksList[0].children[g_ui.deckIdx].classList.remove('selected-deck');

	g_ui.deckIdx = this.value ? this.value : g_ui.deckIdx;
	
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length)
		decksList[0].children[g_ui.deckIdx].classList.add('selected-deck');

	local_store_ui_save();

	deck_update_ui();

	g_previousCardIdx = 0;
	card_list_update_ui();
	
	card_select_by_index(0);
	g_canSave = couldSave;
}

/**
 * @param {number} index
 */
function deck_select_by_index(index) {
	if (index < 0)
		index = 0;
	else if (index >= g_decks.length)
		index = g_decks.length - 1;

	$('#decks-list').val(index).change();
}

/**
 * Add a deck at the end of the list after loading it from a file.
 * @param {JQuery.Event} evt
 */
function deck_load_from_file(evt) {
	let files = evt.target.files;

	for (let i = 0; i < files.length; i++) {
		let reader = new FileReader();
		let file = files[i];
		reader.onload = function () {
			let parsedObj = JSON.parse(this.result ? this.result.toString() : '');

			let deck = new Deck();
			deck.options.filename = file.name;
			if (parsedObj.cards)
				deck.load(parsedObj);
			else
				deck.loadCards(parsedObj);

			g_decks.push(deck);

			deck_list_update();
			deck_select_by_index(g_decks.length - 1);
		};
		reader.readAsText(files[i]);
	}

	// Reset file input
	$('#file-load-form')[0].reset();
	local_store_ui_save();
}

/**
 * Save the current deck to a file.
 */
function deck_save_to_file() {
	if (g_ui.deckIdx < 0 || g_ui.deckIdx >= g_decks.length)
		return;

	let deck = g_decks[g_ui.deckIdx];
	let parts = [deck.stringify(true)];
	let blob = new Blob(parts, { type: 'application/json' });
	let url = URL.createObjectURL(blob);

	let a = $('#file-save-link')[0];
	a.href = url;
	deck.options.filename = deck.options.filename || deck.options.name + '.json';
	a.download = prompt('Filename:', deck.options.filename);
	if (a.download && a.download !== 'null') {
		deck.options.filename = [a.download];

		local_store_ui_save();
		a.click();
	}

	setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

/**
 * Add a new deck at the end of the list.
 */
function deck_new() {
	let newDeck = new Deck('Deck ' + (g_decks.length + 1));
	g_decks.push(newDeck);

	deck_list_update();
	deck_select_by_index(g_decks.length - 1);

	local_store_current_deck_save();
}

/**
 * Remove the current deck from the list.
 */
function deck_delete() {
	g_decks.splice(g_ui.deckIdx, 1);

	let selectedIdx = g_ui.deckIdx - 1;
	if (selectedIdx < 0)
		selectedIdx = 0;
		
	deck_list_update();
	deck_select_by_index(selectedIdx);

	local_store_current_deck_save();
}

/**
 * Sort cards in the deck.
 */
function deck_sort_execute() {
	$('#sort-modal').modal('hide');

	let code = $('#sort-function').val().toString();

	g_decks[g_ui.deckIdx].sort(code);

	card_list_update_ui();
	card_update_ui();
}

/**
 * Remove cards which does not corresponds to the filtering code.
 */
function deck_filter_execute() {
	$('#filter-modal').modal('hide');

	let code = $('#filter-function').val().toString();

	g_decks[g_ui.deckIdx].filter(code);

	card_list_update_ui();
	card_update_ui();
}

/**
 * Open the output page with printed cards of the current deck.
 */
function deck_generate() {
	let deck = g_decks[g_ui.deckIdx];
	if (deck.cards.length === 0) {
		alert('Your deck is empty. Please define some cards first, or load the sample deck.');
		return;
	}

	if (g_ui.generateModalShown === false) {
		$('#print-modal').modal('show');
		g_ui.generateModalShown = true;
	}

	// Generate output HTML
	let card_html = deck.generatePagesHtml();

	// Open a new window for the output
	// Use a separate window to avoid CSS conflicts
	let tab = window.open('output.html', 'roleplayingcards-output');

	// Send the generated HTML to the new window
	// Use a delay to give the new window time to set up a message listener
	setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}

/**
 * Change an option of the selected deck. The element which has this change function must have a 'data-property' attribute. 
 */
function deck_option_change() {
	let deck = g_decks[g_ui.deckIdx];
	let value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();
	
	let property = $(this).attr('data-property');
	deck.options[property] = value;
	card_render();
}

/**
 * Change the title of selected deck and update it in the decks list.
 */
function deck_name_change() {
	let deck = g_decks[g_ui.deckIdx];

	deck.options.name = $(this).val();
	
	let decksList = $('#decks-list');
	decksList[0].children[g_ui.deckIdx].text = deck.options.name;

	card_render();
}

/**
 * Change a property of the default type in the selected deck. The element which has this change function must have a 'data-property' attribute. 
 */
function deck_default_property_change() {
	let deck = g_decks[g_ui.deckIdx];
	let value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();

	let cardType = $('#default-card-type').val();
	let property = $(this).attr('data-property');
	deck.options.cardsDefault[cardType][property] = value;
	card_render();
}

/**
 * Update a color-selector and call deck_default_color_set with the corresponding property. The element must have the 'data-property' attribute.
 */
function deck_default_color_change() {
	let color = $(this).val();

	if ($('#' + this.id + '-selector option[value=\'' + color + '\']').length > 0) {
		// Update the color selector to the entered value
		$('#' + this.id + '-selector').colorselector('setColor', color);
	} else {
		let property = $(this).attr('data-property');
		deck_default_color_set(color, property);
	}
}

/**
 * Update a color property of the default type in the selected deck.
 * @param {string} color In the format '#RRGGBB'
 * @param {string} property
 */
function deck_default_color_set(color, property) {
	let deck = g_decks[g_ui.deckIdx];
	let cardType = $('#default-card-type').val();
	deck.options.cardsDefault[cardType][property] = color;
	card_list_update_ui();
	card_update_ui();
}

/**
 * Empty the cards list and add an option for each card in the selected deck.
 */
function deck_list_update() {
	let decksList = $('#decks-list');
	decksList.empty();

	for (let i in g_decks) {
		let deck = g_decks[i];

		let deckOption = $('<option></option>');
		deckOption.attr('value', i).text(deck.options.name);
		deckOption.removeClass('selected-deck');

		decksList.append(deckOption);
	}
	
	if (g_decks.length === 0) {
		$('#decks-list').attr('disabled', true);
		g_ui.deckIdx = 0;
	} else {
		$('#decks-list').attr('disabled', false);
		deck_select_by_index(g_ui.deckIdx);
	}
}

/**
 * Update ui with the selected default type.
 */
function deck_default_type_select() {
	const couldSave = g_canSave;
	g_canSave = false;
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length) {
		let deck = g_decks[g_ui.deckIdx];
		let cardType = $('#default-card-type').val();
		$('#default-color').attr('disabled', false);
		$('#default-color-selector').attr('disabled', false).colorselector('setColor', deck.options.cardsDefault[cardType].color);
		$('#default-color-front').attr('disabled', false);
		$('#default-color-front-selector').attr('disabled', false).colorselector('setColor', deck.options.cardsDefault[cardType].color_front);
		$('#default-icon').attr('disabled', false).val(deck.options.cardsDefault['Card'].icon);
		$('#default-color-back').attr('disabled', false);
		$('#default-color-back-selector').attr('disabled', false).colorselector('setColor', deck.options.cardsDefault[cardType].color_back);
		$('#default-icon-back').attr('disabled', false).val(deck.options.cardsDefault['Card'].icon_back);
	} else {
		$('#default-color').attr('disabled', true);
		$('#default-color-selector').attr('disabled', true);
		$('#default-color-front').attr('disabled', true);
		$('#default-color-front-selector').attr('disabled', true);
		$('#default-icon').attr('disabled', true);
		$('#default-color-back').attr('disabled', true);
		$('#default-color-back-selector').attr('disabled', true);
		$('#default-icon-back').attr('disabled', true);
	}
	g_canSave = couldSave;
}

/**
 * Update forms with the selected deck values.
 */
function deck_update_ui() {
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length) {
		let deck = g_decks[g_ui.deckIdx];
		
		$('#button-save-all').attr('disabled', false);
		$('#button-generate-all').attr('disabled', false);

		$('#button-generate').attr('disabled', false);
		$('#button-sort').attr('disabled', false);
		$('#button-filter').attr('disabled', false);
		$('#button-delete').attr('disabled', false);
		$('#button-save').attr('disabled', false);

		$('#deck-name').attr('disabled', false).val(deck.options.name);
		$('#page-size').attr('disabled', false).val(deck.options.pageSize);
		$('#page-rows').attr('disabled', false).val(deck.options.pageRows);
		$('#page-columns').attr('disabled', false).val(deck.options.pageColumns);
		$('#card-arrangement').attr('disabled', false).val(deck.options.cardsArrangement);
		$('#card-size').attr('disabled', false).val(deck.options.cardsSize);
		$('#round-corners').attr('disabled', false).prop('checked', deck.options.roundCorners);
		$('#spell-classes').attr('disabled', false).prop('checked', deck.options.showSpellClasses);
		$('#small-icons').attr('disabled', false).prop('checked', deck.options.smallIcons);
		$('#title-size').attr('disabled', false).val(deck.options.titleSize);
		$('#deck-count').attr('disabled', false).val(deck.options.count);
		
		$('#default-card-type').attr('disabled', false);
	} else {
		$('#button-save-all').attr('disabled', true);
		$('#button-generate-all').attr('disabled', true);

		$('#button-generate').attr('disabled', true);
		$('#button-sort').attr('disabled', true);
		$('#button-filter').attr('disabled', true);
		$('#button-delete').attr('disabled', true);
		$('#button-save').attr('disabled', true);

		$('#deck-name').attr('disabled', true).val('');
		$('#page-size').attr('disabled', true).val('');
		$('#page-rows').attr('disabled', true).val('');
		$('#page-columns').attr('disabled', true).val('');
		$('#card-arrangement').attr('disabled', true).val('');
		$('#card-size').attr('disabled', true).val('');
		$('#round-corners').attr('disabled', true).prop('checked', false);
		$('#spell-classes').attr('disabled', true).prop('checked', false);
		$('#small-icons').attr('disabled', true).prop('checked', false);
		$('#title-size').attr('disabled', true).val('');
		$('#deck-count').attr('disabled', true).val('');
		
		$('#default-card-type').attr('disabled', true);
	}

	deck_default_type_select();
}

/**
 * Setup ui element event functions and update values.
 */
function deck_setup_ui() {

	// ----- Decks list

	$('#decks-list').change(deck_select);

	deck_list_update();

	$('#button-generate').click(deck_generate);
	$('#button-sort').click(function () { $('#sort-modal').modal('show'); });
	$('#sort-execute').click(deck_sort_execute);
	$('#button-filter').click(function () { $('#filter-modal').modal('show'); });
	$('#filter-execute').click(deck_filter_execute);
	$('#button-new').click(deck_new);
	$('#button-import').click(function () { $('#file-import').click(); });
	$('#file-import').change(deck_load_from_file);
	$('#button-delete').click(function () { $('#delete-confirmation-modal').modal('show'); });
	$('#delete-modal-confirm').click(deck_delete);
	$('#button-save').click(deck_save_to_file);

	// ----- Deck settings

	$('#deck-name').change(deck_name_change);
	$('#page-size').change(deck_option_change);
	$('#page-rows').change(deck_option_change);
	$('#page-columns').change(deck_option_change);
	$('#card-arrangement').change(deck_option_change);
	$('#card-size').change(deck_option_change);
	$('#round-corners').change(deck_option_change);
	$('#spell-classes').change(deck_option_change);
	$('#small-icons').change(deck_option_change);
	$('#title-size').change(deck_option_change);
	$('#deck-count').change(deck_option_change);

	// ----- Default values

	$('#default-card-type').change(deck_default_type_select);
	$('#default-color').change(deck_default_color_change);
	$('#default-color-front').change(deck_default_color_change);
	$('#default-icon').change(deck_default_property_change);
	$('#default-color-back').change(deck_default_color_change);
	$('#default-icon-back').change(deck_default_property_change);

	deck_update_ui();
}


// ============================================================================
// Cards helpers
// ============================================================================

/**
 * @param {number} index
 */
function card_select_by_index(index) {
	let deck = g_decks[g_ui.deckIdx];
	if (!deck)
		return;
	const couldSave = g_canSave;
	g_canSave = false;

	if (index >= 0 && index < deck.cards.length) {
		let card = deck.cards[index];
		if (card.title === 'SEPARATOR') {
			if (index < g_ui.cardIdx) {
				index--;
			} else {
				index++;
			}
		}
	}

	index = Math.min(index, deck.cards.length - 1);
	g_previousCardIdx = g_ui.cardIdx;
	g_ui.cardIdx = index;

	local_store_ui_save();

	let card = deck.cards[g_ui.cardIdx];
	let previousCard = g_previousCardIdx < deck.cards.length ? deck.cards[g_previousCardIdx] : null;
	if (!previousCard || previousCard.constructor !== card.constructor) {
		$('#default-card-type').val(card ? card.constructor.name : 'Card').change();
	}

	card_update_ui();
	g_canSave = couldSave;
}

/**
 * Add a new card just after the current one.
 */
function card_new() {
	let deck = g_decks[g_ui.deckIdx];
	let cardIdx = g_ui.cardIdx;
	let cardType = $('#card-type').val();

	deck.addCard(cardIdx, cardType);
	card_list_update_ui();
	card_select_by_index(cardIdx + 1);

	local_store_decks_save();

	$('#card-title').select();
}

/**
 * Duplicate the current card and select it.
 */
function card_duplicate() {
	let deck = g_decks[g_ui.deckIdx];
	let cardIdx = g_ui.cardIdx;

	deck.duplicateCard(cardIdx);
	card_list_update_ui();
	card_select_by_index(cardIdx + 1);

	local_store_decks_save();

	$('#card-title').select();
}

/**
 * Delete the current card and select the next one.
 */
function card_delete() {
	let deck = g_decks[g_ui.deckIdx];
	let cardIdx = g_ui.cardIdx;

	deck.deleteCard(cardIdx);
	card_list_update_ui();
	card_select_by_index(cardIdx);

	local_store_decks_save();
}

/**
 * Move the selected card up in the list.
 */
function card_list_up() {
	let deck = g_decks[g_ui.deckIdx];
	let cardIdx = g_ui.cardIdx;

	deck.moveCardUp(cardIdx);
	card_list_update_ui();
	card_select_by_index(cardIdx - 1);

	local_store_decks_save();
}

/**
 * Move the selected card down in the list.
 */
function card_list_down() {
	let deck = g_decks[g_ui.deckIdx];
	let cardIdx = g_ui.cardIdx;

	deck.moveCardDown(cardIdx);
	card_list_update_ui();
	card_select_by_index(cardIdx + 1);

	local_store_decks_save();
}

/**
 * Decrease the count of the selected card.
 */
function card_count_decrease() {
	let deck = g_decks[g_ui.deckIdx];
	let idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	let card = deck.cards[idx];

	if (!card.count || card.count === 0)
		card.count = 0;
	else
		card.count--;

	// Disable this minus button
	if (card.count === 0)
		$(this)[0].disabled = true;

	// Update card count
	let cardCount = $(this)[0].parentElement.children[1];
	cardCount.innerText = card.count;
	local_store_decks_save();
}

/**
 * Increase the count of the selected card.
 */
function card_count_increase() {
	let deck = g_decks[g_ui.deckIdx];
	let idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	let card = deck.cards[idx];

	if (!card.count)
		card.count = 1;
	else
		card.count++;

	// Enable minus button
	$(this)[0].parentElement.children[0].disabled = false;

	// Update card count
	let cardCount = $(this)[0].parentElement.children[1];
	cardCount.innerText = card.count;
	local_store_decks_save();
}

/**
 * Change a property of the selected card. The element which has this change function must have a 'data-property' attribute. 
 */
function card_property_change() {
	let deck = g_decks[g_ui.deckIdx];
	let card = deck.cards[g_ui.cardIdx];
	if (card) {
		let property = $(this).attr('data-property');
		if ($(this).attr('type') === 'checkbox') {
			card[property] = $(this).is(':checked');
		} else {
			card[property] = $(this).val();
		}
		card_render();
	}
}

/**
 * Change the title of selected card and update it in the cards list.
 */
function card_title_change() {
	let deck = g_decks[g_ui.deckIdx];
	let card = deck.cards[g_ui.cardIdx];
	if (card) {
		card.title = $('#card-title').val();
		if (g_ui.cardIdx || g_ui.cardIdx === 0) {
			$('#cards-list')[0].children[g_ui.cardIdx].children[0].innerText = card.title;
		}
		card_render();
	}
}

/**
 * Update a color-selector and call card_color_set with the corresponding property. The element must have the 'data-property' attribute.
 */
function card_color_change() {
	let color = $(this).val();

	if ($('#' + this.id + '-selector option[value=\'' + color + '\']').length > 0) {
		// Update the color selector to the entered value
		$('#' + this.id + '-selector').colorselector('setColor', color);
	} else {
		let property = $(this).attr('data-property');
		card_color_set(color, property);
	}
}

/**
 * Update a color property of the selected card.
 * @param {string} color In the format '#RRGGBB'
 * @param {string} property
 */
function card_color_set(color, property) {
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length && g_ui.cardIdx >= 0 && g_ui.cardIdx < g_decks[g_ui.deckIdx].cards.length) {
		let deck = g_decks[g_ui.deckIdx];
		let card = deck.cards[g_ui.cardIdx];

		if (color) {
			card[property] = color;
		} else {
			card[property] = deck.options.cardsDefault[card.constructor.name][property];
		}

		$('#cards-list')[0].children[g_ui.cardIdx].style.backgroundColor = card[property] + '29';

		card_render();
	}
}

/**
 * Change a stat for the selected creature. The element must have 'data-index' attribute.
 */
function creature_stats_change() {
	let deck = g_decks[g_ui.deckIdx];
	let card = deck.cards[g_ui.cardIdx];
	if (card) {
		let property = $(this).attr('data-index');
		card.stats[property] = $(this).val();
		card_render();
	}
}

/**
 * Update content of the selected card and remove successive spaces.
 */
function card_contents_change() {
	let deck = g_decks[g_ui.deckIdx];
	let card = deck.cards[g_ui.cardIdx];
	if (card) {
		let value = $(this).val().toString();
		card.contents = value.replace(/[\u202F\u00A0 ]+/g, ' ').split('\n');
		card_render();
	}
}

/**
 * Update tags array of the selected card by spliting the input with ','.
 */
function card_tags_change() {
	let deck = g_decks[g_ui.deckIdx];
	let card = deck.cards[g_ui.cardIdx];
	if (card) {
		let value = $(this).val().toString().trim();
		if (value.length === 0) {
			card.tags = [];
		} else {
			card.tags = value.split(',').map(function (val) {
				return val.trim().toLowerCase();
			});
		}
		card_render();
	}
}

/**
 * Select a card based on the 'index' attribute of the element.
 */
function card_list_select_card() {
	let idx = $(this).parent().attr('index');
	card_select_by_index(parseInt(idx));
}

/**
 * Update the preview of the card, generating the html for its front and back.
 */
function card_render() {
	if (g_dontRenderSelectedCard)
		return;
		
	$('#preview-container').empty();
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length && g_ui.cardIdx >= 0 && g_ui.cardIdx < g_decks[g_ui.deckIdx].cards.length) {
		let deck = g_decks[g_ui.deckIdx];
		let card = deck.cards[g_ui.cardIdx];
		card.update();

		let front = card.generateFront(deck.options);
		let back = card.generateBack(deck.options);
		$('#preview-container').html(front + '\n' + back);
		let cardContainer = $('.card-content-container');
		if (cardContainer && cardContainer.length > 0) {
			card.error = false;

			let cardsList = $('#cards-list');
			let lastCardElement = cardContainer.children().last();
			if (lastCardElement && lastCardElement.length > 0) {
				let lastCardElementBottom = lastCardElement.offset().top + lastCardElement.height();
				let containerBottom = cardContainer.offset().top + cardContainer.height();
				card.error = lastCardElement && (lastCardElementBottom - containerBottom) > 3;
			}
			if (card.error)
				cardsList[0].children[g_ui.cardIdx].classList.add('card-error');
			else
				cardsList[0].children[g_ui.cardIdx].classList.remove('card-error');
		}
	}
	local_store_decks_save();
}

/**
 * Empty the cards list and add an option for each card in the selected deck.
 */
function card_list_update_ui() {
	let cardsList = $('#cards-list');
	cardsList.empty();

	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length) {
		let deck = g_decks[g_ui.deckIdx];

		if (g_ui.cardIdx < 0 || g_ui.cardIdx >= deck.cards.length)
			g_ui.cardIdx = 0;

		$('#total_card_count').text('(' + deck.cards.length + ' ' + I18N.get('UI.UNIQUE') + ')');

		$('#button-card-up').attr('disabled', false);
		$('#button-card-down').attr('disabled', false);

		$('#button-card-add').attr('disabled', false);
		$('#button-card-duplicate').attr('disabled', false);
		$('#button-card-delete').attr('disabled', false);

		for (let i in deck.cards) {
			let card = deck.cards[i];
	
			let newCardInList = $('<div class="card-name"></div>').attr('index', i);
			let cardElt = $('<h4></h4>');
			cardElt.text(card.title);
			newCardInList.append(cardElt);
	
			if (card.title !== 'SEPARATOR') {
				cardElt.click(card_list_select_card);
	
				let countBlock = $('<div class="card-count"></div>');
				let buttonDecrease = $('<button type="button" class="btn btn-default card-count-less">-</button>').click(card_count_decrease);
				let count;
				if (card.count === 0) {
					buttonDecrease[0].disabled = true;
					count = $('<span></span>').text(0);
				} else {
					count = $('<span></span>').text(card.count || 1);
				}
				countBlock.append(buttonDecrease);
				countBlock.append(count);
				countBlock.append($('<button type="button" class="btn btn-default card-count-more">+</button>').click(card_count_increase));
				newCardInList.append(countBlock);
				if (card.color)
					newCardInList.css('background-color', card.color + '29');
				if (card.error)
					newCardInList.addClass('card-error');
				else
					newCardInList.removeClass('card-error');
			} else {
				cardElt.addClass('separator');
			}
			cardsList.append(newCardInList);
		}
	} else {
		g_ui.cardIdx = 0;

		$('#total_card_count').text('');

		$('#button-card-up').attr('disabled', true);
		$('#button-card-down').attr('disabled', true);

		$('#button-card-add').attr('disabled', true);
		$('#button-card-duplicate').attr('disabled', true);
		$('#button-card-delete').attr('disabled', true);
	}
}

/**
 * Update forms with the selected card values. Also update it's option in the cards list.
 */
function card_update_ui() {
	g_dontRenderSelectedCard = true;
	if (g_ui.deckIdx >= 0 && g_ui.deckIdx < g_decks.length && g_ui.cardIdx >= 0 && g_ui.cardIdx < g_decks[g_ui.deckIdx].cards.length) {
		let deck = g_decks[g_ui.deckIdx];
		let card = deck.cards[g_ui.cardIdx];

		$('#card-form-container').attr('card-type', card.constructor.name);
		$('#card-type').attr('disabled', false).val(card.constructor.name);

		$('#card-title').attr('disabled', false).val(card.title);
		$('#card-title-multiline').attr('disabled', false).prop('checked', card.title_multiline);
		$('#card-subtitle').attr('disabled', false).val(card.subtitle);
		$('#card-color').attr('disabled', false).val(card.color).change();
		$('#card-icon').attr('disabled', false).val(card.icon);
		$('#card-icon-back').attr('disabled', false).val(card.icon_back);
		$('#card-background').attr('disabled', false).val(card.background_image);
		$('#card-description').attr('disabled', false).val(card.description);
		$('#card-contents').attr('disabled', false).val(card.contents.join('\n'));
		$('#card-tags').attr('disabled', false).val(card.tags ? card.tags.join(', ') : '');
		$('#card-reference').attr('disabled', false).val(card.reference);
		$('#card-compact').attr('disabled', false).prop('checked', card.compact);

		if (card.constructor === CreatureCard) {
			$('.creature-hide').hide();
			$('.item-hide').show();
			$('.spell-hide').show();
			$('.power-hide').show();

			$('.creature-only').show();
			$('.item-only').hide();
			$('.spell-only').hide();
			$('.power-only').hide();

			$('#card-creature-cr').val(card.cr);
			$('#card-creature-size').val(card.size);
			$('#card-creature-alignment').val(card.alignment);
			$('#card-creature-type').val(card.type);

			$('#card-creature-ac').val(card.ac);
			$('#card-creature-hp').val(card.hp);
			$('#card-creature-perception').val(card.perception);
			$('#card-creature-speed').val(card.speed);

			$('#card-creature-strength').val(card.stats[0]);
			$('#card-creature-dexterity').val(card.stats[1]);
			$('#card-creature-constitution').val(card.stats[2]);
			$('#card-creature-intelligence').val(card.stats[3]);
			$('#card-creature-wisdom').val(card.stats[4]);
			$('#card-creature-charisma').val(card.stats[5]);

			$('#card-creature-resistances').val(card.resistances);
			$('#card-creature-vulnerabilities').val(card.vulnerabilities);
			$('#card-creature-immunities').val(card.immunities);

			$('#card-contents').attr('rows', 17);
		} else if (card.constructor === ItemCard) {
			$('.creature-hide').show();
			$('.item-hide').hide();
			$('.spell-hide').show();
			$('.power-hide').show();

			$('.creature-only').hide();
			$('.item-only').show();
			$('.spell-only').hide();
			$('.power-only').hide();

			$('#card-contents').attr('rows', 27);
		} else if (card.constructor === SpellCard) {
			$('.creature-hide').show();
			$('.item-hide').show();
			$('.spell-hide').hide();
			$('.power-hide').show();

			$('.creature-only').hide();
			$('.item-only').hide();
			$('.spell-only').show();
			$('.power-only').hide();

			$('#card-spell-level').val(card.level);
			$('#card-spell-ritual').prop('checked', card.ritual);
			$('#card-spell-casting-time').val(card.casting_time);
			$('#card-spell-range').val(card.range);
			$('#card-spell-verbal').prop('checked', card.verbal);
			$('#card-spell-somatic').prop('checked', card.somatic);
			$('#card-spell-materials').val(card.materials);
			$('#card-spell-duration').val(card.duration);
			$('#card-spell-type').val(card.type);
			$('#card-spell-classes').val(card.classes);
			$('#card-spell-higher-levels').val(card.higherLevels);

			$('#card-contents').attr('rows', 19);
		} else if (card.constructor === PowerCard) {
			$('.creature-hide').show();
			$('.item-hide').show();
			$('.spell-hide').show();
			$('.power-hide').hide();

			$('.creature-only').hide();
			$('.item-only').hide();
			$('.spell-only').hide();
			$('.power-only').show();

			$('#card-contents').attr('rows', 27);
		} else {
			$('.creature-hide').show();
			$('.item-hide').show();
			$('.spell-hide').show();
			$('.power-hide').show();

			$('.creature-only').hide();
			$('.item-only').hide();
			$('.spell-only').hide();
			$('.power-only').hide();

			$('#card-contents').attr('rows', 27);
		}

		let cardsList = $('#cards-list');
		if ((g_previousCardIdx || g_previousCardIdx === 0) && g_previousCardIdx < deck.cards.length) {
			let oldCard = deck.cards[g_previousCardIdx];
			let oldCardElt = cardsList[0].children[g_previousCardIdx];
			oldCardElt.style.backgroundColor = oldCard.color ? oldCard.color + '29' : '';
			oldCardElt.classList.remove('selected');
		}
		let cardScrollHeight = cardsList[0].children[g_ui.cardIdx].scrollHeight;
		let scrollPos = g_ui.cardIdx * cardScrollHeight;
		if (scrollPos < cardsList[0].scrollTop + cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardScrollHeight;
		else if (scrollPos >= cardsList[0].scrollTop + cardsList[0].offsetHeight - 2 * cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardsList[0].offsetHeight + 2 * cardScrollHeight;
		cardsList[0].children[g_ui.cardIdx].classList.add('selected');
	} else {
		$('#card-form-container').removeAttr('card-type');
		$('#card-type').attr('disabled', true).val('Card');

		$('#card-title').attr('disabled', true).val('');
		$('#card-title-multiline').attr('disabled', true).prop('checked', false);
		$('#card-subtitle').attr('disabled', true).val('');
		$('#card-color').attr('disabled', true).val('').change();
		$('#card-icon').attr('disabled', true).val('');
		$('#card-icon-back').attr('disabled', true).val('');
		$('#card-background').attr('disabled', true).val('');
		$('#card-description').attr('disabled', true).val('');
		$('#card-contents').attr('disabled', true).val('');
		$('#card-tags').attr('disabled', true).val('');
		$('#card-reference').attr('disabled', true).val('');
		$('#card-compact').attr('disabled', true).prop('checked', false);

		$('.creature-hide').hide();
		$('.item-hide').hide();
		$('.spell-hide').hide();
		$('.power-hide').hide();

		$('.creature-only').hide();
		$('.item-only').hide();
		$('.spell-only').hide();
		$('.power-only').hide();
		
		$('#card-contents').attr('disabled', true).attr('rows', 27);
	}

	g_dontRenderSelectedCard = false;
	card_render();
}

/**
 * Setup ui element event functions and update values.
 */
function card_setup_ui() {
	
	// ----- Cards list

	$('#button-card-up').click(card_list_up);
	$('#button-card-down').click(card_list_down);

	$('#button-card-add').click(card_new);
	$('#button-card-duplicate').click(card_duplicate);
	$('#button-card-delete').click(card_delete);
	
	card_list_update_ui();

	// ----- Card

	$('#card-title').on('keyup', ui_change_keyup);
	$('#card-title').change(card_title_change);
	$('#card-title-multiline').change(card_property_change);
	$('#card-subtitle').change(card_property_change);
	$('#card-icon').change(card_property_change);
	$('#card-icon-back').change(card_property_change);
	$('#card-background').change(card_property_change);
	$('#card-color').change(card_color_change);
	$('#card-tags').change(card_tags_change);
	$('#card-reference').on('keyup', ui_change_keyup);
	$('#card-reference').change(card_property_change);

	$('#card-description').on('keyup', ui_change_keyup);
	$('#card-description').change(card_property_change);
	/* $("#card-contents").typeahead({
		source: Object.keys(card_element_generators),
		items: 'all',
		minLength: 0,
		matcher: typeahead_contents_matcher,
		updater: typeahead_contents_updater,
		render: typeahead_render
	}); */
	$('#card-contents').on('keyup', ui_change_keyup);
	$('#card-contents').change(card_contents_change);
	$('#card-contents').on('keydown', ui_contents_shortcut);

	$('#card-compact').change(card_property_change);

	// ----- Creature

	$('#card-creature-cr').change(card_property_change);
	$('#card-creature-size').change(card_property_change);
	$('#card-creature-alignment').typeahead({
		source: Object.values(I18N.get('CREATURE.ALIGNMENTS')),
		items: 'all',
		minLength: 0,
		render: typeahead_render
	});
	$('#card-creature-alignment').on('keydown', preventPageDownOrUp);
	$('#card-creature-alignment').change(card_property_change);
	$('#card-creature-type').change(card_property_change);

	$('#card-creature-ac').change(card_property_change);
	$('#card-creature-hp').change(card_property_change);
	$('#card-creature-perception').change(card_property_change);
	$('#card-creature-speed').change(card_property_change);

	$('#card-creature-strength').change(creature_stats_change);
	$('#card-creature-dexterity').change(creature_stats_change);
	$('#card-creature-constitution').change(creature_stats_change);
	$('#card-creature-intelligence').change(creature_stats_change);
	$('#card-creature-wisdom').change(creature_stats_change);
	$('#card-creature-charisma').change(creature_stats_change);

	$('#card-creature-resistances').change(card_property_change);
	$('#card-creature-vulnerabilities').change(card_property_change);
	$('#card-creature-immunities').change(card_property_change);

	// ----- Spell

	$('#card-spell-level').change(card_property_change);
	$('#card-spell-ritual').change(card_property_change);
	$('#card-spell-casting-time').change(card_property_change);
	$('#card-spell-casting-time').on('keyup', ui_change_keyup);
	$('#card-spell-range').change(card_property_change);
	$('#card-spell-range').on('keyup', ui_change_keyup);
	$('#card-spell-verbal').change(card_property_change);
	$('#card-spell-somatic').change(card_property_change);
	$('#card-spell-materials').change(card_property_change);
	$('#card-spell-duration').change(card_property_change);
	$('#card-spell-duration').on('keyup', ui_change_keyup);
	$('#card-spell-type').typeahead({
		source: Object.values(I18N.get('SPELL.SPELL_TYPES')),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$('#card-spell-type').on('keydown', preventPageDownOrUp);
	$('#card-spell-type').change(card_property_change);
	$('#card-spell-higher-levels').on('keyup', ui_change_keyup);
	$('#card-spell-higher-levels').change(card_property_change);
	$('#card-spell-classes').typeahead({
		source: Object.values(I18N.get('CLASSES')),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$('#card-spell-classes').on('keydown', preventPageDownOrUp);
	$('#card-spell-classes').change(card_property_change);

	card_update_ui();
}


// ============================================================================
// Typeahead
// ============================================================================

function typeahead_matcher(item) {
	let words = this.query.toLowerCase().split(' ');
	return ~item.toLowerCase().indexOf(words[words.length - 1]);
}

function typeahead_updater(item) {
	let lastSpaceIdx = this.query.lastIndexOf(' ');
	if (lastSpaceIdx > 0)
		return this.query.substring(0, lastSpaceIdx) + ' ' + item;
	return item;
}

function typeahead_render(items) {
	let that = this;

	items = $(items).map(function (i, item) {
		// Fetch the li tags
		let li = $(that.options.item).data('value', item);
		// Highlight matching text in the line
		li.find('a').html(that.highlighter(item));
		return li[0];
	});

	if (this.autoSelect) {
		items.first().addClass('active');
	}
	this.$menu.html(items);
	return this;
}

function typeahead_render_icon(items) {
	let that = this;

	items = $(items).map(function (i, item) {
		// Fetch the li tags
		let li = $(that.options.item).data('value', item);
		// Highlight matching text in the line
		li.find('a').html(that.highlighter(item));
		// Add icons with the span
		let classname = 'icon-' + item.split(' ').join('-').toLowerCase();
		li.find('a').append('<span class="' + classname + '"></span>');
		return li[0];
	});

	if (this.autoSelect) {
		items.first().addClass('active');
	}
	this.$menu.html(items);
	this.$menu.addClass('dropdown-icons');
	return this;
}

function typeahead_contents_matcher(item) {
	let selectionStart = this.$element[0].selectionStart;
	let textBefore = this.query.substring(0, selectionStart);
	let lastSpaceIdx = textBefore.search(/\n[^\W]*$/);
	let newWord = textBefore.substring(lastSpaceIdx + 1);
	if (newWord === '')
		return false;
	return item.startsWith(newWord);
}

function typeahead_contents_updater(item) {
	let selectionStart = this.$element[0].selectionStart;
	let textBefore = this.query.substring(0, selectionStart);
	let lastSpaceIdx = textBefore.search(/\W[^\W]*$/);
	textBefore = textBefore.substring(0, lastSpaceIdx + 1);

	this.$element[0].selectionStart = (textBefore + item).length;
	this.$element[0].selectionEnd = this.$element[0].selectionStart;

	let textAfter = this.query.slice(selectionStart);
	return textBefore + item + ' | ' + textAfter;
}


// ============================================================================
// UI setup and change
// ============================================================================

/**
 * Update the height of the cards list block.
 */
function ui_cards_list_update_height() {
	let cardsListParents = $('#cards-list').parents();
	let top = $('#cards-list').position().top;

	for (let i = 0; i < cardsListParents.length; i++)
		top += $(cardsListParents[i]).position().top;

	$('#cards-list').css('height', ($(window).height() - top) + 'px');
}

/**
 * Toggle the folding of one of the two right and left panels.
 */
function ui_fold_section() {
	let shouldSave = false;

	if (g_isSmallLayout) {
		let foldedContainer = $('#' + $(this).attr('for'));
		let sideName = '';
		if ($(this).hasClass('btn-fold-section-right')) {
			sideName = 'right';
		} else {
			sideName = 'left';
		}
		let cssSideInt = parseInt(foldedContainer.css(sideName));
		if (cssSideInt < 0) {
			foldedContainer.css(sideName, '0px');
			$(this).css(sideName, parseInt(foldedContainer.css('width')) - parseInt($(this).css('width')) + 'px');
		} else {
			foldedContainer.css(sideName, '-' + foldedContainer.css('width'));
			$(this).css(sideName, '0px');
		}
	} else {
		let cardFormWrapper = $('#card-form-container-wrapper');
		let cardFormContainer = $('#card-form-container');
		let cardFormContainerLGIdx = cardFormWrapper[0].classList.value.indexOf('col-lg-') + 7;
		let cardFormContainerClass = parseInt(cardFormWrapper[0].classList.value.substring(cardFormContainerLGIdx, cardFormContainerLGIdx + 2));

		let foldedContainer = $('#' + $(this).attr('for'));
		let foldedContainerLGIdx = foldedContainer[0].classList.value.indexOf('col-lg-') + 7;
		let foldedContainerClass = parseInt(foldedContainer[0].classList.value.substring(foldedContainerLGIdx, foldedContainerLGIdx + 2));

		let foldedContainerDisplay = foldedContainer.css('display');

		let buttonSpaceWidth = parseInt($(this).css('width'));

		let buttonIncreasedWidth = 8;
		if (foldedContainerDisplay !== 'none') {
			shouldSave = !g_ui.foldedSections[foldedContainer.selector];
			g_ui.foldedSections[foldedContainer.selector] = '#' + this.id;
			foldedContainer.hide();

			buttonSpaceWidth += buttonIncreasedWidth;
			$(this).css('width', buttonSpaceWidth + 'px');

			if (parseInt($(this).css('margin-right')) < 0) {
				cardFormContainer.css('padding-right', (parseInt(cardFormContainer.css('padding-right')) + buttonSpaceWidth) + 'px');
				$(this).css('margin', '0px 0px 0px ' + (-buttonSpaceWidth - 1) + 'px');
			} else {
				cardFormContainer.css('padding-left', (parseInt(cardFormContainer.css('padding-left')) + buttonSpaceWidth) + 'px');
				$(this).css('margin', '0px ' + (-buttonSpaceWidth - 1) + 'px 0px 0px');
			}

			cardFormWrapper.toggleClass('col-lg-' + cardFormContainerClass + ' col-lg-' + (cardFormContainerClass + foldedContainerClass));
		} else {
			shouldSave = g_ui.foldedSections[foldedContainer.selector];
			g_ui.foldedSections[foldedContainer.selector] = null;
			foldedContainer.show();

			if (parseInt($(this).css('margin-right')) >= 0)
				cardFormContainer.css('padding-right', '');
			else
				cardFormContainer.css('padding-left', '');

			$(this).css('margin', '');

			buttonSpaceWidth -= buttonIncreasedWidth;
			$(this).css('width', buttonSpaceWidth + 'px');

			cardFormWrapper.toggleClass('col-lg-' + cardFormContainerClass + ' col-lg-' + (cardFormContainerClass - foldedContainerClass));
		}

		$(this).toggleClass('btn-fold-section-right btn-fold-section-left');
	}

	if (shouldSave)
		local_store_ui_save();
}

/**
 * Hide both panels when with a small layout/screen.
 * @param {JQuery.Event} evt
 */
function ui_small_layout_fold_all_sections(evt) {
	if (evt && evt.isDefaultPrevented())
		return;
	let foldMenuButton = $('#button-fold-menu');
	if (parseInt(foldMenuButton.css('left')) > 0) {
		foldMenuButton.click();
	}
	let foldPreviewButton = $('#button-fold-preview');
	if (parseInt(foldPreviewButton.css('right')) > 0) {
		foldPreviewButton.click();
	}
}

/**
 * Toggle the folding of a block like the cards list or the deck settings.
 */
function ui_fold_block() {
	let button = $('#' + this.id);

	let foldedBlock = $('#' + $(this).attr('for'));
	let display = foldedBlock.css('display');
	let shouldSave = false;
	if (display !== 'none') {
		shouldSave = !g_ui.foldedBlocks[foldedBlock.selector];
		g_ui.foldedBlocks[foldedBlock.selector] = button.selector;
		foldedBlock.hide();
		let buttonsPoints = button[0].children[0].children[0].points;
		buttonsPoints[1].x = 0;
		buttonsPoints[1].y = 10;
		buttonsPoints[2].x = 10;
		buttonsPoints[2].y = 5;
	} else {
		shouldSave = g_ui.foldedBlocks[foldedBlock.selector];
		g_ui.foldedBlocks[foldedBlock.selector] = null;
		foldedBlock.show();
		let buttonsPoints = button[0].children[0].children[0].points;
		buttonsPoints[1].x = 10;
		buttonsPoints[1].y = 0;
		buttonsPoints[2].x = 5;
		buttonsPoints[2].y = 10;
	}

	if (shouldSave)
		local_store_ui_save();

	ui_cards_list_update_height();
}

/**
 * Trigger the change only after a small time. The timer is reset each time a modification is done.
 * This function avoid continuous costly card update when typing content.
 */
function ui_change_keyup() {
	clearTimeout(ui_change_keyup.timeout);
	ui_change_keyup.timeout = setTimeout(function (element) {
		$(element).trigger('change');
	}, 200, this);
}
ui_change_keyup.timeout = null;

/**
 * Handle shortcuts on the page.
 * @param {JQuery.Event} evt
 */
function ui_document_shortcut_keydown(evt) {
	if (evt.key === 'PageUp') {
		if (evt.preventDefault)
			evt.preventDefault();
			
		let idx = g_ui.cardIdx;
		if (idx > 0)
			card_select_by_index(idx - 1);
	} else if (evt.key === 'PageDown') {
		if (evt.preventDefault)
			evt.preventDefault();

		let deck = g_decks[g_ui.deckIdx];
		let idx = g_ui.cardIdx;
		if (idx < deck.cards.length - 1)
			card_select_by_index(idx + 1);
	} else if (evt.ctrlKey) {
		if (evt.key === '+') {
			if (evt.preventDefault)
				evt.preventDefault();

			let cardsMoreButtonList = $('#cards-list .card-count-more');
			cardsMoreButtonList[g_ui.cardIdx].click();
		} else if (evt.key === '-') {
			if (evt.preventDefault)
				evt.preventDefault();

			let cardsLessButtonList = $('#cards-list .card-count-less');
			cardsLessButtonList[g_ui.cardIdx].click();
		}
	} else if (evt.currentTarget.activeElement.nodeName !== 'INPUT' && evt.currentTarget.activeElement.nodeName !== 'TEXTAREA') {
		if (evt.key === '+') {
			if (evt.preventDefault)
				evt.preventDefault();

			let cardsMoreButtonList = $('#cards-list .card-count-more');
			cardsMoreButtonList[g_ui.cardIdx].click();
		} else if (evt.key === '-') {
			if (evt.preventDefault)
				evt.preventDefault();

			let cardsLessButtonList = $('#cards-list .card-count-less');
			cardsLessButtonList[g_ui.cardIdx].click();
		}
	}
}

/**
 * Handle shortcuts on the page.
 * @param {JQuery.Event} evt
 */
function ui_document_shortcut_keyup(evt) {
	if (evt.ctrlKey) {
		if (evt.key === 's') {
			if (evt.preventDefault)
				evt.preventDefault();

			deck_save_to_file();
		} else if (evt.key === 'g') {
			if (evt.preventDefault)
				evt.preventDefault();

			deck_generate();
		}
	} else if (evt.currentTarget.activeElement.nodeName !== 'INPUT' && evt.currentTarget.activeElement.nodeName !== 'TEXTAREA') {
		if (evt.key === '²') {
			if (evt.preventDefault)
				evt.preventDefault();

			$('#help-modal').modal('toggle');
		}
	} else {
		if (evt.key === 'Escape') {
			evt.currentTarget.activeElement.blur();
		}
	}
}

/**
 * Handle shortcuts when the content textarea is focused.
 * @param {JQuery.Event} evt
 */
function ui_contents_shortcut(evt) {
	if (evt.shiftKey && evt.key === 'Delete') {
		let value = $(this)[0].value;
		let textBefore = value.slice(0, $(this)[0].selectionStart);
		let idxLineFirstChar = textBefore.lastIndexOf('\n');
		if (idxLineFirstChar === -1) {
			idxLineFirstChar = 0;
			textBefore = '';
		} else
			textBefore = textBefore.slice(0, idxLineFirstChar);

		let textAfter = value.slice($(this)[0].selectionEnd);
		let idxLineLastChar = textAfter.indexOf('\n');
		if (idxLineLastChar === -1)
			textAfter = '';
		else
			textAfter = textAfter.slice(idxLineLastChar);

		$(this)[0].value = textBefore + textAfter;
		$(this)[0].selectionStart = idxLineFirstChar;
		$(this)[0].selectionEnd = $(this)[0].selectionStart;

		if (evt.preventDefault)
			evt.preventDefault();
	} else if (evt.altKey) {
		if (evt.key === 'i') {
			let value = $(this)[0].value;
			let selectionStart = $(this)[0].selectionStart;
			let selectionEnd = $(this)[0].selectionEnd;
			let textBefore = value.slice(0, selectionStart);
			let textBetween = value.slice(selectionStart, selectionEnd);
			let textAfter = value.slice(selectionEnd);

			$(this)[0].value = textBefore + '<i>' + textBetween + '</i>' + textAfter;
			if (textBetween.length === 0)
				$(this)[0].selectionStart = selectionStart + 3;
			else
				$(this)[0].selectionStart = selectionStart + textBetween.length + 7;
			$(this)[0].selectionEnd = $(this)[0].selectionStart;

			if (evt.preventDefault)
				evt.preventDefault();
		} else if (evt.key === 'b') {
			let value = $(this)[0].value;
			let selectionStart = $(this)[0].selectionStart;
			let selectionEnd = $(this)[0].selectionEnd;
			let textBefore = value.slice(0, selectionStart);
			let textBetween = value.slice(selectionStart, selectionEnd);
			let textAfter = value.slice(selectionEnd);

			$(this)[0].value = textBefore + '<b>' + textBetween + '</b>' + textAfter;
			if (textBetween.length === 0)
				$(this)[0].selectionStart = selectionStart + 3;
			else
				$(this)[0].selectionStart = selectionStart + textBetween.length + 7;
			$(this)[0].selectionEnd = $(this)[0].selectionStart;

			if (evt.preventDefault)
				evt.preventDefault();
		}
	}
}

/**
 * Update all the texts in the ui according to the selected language.
 */
function ui_update_texts() {
	let deck = g_decks[g_ui.deckIdx];

	$('#button-help').text(I18N.get('UI.HELP'));
	$('#button-language').text(I18N.get('UI.LANGUAGE'));
	$('#button-load-sample').text(I18N.get('UI.SAMPLE'));
	$('#button-insert-lexical').text(I18N.get('UI.LEXICAL'));
	$('#button-load-all').text(I18N.get('UI.LOAD_ALL'));
	$('#button-save-all').text(I18N.get('UI.SAVE_ALL'));
	$('#button-generate-all').text(I18N.get('UI.GENERATE_ALL'));
	
	$('#help-modal .modal-title').text(I18N.get('UI.PROJECT_TITLE'));
	$('#project-description').html(I18N.get('UI.PROJECT_DESCRIPTION').join(''));
	$('#contents-elements-description').html(I18N.get('UI.CONTENTS_ELEMENTS_DESCRIPTION').join(''));
	$('#shortcuts').html(I18N.get('UI.SHORTCUTS').join(''));
	$('#licenses').html(I18N.get('UI.LICENSES').join(''));
	
	$('#decks-list-label').text(I18N.get('UI.DECKS_LIST'));
	$('#button-new').text(I18N.get('UI.NEW'));
	$('#button-delete').text(I18N.get('UI.DELETE'));
	$('#button-import').text(I18N.get('UI.IMPORT'));
	$('#button-save').text(I18N.get('UI.SAVE'));
	$('#button-sort').text(I18N.get('UI.SORT'));
	$('#button-filter').text(I18N.get('UI.FILTER'));
	$('#button-generate').text(I18N.get('UI.GENERATE'));

	$('#deck-settings-title').text(I18N.get('UI.DECK_SETTINGS'));
	$('#deck-name-label').text(I18N.get('UI.DECK_NAME'));
	$('#page-size-label').text(I18N.get('UI.PAGE'));
	$('#cards-page-label').text(I18N.get('UI.CARDS_PAGE'));
	$('#page-rows').attr('placeholder', I18N.get('UI.ROWS'));
	$('#page-columns').attr('placeholder', I18N.get('UI.COLUMNS'));
	$('#card-arrangement-label').text(I18N.get('UI.CARD'));
	$('#card-arrangement option[value="doublesided"]').text(I18N.get('UI.DOUBLESIDED'));
	$('#card-arrangement option[value="front_only"]').text(I18N.get('UI.FRONT_ONLY'));
	$('#card-arrangement option[value="side_by_side"]').text(I18N.get('UI.SIDE_BY_SIDE'));
	$('#round-corners-label').text(I18N.get('UI.ROUND_CORNERS'));
	$('#small-icons-label').text(I18N.get('UI.SMALL_ICONS'));
	$('#spell-classes-label').text(I18N.get('UI.SPELL_CLASSES'));
	$('#title-size-label').text(I18N.get('UI.TITLE'));
	$('#deck-count-label').text(I18N.get('UI.COUNT'));

	$('#default-block-title h3').text(I18N.get('UI.DEFAULT_VALUES'));
	$('#default-card-type option[value="Card"]').text(I18N.get('UI.GENERIC'));
	$('#default-card-type option[value="CreatureCard"]').text(I18N.get('UI.CREATURE'));
	$('#default-card-type option[value="ItemCard"]').text(I18N.get('UI.ITEM'));
	$('#default-card-type option[value="SpellCard"]').text(I18N.get('UI.SPELL'));
	$('#default-card-type option[value="PowerCard"]').text(I18N.get('UI.POWER'));
	$('#default-color-label').text(I18N.get('UI.CONTENT'));
	$('#default-color-front-label').text(I18N.get('UI.FRONT'));
	$('#default-color-back-label').text(I18N.get('UI.BACK'));
	$('#default-icon').attr('placeholder', I18N.get('UI.ICON_NAME'));
	$('#default-icon-back').attr('placeholder', I18N.get('UI.ICON_NAME'));

	$('#cards-list-title h3').text(I18N.get('UI.CARDS'));
	if (deck)
		$('#total_card_count').text('(' + deck.cards.length + ' ' + I18N.get('UI.UNIQUE') + ')');
	else
		$('#total_card_count').text('');
	$('#button-card-delete').text(I18N.get('UI.DELETE'));
	$('#button-card-duplicate').text(I18N.get('UI.COPY'));
	$('#button-card-add').text(I18N.get('UI.NEW'));
	$('#card-type option[value="Card"]').text(I18N.get('UI.GENERIC'));// TODO GREGOIRE: Factorise with default
	$('#card-type option[value="CreatureCard"]').text(I18N.get('UI.CREATURE'));
	$('#card-type option[value="ItemCard"]').text(I18N.get('UI.ITEM'));
	$('#card-type option[value="SpellCard"]').text(I18N.get('UI.SPELL'));
	$('#card-type option[value="PowerCard"]').text(I18N.get('UI.POWER'));

	$('#card-form-container-title').text(I18N.get('UI.CARD'));
	$('#card-title-label').text(I18N.get('UI.TITLE'));
	$('#card-title-multiline-label').text(I18N.get('UI.MULTILINE'));
	$('#card-subtitle-label').text(I18N.get('UI.SUBTITLE'));
	$('#card-icon-label').text(I18N.get('UI.FRONT_ICON'));
	$('#card-icon').attr('placeholder', I18N.get('UI.DEFAULT'));
	$('#card-color-label').text(I18N.get('UI.COLOR'));
	$('#card-color').attr('placeholder', I18N.get('UI.DEFAULT'));
	$('#card-icon-back-label').text(I18N.get('UI.BACK_ICON'));
	$('#card-icon-back').attr('placeholder', I18N.get('UI.SAME_AS_FRONT'));
	$('#card-background-label').text(I18N.get('UI.BACKGROUND'));
	$('#card-background').attr('placeholder', 'url');
	$('#card-description-label').text(I18N.get('UI.BACK_DESCRIPTION'));
	$('#card-creature-cr-label').text(I18N.get('CREATURE.CR'));
	$('#card-creature-size-label').text(I18N.get('UI.SIZE'));
	$('#card-creature-alignment-label').text(I18N.get('UI.ALIGNMENT'));
	$('#card-creature-type-label').text(I18N.get('UI.TYPE'));
	$('#card-creature-ac-label').text(I18N.get('CREATURE.AC'));
	$('#card-creature-hp-label').text(I18N.get('CREATURE.HP'));
	$('#card-creature-perception-label').text(I18N.get('CREATURE.PERCEPTION'));
	$('#card-creature-speed-label').text(I18N.get('CREATURE.SPEED'));
	$('#card-creature-strength-label').text(I18N.get('CREATURE.STRENGTH'));
	$('#card-creature-dexterity-label').text(I18N.get('CREATURE.DEXTERITY'));
	$('#card-creature-constitution-label').text(I18N.get('CREATURE.CONSTITUTION'));
	$('#card-creature-intelligence-label').text(I18N.get('CREATURE.INTELLIGENCE'));
	$('#card-creature-wisdom-label').text(I18N.get('CREATURE.WISDOM'));
	$('#card-creature-charisma-label').text(I18N.get('CREATURE.CHARISMA'));
	$('#card-creature-resistances-label').text(I18N.get('CREATURE.RESISTANCES'));
	$('#card-creature-vulnerabilities-label').text(I18N.get('CREATURE.VULNERABILITIES'));
	$('#card-creature-immunities-label').text(I18N.get('CREATURE.IMMUNITIES'));
	$('#card-spell-level-label').text(I18N.get('SPELL.LEVEL'));
	$('#card-spell-ritual-label').text(I18N.get('SPELL.RITUAL'));
	$('#card-spell-type-label').text(I18N.get('UI.TYPE'));
	$('#card-spell-materials-label').text(I18N.get('SPELL.MATERIALS'));
	$('#card-spell-verbal-label').text(I18N.get('SPELL.VERBAL'));
	$('#card-spell-somatic-label').text(I18N.get('SPELL.SOMATIC'));
	$('#card-spell-range-label').text(I18N.get('SPELL.RANGE'));
	$('#card-spell-casting-time-label').text(I18N.get('SPELL.CASTING_TIME'));
	$('#card-spell-duration-label').text(I18N.get('SPELL.DURATION'));

	$('#card-contents-label').html('<span id="contents-tooltip">' + I18N.get('UI.CONTENTS') + '<br/>(?)<span class="tooltiptext">' + I18N.get('UI.CONTENTS_ELEMENTS_DESCRIPTION').join('') + '</span></span>');

	$('#card-spell-higher-levels-label').text(I18N.get('SPELL.AT_HIGHER_LEVELS'));
	$('#card-spell-classes-label').text(I18N.get('UI.CLASSES'));
	$('#card-tags-label').text(I18N.get('UI.TAGS'));
	$('#card-reference-label').text(I18N.get('UI.REFERENCE'));
	$('#card-compact-label').text(I18N.get('UI.COMPACT'));
	
	$('[data-toggle="tooltip"]').tooltip({ html: true });
}

/**
 * Setup the window resize function which update the layout size and panel folding behaviour.
 */
function ui_setup_resize() {
	g_isSmallLayout = $('html').width() < 1200;
	$(window).resize(function () {
		let isSmallLayout = $('html').width() < 1200;
		if (isSmallLayout) {
			let foldedSectionsKeys = Object.keys(g_ui.foldedSections);
			if (isSmallLayout !== g_isSmallLayout) {
				for (let i = 0; i < foldedSectionsKeys.length; i++) {
					if (g_ui.foldedSections[foldedSectionsKeys[i]]) {
						$(g_ui.foldedSections[foldedSectionsKeys[i]]).click();
					}
				}
			}
			for (let i = 0; i < foldedSectionsKeys.length; i++) {
				g_ui.foldedSections[foldedSectionsKeys[i]] = null;
			}

			$('#menu-container-wrapper').click(function (e) {
				if (e.preventDefault)
					e.preventDefault();
			});
			$('#preview-container-wrapper').click(function (e) {
				if (e.preventDefault)
					e.preventDefault();
			});
			$('.container-wrapper').click(ui_small_layout_fold_all_sections);
		} else {
			$('#menu-container-wrapper').click(null);
			$('#preview-container-wrapper').click(null);
			$('.container-wrapper').click(null);
		}

		if (g_isSmallLayout !== isSmallLayout) {
			let clean_style = function (styleObj) {
				for (let i = styleObj.length; i--;) {
					let nameString = styleObj[i];
					styleObj.removeProperty(nameString);
				}
			};

			clean_style($('#button-fold-menu')[0].style);
			clean_style($('#menu-container-wrapper')[0].style);
			clean_style($('#button-fold-preview')[0].style);
			clean_style($('#preview-container-wrapper')[0].style);
			g_isSmallLayout = isSmallLayout;
		}

		$('body').children('.container-fluid').children('.row').css('height', $(window).height() + 'px');
		$('.container-wrapper').css('height', $(window).height() + 'px');
		$('.btn-fold-section').css('height', $(window).height() + 'px');
		ui_cards_list_update_height();
	});
}

/**
 * Setup the color selectors functions.
 */
function ui_setup_color_selector() {
	// Insert colors
	$.each(card_colors, function (name, val) {// TODO: Change to a wheel or a line (save as #RRGGBB)
		$('.colorselector-data')
			.append($('<option></option>')
				.attr('value', name)
				.attr('data-color', val)
				.text(name));
	});

	// Callbacks for when the user picks a color
	$('#default-color-selector').colorselector({
		callback: function (value, color, title) {
			$('#default-color').val(title);
			deck_default_color_set(color, 'color');
		}
	});

	$('#default-color-front-selector').colorselector({
		callback: function (value, color, title) {
			$('#default-color-front').val(title);
			deck_default_color_set(color, 'color_front');
		}
	});

	$('#default-color-back-selector').colorselector({
		callback: function (value, color, title) {
			$('#default-color-back').val(title);
			deck_default_color_set(color, 'color_back');
		}
	});

	$('#card-color-selector').colorselector({
		callback: function (value, color, title) {
			$('#card-color').val(title);
			card_color_set(color, 'color');
		}
	});

	// Styling
	$('.dropdown-colorselector').addClass('input-group-addon color-input-addon');
}


// ============================================================================
// Page load setup
// ============================================================================

$(async function () {
	const I18Nmodule = await import('./i18n.js');
	await I18Nmodule.loadLocal();

	g_canSave = false;

	ui_update_texts();

	$(document).on('keydown', ui_document_shortcut_keydown);
	$(document).on('keyup', ui_document_shortcut_keyup);
	ui_setup_resize();

	local_store_ui_load();
	local_store_decks_load();

	if (!g_ui.deckIdx || g_ui.deckIdx >= g_decks.length) {
		g_ui.deckIdx = 0;
	}
	
	let deck = g_decks[g_ui.deckIdx];

	if (deck) {
		if (g_ui.cardIdx >= deck.cards.length) 
			g_ui.cardIdx = deck.cards.length - 1;
	} else {
		g_ui.cardIdx = 0;
	}

	$('.btn-fold-section').click(ui_fold_section);
	let isSmallLayout = $('html').width() < 1200;
	let foldedSectionsKeys = Object.keys(g_ui.foldedSections);
	if (isSmallLayout) {
		for (let i = 0; i < foldedSectionsKeys.length; i++) {
			g_ui.foldedSections[foldedSectionsKeys[i]] = null;
		}
	} else {
		for (let i = 0; i < foldedSectionsKeys.length; i++) {
			if (g_ui.foldedSections[foldedSectionsKeys[i]])
				$(g_ui.foldedSections[foldedSectionsKeys[i]]).click();
		}
	}

	$('.btn-fold-block').click(ui_fold_block);
	let foldIconElt = $('<svg viewbox="0 0 10 10" preserveaspectratio="none"><polygon points="0,0 10,0 5,10" fill="black" style="stroke-width:1"></polygon></svg>');
	$('.btn-fold-block').contents().before(foldIconElt);
	let foldedBlockKeys = Object.keys(g_ui.foldedBlocks);
	for (let i = 0; i < foldedBlockKeys.length; i++) {
		if (g_ui.foldedBlocks[foldedBlockKeys[i]])
			$(g_ui.foldedBlocks[foldedBlockKeys[i]]).click();
	}

	ui_setup_color_selector();
	$('.icon-list').typeahead({
		source: icon_names,
		items: 'all',
		render: typeahead_render_icon
	});
	$('.icon-list').on('keydown', preventPageDownOrUp);


	$('#button-help').click(function () { $('#help-modal').modal('show'); });
	$('#button-language').click(function () { $('#language-modal').modal('show'); });
	$('#language-list button').click(update_lang);
	$('#button-load-sample').click(load_sample);
	$('#button-insert-lexical').click(insert_lexical);
	$('#button-load-all').click(function () { $('#file-load-all').click(); });
	$('#file-load-all').change(decks_load_from_file);
	$('#button-save-all').click(decks_save_to_file);
	$('#button-generate-all').click(decks_generate);


	deck_setup_ui();

	card_setup_ui();


	g_canSave = true;

	$(window).resize();
});
