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

// Ugly global variable holding the current card deck
let g_deck = null;

let g_ui = {
	foldedSections: {},
	foldedBlocks: {},
	selectedCardIdx: 0,
	filename: [],
	saveTime: '-',
	generateModalShown: false
};
let g_previousCardIdx;
let g_dontRenderSelectedCard = false;
let g_isSmallLayout;
let g_canSave;



// ============================================================================
// Data save/load
// ============================================================================

function local_store_cards_save() {
	if (g_canSave && is_storage_available('localStorage') && window.localStorage) {
		try {
			localStorage.setItem('deck', g_deck.stringify(false));
		} catch (e) {
			// TODO GREGOIRE: If the local store save failed notify the user that the data has not been saved
			console.error(e.stack);
		}
	}
}

function local_store_cards_load() {
	if (is_storage_available('localStorage') && window.localStorage) {
		try {
			g_deck.clear();
			g_deck.load(JSON.parse(localStorage.getItem('deck')));
			card_list_update();
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

function sort_execute() {
	$('#sort-modal').modal('hide');

	let fn_code = $('#sort-function').val().toString();

	g_deck.sort(fn_code);

	card_list_update();
}

function filter_execute() {
	$('#filter-modal').modal('hide');

	let fn_code = $('#filter-function').val().toString();

	g_deck.filter(fn_code);

	card_list_update();
}

function load_sample() {
	let deckLength = g_deck.cards.length;

	g_deck.addCards(deckLength, CardExamples());

	card_list_update(true);
	select_card_by_index(deckLength);
	
	local_store_cards_save();
}

function insert_lexical() {
	let cardIdx = g_ui.selectedCardIdx;
	let deckLength = g_deck.cards.length;

	g_deck.addCards(-1, CardLexicals());

	card_list_update(true);
	select_card_by_index(cardIdx + g_deck.cards.length - deckLength);
	
	local_store_cards_save();
}

function clear_all() {
	g_deck.clear();
	g_ui.filename.length = 0;
	card_list_update();
}

function load_deck_to_file(evt) {
	let files = evt.target.files;

	for (let i = 0; i < files.length; i++) {
		let f = files[i];
		g_ui.filename.push(f.name);

		let reader = new FileReader();
		reader.onload = function () {
			let parsedObj = JSON.parse(this.result ? this.result.toString() : '');
			if (parsedObj.cards)
				g_deck.load(parsedObj);
			else
				g_deck.loadCards(parsedObj);
			card_list_update();

			let previouslySelectedIdx = g_ui.selectedCardIdx;
			g_previousCardIdx = g_ui.selectedCardIdx;
			for (g_ui.selectedCardIdx = 0; g_ui.selectedCardIdx < g_deck.cards.length; g_ui.selectedCardIdx++) {
				card_update_selected();
				g_previousCardIdx = g_ui.selectedCardIdx;
			}
			select_card_by_index(previouslySelectedIdx);
		};
		reader.readAsText(f);
	}

	// Reset file input
	$('#file-load-form')[0].reset();
	$('#file-name').html('<b>' + I18N.get('UI.FILE') + ':</b> ' + g_ui.filename.join(', ') + '<br/><b>Last save:</b> ' + g_ui.saveTime);
	local_store_ui_save();
}

function save_deck_to_file() {
	let parts = [g_deck.stringify(true)];
	let blob = new Blob(parts, { type: 'application/json' });
	let url = URL.createObjectURL(blob);

	let a = $('#file-save-link')[0];
	a.href = url;
	g_ui.filename = g_ui.filename[0] || 'Cards.json';
	a.download = prompt('Filename:', g_ui.filename);
	if (a.download && a.download !== 'null') {
		g_ui.filename = [a.download];

		let d = new Date();
		g_ui.saveTime = d.getDate() + '/' + d.getMonth() + '/' + (d.getFullYear() % 100) + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

		$('#file-name').html('<b>' + I18N.get('UI.FILE') + ':</b> ' + g_ui.filename.join(', ') + '<br/><b>Last save:</b> ' + g_ui.saveTime);
		local_store_ui_save();
		a.click();
	}

	setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function generate() {
	if (g_deck.cards.length === 0) {
		alert('Your deck is empty. Please define some cards first, or load the sample deck.');
		return;
	}

	if (g_ui.generateModalShown === false) {
		$('#print-modal').modal('show');
		g_ui.generateModalShown = true;
	}

	// Generate output HTML
	let card_html = g_deck.generatePagesHtml();

	// Open a new window for the output
	// Use a separate window to avoid CSS conflicts
	let tab = window.open('output.html', 'rpg-cards-output');

	// Send the generated HTML to the new window
	// Use a delay to give the new window time to set up a message listener
	setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}


// ============================================================================
// Cards helpers
// ============================================================================

function select_card_by_index(index) {
	const couldSave = g_canSave;
	g_canSave = false;
	if (index >= 0 && index < g_deck.cards.length) {
		let card = g_deck.cards[index];
		if (card.title === 'SEPARATOR') {
			if (index < g_ui.selectedCardIdx) {
				index--;
			} else {
				index++;
			}
		}
	}
	index = Math.min(index, g_deck.cards.length - 1);
	g_previousCardIdx = g_ui.selectedCardIdx;
	g_ui.selectedCardIdx = index;

	local_store_ui_save();

	let card = g_deck.cards[g_ui.selectedCardIdx];
	let previousCard = g_deck.cards[g_previousCardIdx];
	if (!previousCard || previousCard.constructor !== card.constructor)
	{
		$('#default-card-type').val(card ? card.constructor.name : 'Card').change();
	}

	card_update_selected();
	g_canSave = couldSave;
}

function card_add_new() {
	let cardIdx = g_ui.selectedCardIdx;
	let cardType = $('#card-type').val();
	g_deck.addCard(cardIdx, cardType);
	card_list_update(true);
	select_card_by_index(cardIdx + 1);
	
	local_store_cards_save();

	$('#card-title').select();
}

function card_duplicate() {
	let cardIdx = g_ui.selectedCardIdx;
	g_deck.duplicateCard(cardIdx);
	card_list_update(true);
	select_card_by_index(cardIdx + 1);
	
	local_store_cards_save();

	$('#card-title').select();
}

function card_delete() {
	let cardIdx = g_ui.selectedCardIdx;
	g_deck.deleteCard(cardIdx);
	card_list_update(true);
	select_card_by_index(cardIdx);
	
	local_store_cards_save();
}

function card_list_up() {
	let cardIdx = g_ui.selectedCardIdx;
	g_deck.moveCardUp(cardIdx);
	card_list_update(true);
	select_card_by_index(cardIdx - 1);
	
	local_store_cards_save();
}

function card_list_down() {
	let cardIdx = g_ui.selectedCardIdx;
	g_deck.moveCardDown(cardIdx);
	card_list_update(true);
	select_card_by_index(cardIdx + 1);
	
	local_store_cards_save();
}

function card_count_decrease() {
	let idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	let card = g_deck.cards[idx];
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
	local_store_cards_save();
}

function card_count_increase() {
	let idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	let card = g_deck.cards[idx];
	if (!card.count)
		card.count = 1;
	else
		card.count++;

	// Enable minus button
	$(this)[0].parentElement.children[0].disabled = false;

	// Update card count
	let cardCount = $(this)[0].parentElement.children[1];
	cardCount.innerText = card.count;
	local_store_cards_save();
}

function card_change_property() {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		let property = $(this).attr('data-property');
		if ($(this).attr('type') === 'checkbox') {
			card[property] = $(this).is(':checked');
		} else {
			card[property] = $(this).val();
		}
		card_render_selected();
	}
}

function card_change_title() {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		card.title = $('#card-title').val();
		if (g_ui.selectedCardIdx || g_ui.selectedCardIdx === 0) {
			$('#cards-list')[0].children[g_ui.selectedCardIdx].children[0].innerText = card.title;
		}
		card_render_selected();
	}
}

function card_change_color() {
	let color = $(this).val();

	if ($('#' + this.id + '-selector option[value=\'' + color + '\']').length > 0) {
		// Update the color selector to the entered value
		$('#' + this.id + '-selector').colorselector('setColor', color);
	} else {
		let property = $(this).attr('data-property');
		card_set_color(color, property);
	}
}

function card_set_color(color, property) {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		if (color) {
			card[property] = color;
		} else {
			card[property] = g_deck.options.cardsDefault[card.constructor.name][property];
		}

		if (g_ui.selectedCardIdx || g_ui.selectedCardIdx === 0)
			$('#cards-list')[0].children[g_ui.selectedCardIdx].style.backgroundColor = card[property] + '29';

		card_render_selected();
	}
}

function creature_change_stats() {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		let property = $(this).attr('data-index');
		card.stats[property] = $(this).val();
		card_render_selected();
	}
}

function card_change_contents() {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		let value = $(this).val().toString();
		card.contents = value.replace(/[\u202F\u00A0 ]+/g, ' ').split('\n');
		card_render_selected();
	}
}

function card_change_tags() {
	let card = g_deck.cards[g_ui.selectedCardIdx];
	if (card) {
		let value = $(this).val().toString().trim();
		if (value.length === 0) {
			card.tags = [];
		} else {
			card.tags = value.split(',').map(function (val) {
				return val.trim().toLowerCase();
			});
		}
		card_render_selected();
	}
}

function card_list_select_card() {
	let idx = $(this).parent().attr('index');
	select_card_by_index(parseInt(idx));
}

function card_list_update(doNotUpdateSelectedCard) {
	$('#total_card_count').text('(' + g_deck.cards.length + ' ' + I18N.get('UI.UNIQUE') + ')');

	if (g_ui.selectedCardIdx < 0 || g_ui.selectedCardIdx >= g_deck.cards.length)
		g_ui.selectedCardIdx = 0;

	let cardsList = $('#cards-list');
	cardsList.empty();
	for (let i in g_deck.cards) {
		let card = g_deck.cards[i];

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

	if (!doNotUpdateSelectedCard)
		card_update_selected();
}

function card_update_selected() {
	g_dontRenderSelectedCard = true;
	let card = g_deck.cards[g_ui.selectedCardIdx];
	let cardType = 'Card';
	if (card) {
		cardType = card.constructor.name;

		$('#card-title').val(card.title);
		$('#card-title-multiline').prop('checked', card.title_multiline);
		$('#card-subtitle').val(card.subtitle);
		$('#card-color').val(card.color).change();
		$('#card-icon').val(card.icon);
		$('#card-icon-back').val(card.icon_back);
		$('#card-background').val(card.background_image);
		$('#card-description').val(card.description);
		$('#card-contents').val(card.contents.join('\n'));
		if (card.tags)
			$('#card-tags').val(card.tags.join(', '));
		else
			$('#card-tags').val('');
		$('#card-reference').val(card.reference);
		$('#card-compact').prop('checked', card.compact);

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
	} else {
		$('#card-title').val('');
		$('#card-title-multiline').prop('checked', false);
		$('#card-subtitle').val('');
		$('#card-color').val('').change();
		$('#card-icon').val('');
		$('#card-icon-back').val('');
		$('#card-background').val('');
		$('#card-description').val('');
		$('#card-contents').val('');
		$('#card-tags').val('');
		$('#card-reference').val('');
		$('#card-compact').prop('checked', false);

		$('.creature-only').hide();
		$('.item-only').hide();
		$('.spell-only').hide();
		$('.power-only').hide();
	}
	$('#card-form-container').attr('card-type', cardType);
	$('#card-type').val(cardType);

	if (g_deck.cards.length > 0) {
		let cardsList = $('#cards-list');
		if ((g_previousCardIdx || g_previousCardIdx === 0) && g_previousCardIdx < g_deck.cards.length) {
			let oldCard = g_deck.cards[g_previousCardIdx];
			let oldCardElt = cardsList[0].children[g_previousCardIdx];
			oldCardElt.style.backgroundColor = oldCard.color ? oldCard.color + '29' : '';
			oldCardElt.classList.remove('selected');
		}
		let cardScrollHeight = cardsList[0].children[g_ui.selectedCardIdx].scrollHeight;
		let scrollPos = g_ui.selectedCardIdx * cardScrollHeight;
		if (scrollPos < cardsList[0].scrollTop + cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardScrollHeight;
		else if (scrollPos >= cardsList[0].scrollTop + cardsList[0].offsetHeight - 2 * cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardsList[0].offsetHeight + 2 * cardScrollHeight;
		cardsList[0].children[g_ui.selectedCardIdx].classList.add('selected');
	}

	g_dontRenderSelectedCard = false;
	card_render_selected();
}

function card_render_selected() {
	if (g_dontRenderSelectedCard)
		return;
	let card = g_deck.cards[g_ui.selectedCardIdx];
	$('#preview-container').empty();
	if (card) {
		card.update();

		let front = card.generateFront(g_deck.options);
		let back = card.generateBack(g_deck.options);
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
				cardsList[0].children[g_ui.selectedCardIdx].classList.add('card-error');
			else
				cardsList[0].children[g_ui.selectedCardIdx].classList.remove('card-error');
		}
	}
	local_store_cards_save();
}


// ============================================================================
// UI options
// ============================================================================

function option_change_property() {
	let property = $(this).attr('data-property');
	let value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();
	g_deck.options[property] = value;
	card_render_selected();
}

function default_change_type() {
	const couldSave = g_canSave;
	g_canSave = false;
	let cardType = $('#default-card-type').val();
	$('#default-color-selector').colorselector('setColor', g_deck.options.cardsDefault[cardType].color);
	$('#default-color-front-selector').colorselector('setColor', g_deck.options.cardsDefault[cardType].color_front);
	$('#default-icon').val(g_deck.options.cardsDefault['Card'].icon);
	$('#default-color-back-selector').colorselector('setColor', g_deck.options.cardsDefault[cardType].color_back);
	$('#default-icon-back').val(g_deck.options.cardsDefault['Card'].icon_back);
	g_canSave = couldSave;
}

function default_change_property() {
	let property = $(this).attr('data-property');
	let value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();

	let cardType = $('#default-card-type').val();
	g_deck.options.cardsDefault[cardType][property] = value;
	card_render_selected();
}

function default_change_color() {
	let color = $(this).val();

	if ($('#' + this.id + '-selector option[value=\'' + color + '\']').length > 0) {
		// Update the color selector to the entered value
		$('#' + this.id + '-selector').colorselector('setColor', color);
	} else {
		let property = $(this).attr('data-property');
		default_set_color(color, property);
	}
}

function default_set_color(color, property) {
	let cardType = $('#default-card-type').val();
	g_deck.options.cardsDefault[cardType][property] = color;
	
	card_list_update();
}


// ============================================================================
// Typeahead
// ============================================================================

function typeahead_matcher(item) {
	let words = this.query.toLowerCase().split(' ');
	return ~item.toLowerCase().indexOf(words[words.length - 1]);
}

// eslint-disable-next-line no-unused-vars
function typeahead_matcher_contents(item) {
	let selectionStart = this.$element[0].selectionStart;
	let textBefore = this.query.substring(0, selectionStart);
	let lastSpaceIdx = textBefore.search(/\n[^\W]*$/);
	let newWord = textBefore.substring(lastSpaceIdx + 1);
	if (newWord === '')
		return false;
	return item.startsWith(newWord);
}

function typeahead_updater(item) {
	let lastSpaceIdx = this.query.lastIndexOf(' ');
	if (lastSpaceIdx > 0)
		return this.query.substring(0, lastSpaceIdx) + ' ' + item;
	return item;
}

// eslint-disable-next-line no-unused-vars
function typeahead_updater_contents(item) {
	let selectionStart = this.$element[0].selectionStart;
	let textBefore = this.query.substring(0, selectionStart);
	let lastSpaceIdx = textBefore.search(/\W[^\W]*$/);
	textBefore = textBefore.substring(0, lastSpaceIdx + 1);

	this.$element[0].selectionStart = (textBefore + item).length;
	this.$element[0].selectionEnd = this.$element[0].selectionStart;

	let textAfter = this.query.slice(selectionStart);
	return textBefore + item + ' | ' + textAfter;
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


// ============================================================================
// UI setup and change
// ============================================================================

function ui_cards_list_update_height() {
	let cardsListParents = $('#cards-list').parents();
	let top = $('#cards-list').position().top;

	for (let i = 0; i < cardsListParents.length; i++)
		top += $(cardsListParents[i]).position().top;

	$('#cards-list').css('height', ($(window).height() - top) + 'px');
}

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

function ui_small_layout_fold_all_sections(e) {
	if (e && e.isDefaultPrevented())
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

function ui_change_keyup() {
	clearTimeout(ui_change_keyup.timeout);
	ui_change_keyup.timeout = setTimeout(function (element) {
		$(element).trigger('change');
	}, 200, this);
}
ui_change_keyup.timeout = null;

function ui_document_shortcut(e) {
	if (e.key === 'PageUp') {
		if (e.preventDefault)
			e.preventDefault();
		let idx = g_ui.selectedCardIdx;
		if (idx > 0)
			select_card_by_index(idx - 1);
	} else if (e.key === 'PageDown') {
		if (e.preventDefault)
			e.preventDefault();
		let idx = g_ui.selectedCardIdx;
		if (idx < g_deck.cards.length - 1)
			select_card_by_index(idx + 1);
	} else if (e.ctrlKey) {
		if (e.key === 's') {
			if (e.preventDefault)
				e.preventDefault();
			save_deck_to_file();
		} else if (e.key === 'g') {
			if (e.preventDefault)
				e.preventDefault();
			generate();
		} else if (e.key === '+') {
			if (e.preventDefault)
				e.preventDefault();
			let cardsMoreButtonList = $('#cards-list .card-count-more');
			cardsMoreButtonList[g_ui.selectedCardIdx].click();
		} else if (e.key === '-') {
			if (e.preventDefault)
				e.preventDefault();
			let cardsLessButtonList = $('#cards-list .card-count-less');
			cardsLessButtonList[g_ui.selectedCardIdx].click();
		}
	} else if (e.currentTarget.activeElement.nodeName !== 'INPUT' && e.currentTarget.activeElement.nodeName !== 'TEXTAREA') {
		if (e.key === '+') {
			if (e.preventDefault)
				e.preventDefault();
			let cardsMoreButtonList = $('#cards-list .card-count-more');
			cardsMoreButtonList[g_ui.selectedCardIdx].click();
		} else if (e.key === '-') {
			if (e.preventDefault)
				e.preventDefault();
			let cardsLessButtonList = $('#cards-list .card-count-less');
			cardsLessButtonList[g_ui.selectedCardIdx].click();
		}
	} else {
		if (e.key === 'Escape') {
			e.currentTarget.activeElement.blur();
		}
	}
}

function ui_contents_shortcut(e) {
	if (e.shiftKey && e.key === 'Delete') {
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
		if (e.preventDefault)
			e.preventDefault();
	}
	if (e.altKey) {
		if (e.key === 'i') {
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
			if (e.preventDefault)
				e.preventDefault();
		}
		if (e.key === 'b') {
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
			if (e.preventDefault)
				e.preventDefault();
		}
	}
}

function ui_update_lang() {
	$('#button-help').text(I18N.get('UI.HELP'));
	$('#button-icons').text(I18N.get('UI.ICONS'));
	$('#button-language').text(I18N.get('UI.LANGUAGE'));
	$('#button-sort').text(I18N.get('UI.SORT'));
	$('#button-filter').text(I18N.get('UI.FILTER'));
	$('#button-load-sample').text(I18N.get('UI.SAMPLE'));
	$('#button-insert-lexical').text(I18N.get('UI.LEXICAL'));
	$('#button-clear').text(I18N.get('UI.CLEAR'));
	$('#button-import').text(I18N.get('UI.IMPORT'));
	$('#button-save').text(I18N.get('UI.SAVE'));
	$('#button-generate').text(I18N.get('UI.GENERATE'));

	$('#deck-settings-title').text(I18N.get('UI.DECK_SETTINGS'));
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
	$('#total_card_count').text('(' + g_deck.cards.length + ' ' + I18N.get('UI.UNIQUE') + ')');
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
	$('#card-contents-label').text(I18N.get('UI.CONTENTS'));
	$('#card-spell-higher-levels-label').text(I18N.get('SPELL.AT_HIGHER_LEVELS'));
	$('#card-spell-classes-label').text(I18N.get('UI.CLASSES'));
	$('#card-tags-label').text(I18N.get('UI.TAGS'));
	$('#card-reference-label').text(I18N.get('UI.REFERENCE'));
	$('#card-compact-label').text(I18N.get('UI.COMPACT'));
}

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
			let clean_style = function(styleObj) {
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
			default_set_color(color, 'color');
		}
	});

	$('#default-color-front-selector').colorselector({
		callback: function (value, color, title) {
			$('#default-color-front').val(title);
			default_set_color(color, 'color_front');
		}
	});

	$('#default-color-back-selector').colorselector({
		callback: function (value, color, title) {
			$('#default-color-back').val(title);
			default_set_color(color, 'color_back');
		}
	});

	$('#card-color-selector').colorselector({
		callback: function (value, color, title) {
			$('#card-color').val(title);
			card_set_color(color, 'color');
		}
	});

	// Styling
	$('.dropdown-colorselector').addClass('input-group-addon color-input-addon');
}


// ============================================================================
// Page load setup
// ============================================================================

$(async function () {
	await import('./i18n.js');

	let preventPageDownOrUp = function (e) {
		if (e.key === 'PageUp' || e.key === 'PageDown') { // Pg up or down
			if (e.preventDefault)
				e.preventDefault();
		}
	};
	
	g_deck = new Deck();
	g_canSave = false;

	ui_update_lang();

	$(document).on('keydown', ui_document_shortcut);
	ui_setup_resize();

	local_store_cards_load();
	local_store_ui_load();

	if (g_ui.selectedCardIdx >= g_deck.cards.length)
		g_ui.selectedCardIdx = g_deck.cards.length - 1;

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
	$('#button-icons').click(function () { window.open('http://game-icons.net/', '_blank'); });
	$('#button-language').click(function () { $('#language-modal').modal('show'); });
	$('#language-list button').click(update_lang);
	$('#button-sort').click(function () { $('#sort-modal').modal('show'); });
	$('#sort-execute').click(sort_execute);
	$('#button-filter').click(function () { $('#filter-modal').modal('show'); });
	$('#filter-execute').click(filter_execute);

	$('#button-load-sample').click(load_sample);
	$('#button-clear').click(function () { $('#clear-confirmation-modal').modal('show'); });
	$('#clear-modal-confirm').click(clear_all);
	$('#button-generate').click(generate);

	$('#button-import').click(function () { $('#file-import').click(); });
	$('#file-import').change(load_deck_to_file);
	$('#button-save').click(save_deck_to_file);

	if (g_ui.filename)
		$('#file-name').html('<b>' + I18N.get('UI.FILE') + ':</b> ' + g_ui.filename.join(', ') + '<br/><b>Last save:</b> ' + g_ui.saveTime);

	// ----- Page settings

	$('#page-size').val(g_deck.options.pageSize).change(option_change_property);
	$('#page-rows').val(g_deck.options.pageRows).change(option_change_property);
	$('#page-columns').val(g_deck.options.pageColumns).change(option_change_property);
	$('#card-arrangement').val(g_deck.options.cardsArrangement).change(option_change_property);
	$('#card-size').val(g_deck.options.cardsSize).change(option_change_property);
	$('#round-corners').prop('checked', g_deck.options.roundCorners).change(option_change_property);
	$('#spell-classes').prop('checked', g_deck.options.showSpellClasses).change(option_change_property);
	$('#small-icons').prop('checked', g_deck.options.smallIcons).change(option_change_property);
	$('#title-size').val(g_deck.options.titleSize).change(option_change_property);

	// ----- Default values

	$('#default-card-type').change(default_change_type).val('Card').change();
	$('#default-color').change(default_change_color);
	$('#default-color-front').change(default_change_color);
	$('#default-icon').change(default_change_property);
	$('#default-color-back').change(default_change_color);
	$('#default-icon-back').change(default_change_property);

	// ----- Cards list

	$('#button-card-up').click(card_list_up);
	$('#button-card-down').click(card_list_down);
	$('#button-insert-lexical').click(insert_lexical);

	// ----- Card

	$('#button-card-add').click(card_add_new);
	$('#button-card-duplicate').click(card_duplicate);
	$('#button-card-delete').click(card_delete);

	$('#card-title').on('keyup', ui_change_keyup);
	$('#card-title').change(card_change_title);
	$('#card-title-multiline').change(card_change_property);
	$('#card-subtitle').change(card_change_property);
	$('#card-icon').change(card_change_property);
	$('#card-icon-back').change(card_change_property);
	$('#card-background').change(card_change_property);
	$('#card-color').change(card_change_color);
	$('#card-tags').change(card_change_tags);
	$('#card-reference').on('keyup', ui_change_keyup);
	$('#card-reference').change(card_change_property);

	$('#card-description').on('keyup', ui_change_keyup);
	$('#card-description').change(card_change_property);
	/* $("#card-contents").typeahead({
		source: Object.keys(card_element_generators),
		items: 'all',
		minLength: 0,
		matcher: typeahead_contents_matcher,
		updater: typeahead_contents_updater,
		render: typeahead_render
	}); */
	$('#card-contents').on('keyup', ui_change_keyup);
	$('#card-contents').change(card_change_contents);
	$('#card-contents').on('keydown', ui_contents_shortcut);

	$('#card-compact').change(card_change_property);

	// ----- Creature

	$('#card-creature-cr').change(card_change_property);
	$('#card-creature-size').change(card_change_property);
	$('#card-creature-alignment').typeahead({
		source: Object.values(I18N.get('CREATURE.ALIGNMENTS')),
		items: 'all',
		minLength: 0,
		render: typeahead_render
	});
	$('#card-creature-alignment').on('keydown', preventPageDownOrUp);
	$('#card-creature-alignment').change(card_change_property);
	$('#card-creature-type').change(card_change_property);

	$('#card-creature-ac').change(card_change_property);
	$('#card-creature-hp').change(card_change_property);
	$('#card-creature-perception').change(card_change_property);
	$('#card-creature-speed').change(card_change_property);

	$('#card-creature-strength').change(creature_change_stats);
	$('#card-creature-dexterity').change(creature_change_stats);
	$('#card-creature-constitution').change(creature_change_stats);
	$('#card-creature-intelligence').change(creature_change_stats);
	$('#card-creature-wisdom').change(creature_change_stats);
	$('#card-creature-charisma').change(creature_change_stats);

	$('#card-creature-resistances').change(card_change_property);
	$('#card-creature-vulnerabilities').change(card_change_property);
	$('#card-creature-immunities').change(card_change_property);

	// ----- Spell

	$('#card-spell-level').change(card_change_property);
	$('#card-spell-ritual').change(card_change_property);
	$('#card-spell-casting-time').change(card_change_property);
	$('#card-spell-casting-time').on('keyup', ui_change_keyup);
	$('#card-spell-range').change(card_change_property);
	$('#card-spell-range').on('keyup', ui_change_keyup);
	$('#card-spell-verbal').change(card_change_property);
	$('#card-spell-somatic').change(card_change_property);
	$('#card-spell-materials').change(card_change_property);
	$('#card-spell-duration').change(card_change_property);
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
	$('#card-spell-type').change(card_change_property);
	$('#card-spell-higher-levels').on('keyup', ui_change_keyup);
	$('#card-spell-higher-levels').change(card_change_property);
	$('#card-spell-classes').typeahead({
		source: Object.values(I18N.get('CLASSES')),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$('#card-spell-classes').on('keydown', preventPageDownOrUp);
	$('#card-spell-classes').change(card_change_property);

	card_list_update();

	g_canSave = true;

	$(window).resize();
});
