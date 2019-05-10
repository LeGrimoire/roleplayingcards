import { Card } from './card.js';
import { ItemCard, } from './card_item.js';
import { PowerCard } from './card_power.js';
import { SpellCard } from './card_spell.js';
import { CreatureCard } from './card_creature.js';

export class DocumentOptions {
	pageSize = 'A4';
	pageRows = 3;
	pageColumns = 3;
	cardsArrangement = 'front_only';
	cardsSize = '25x35';
	smallIcons = true;
	roundCorners = true;
	showSpellClasses = false;
	titleSize = '13';
	cardDefault = new Card();

	constructor() {
		this.cardDefault.color_front = this.cardDefault.color;
		this.cardDefault.color_back = this.cardDefault.color;
		this.cardDefault.color = '';
		this.cardDefault.icon = '';
	}
}

export class Deck {
	#cards = [];
	options = new DocumentOptions();

	constructor() {
	}

	get cards() {
		return this.#cards;
	}

	clear() {
		this.#cards = [];
	}

	/**
	 * @param {number} cardIdx
	 * @param {Card[]} cards
	 */
	addCards(cardIdx, cards) {
		cards.forEach(function (card) {
			card.update();
		});

		if (cardIdx + 1 < this.#cards.length && cardIdx >= 0) {
			let cards_after = this.#cards.splice(cardIdx + 1, this.#cards.length - cardIdx - 1);
			this.#cards = this.#cards.concat(cards).concat(cards_after);
		} else {
			this.#cards = this.#cards.concat(cards);
		}
	}

	/**
	 * @param {number} cardIdx
	 * @param {string} cardType
	 */
	addCard(cardIdx, cardType) {
		let new_card;
		if (cardType === CreatureCard.name)
			new_card = new CreatureCard();
		else if (cardType === ItemCard.name)
			new_card = new ItemCard();
		else if (cardType === SpellCard.name)
			new_card = new SpellCard();
		else if (cardType === PowerCard.name)
			new_card = new PowerCard();
		else
			new_card = new Card();

		new_card.title = 'New ' + new_card.constructor.name;
		if (cardIdx + 1 < this.#cards.length && cardIdx >= 0) {
			let cards_after = this.#cards.splice(cardIdx + 1, this.#cards.length - cardIdx - 1, new_card);
			this.#cards = this.#cards.concat(cards_after);
		} else {
			this.#cards.push(new_card);
		}
	}

	/**
	 * @param {number} cardIdx
	 */
	duplicateCard(cardIdx) {
		if (cardIdx >= this.#cards.length || cardIdx < 0)
			return;

		let old_card = this.#cards[cardIdx];
		let new_card = old_card.clone();

		new_card.title = new_card.title + '(Copy)';
		if (cardIdx + 1 < this.#cards.length) {
			let cards_after = this.#cards.splice(cardIdx + 1, this.#cards.length - cardIdx - 1, new_card);
			this.#cards = this.#cards.concat(cards_after);
		} else {
			this.#cards.push(new_card);
		}
	}

	/**
	 * @param {number} cardIdx
	 */
	deleteCard(cardIdx) {
		if (cardIdx >= this.#cards.length || cardIdx < 0)
			return;

		this.#cards.splice(cardIdx, 1);
	}

	/**
	 * @param {number} cardIdx
	 */
	moveCardUp(cardIdx) {
		if (cardIdx >= this.#cards.length || cardIdx <= 0)
			return;

		let old_card = this.#cards[cardIdx];
		this.#cards[cardIdx] = this.#cards[cardIdx - 1];
		this.#cards[cardIdx - 1] = old_card;
	}

	/**
	 * @param {number} cardIdx
	 */
	moveCardDown(cardIdx) {
		if (cardIdx >= this.#cards.length - 1 || cardIdx < 0)
			return;

		let old_card = this.#cards[cardIdx];
		this.#cards[cardIdx] = this.#cards[cardIdx + 1];
		this.#cards[cardIdx + 1] = old_card;
	}

	/**
	 * @param {Object[]} cards
	 */
	load(cards) {
		let data = cards || this.cards;
		for (let i in data) {
			let card;
			if (!data[i].cardType)
				card = new Card();
			else if (data[i].cardType === CreatureCard.name)
				card = new CreatureCard();
			else if (data[i].cardType === ItemCard.name)
				card = new ItemCard();
			else if (data[i].cardType === SpellCard.name)
				card = new SpellCard();
			else if (data[i].cardType === PowerCard.name)
				card = new PowerCard();
			else
				card = new Card();

			for (const key in card) {
				if (card.hasOwnProperty(key) && data[i].hasOwnProperty(key)) {
					card[key] = data[i][key];
				}
			}

			data[i] = card;
		}
		this.addCards(this.#cards.length, data);
	}

	/**
	 * @param {boolean} readable
	 */
	stringify(readable) {
		let defaultCard = new Card();
		let defaultCreature = new CreatureCard();
		let defaultItem = new ItemCard();
		let defaultSpell = new SpellCard();
		let defaultPower = new PowerCard();

		let strCards = readable ? '[\n' : '[';
		for (let i = 0; i < this.#cards.length; ++i) {
			let card = this.#cards[i];
			let strCard = '';

			if (card.constructor === CreatureCard) {
				strCard = JSON.stringify(card, function (key, value) {
					if ((Array.isArray(value) && value.length === 0))
						return;
					if (value !== defaultCreature[key])
						return value;
				}, readable ? '\t' : undefined);
			} else if (card.constructor === ItemCard) {
				strCard = JSON.stringify(card, function (key, value) {
					if ((Array.isArray(value) && value.length === 0))
						return;
					if (value !== defaultItem[key])
						return value;
				}, readable ? '\t' : undefined);
			} else if (card.constructor === SpellCard) {
				strCard = JSON.stringify(card, function (key, value) {
					if ((Array.isArray(value) && value.length === 0))
						return;
					if (value !== defaultSpell[key])
						return value;
				}, readable ? '\t' : undefined);
			} else if (card.constructor === PowerCard) {
				strCard = JSON.stringify(card, function (key, value) {
					if ((Array.isArray(value) && value.length === 0))
						return;
					if (value !== defaultPower[key])
						return value;
				}, readable ? '\t' : undefined);
			} else {
				strCard = JSON.stringify(card, function (key, value) {
					if ((Array.isArray(value) && value.length === 0))
						return;
					if (value !== defaultCard[key])
						return value;
				}, readable ? '\t' : undefined);
			}

			if (card.constructor !== PowerCard) {
				if (readable) {
					strCard = strCard.slice(0, strCard.length - 2);
					if (strCard.length > 2)
						strCard = strCard.concat(',');
					strCard = strCard.concat('\n\t"cardType": "' + card.constructor.name + '"\n}');
				} else {
					strCard = strCard.slice(0, strCard.length - 1);
					if (strCard.length > 1)
						strCard = strCard.concat(',');
					strCard = strCard.concat('"cardType":"' + card.constructor.name + '"}');
				}
			}

			if (i < this.#cards.length - 1)
				strCard = strCard.concat(readable ? ',\n' : ',');
			strCards = strCards.concat(strCard);
		}
		strCards = strCards.concat(readable ? '\n]' : ']');
		return strCards;
	}

	/**
	 * @param {string} fn_code The sorting code to use.
	 */
	sort(fn_code) {
		var fn = new Function('card_a', 'card_b', fn_code);

		this.cards = this.cards.sort(function (card_a, card_b) {
			let result = fn(card_a, card_b);
			return result;
		});
	}

	/**
	 * @param {string} fn_code The filtering code to use.
	 */
	filter(fn_code) {
		var fn = new Function('card', fn_code);

		this.cards = this.cards.filter(function (card) {
			let result = fn(card);
			if (result === undefined) return true;
			else return result;
		});
	}

	
	generatePagesHtml() {
		// Generate the HTML for each card
		let front_cards = [];
		let back_cards = [];
		this.#cards.forEach(function (card) {
			let count = card.count === 0 ? 0 : (card.count || 1);
			let front = card.generateFront(this.options);
			let back = card.generateBack(this.options);
			front_cards = front_cards.concat(card_repeat(front, count));
			back_cards = back_cards.concat(card_repeat(back, count));
		});

		let pages = [];
		if (this.options.cardsArrangement === 'doublesided') {
			// Add padding cards so that the last page is full of cards
			front_cards = cards_add_last_page_padding(front_cards, this.options);
			back_cards = cards_add_last_page_padding(back_cards, this.options);

			// Split cards to pages
			let front_pages = cards_split_to_pages(front_cards, this.options);
			let back_pages = cards_split_to_pages(back_cards, this.options);

			// Shuffle back cards so that they line up with their corresponding front cards
			back_pages = back_pages.map(function (page) {
				let result = [];
				let i = 0;
				for (let r = 0; r < this.options.pageRows; ++r) {
					i += this.options.pageColumns;
					for (let c = 0; c < this.options.pageColumns; ++c) {
						result.push(page[i - 1 - c]);
					}
				}
				return result;
			});

			// Interleave front and back pages so that we can print double-sided
			for (let i = 0; i < front_pages.length; ++i) {
				pages.push(front_pages[i]);
				pages.push(back_pages[i]);
			}
		} 
		else if (this.options.cardsArrangement === 'front_only') {
			// Add padding cards so that the last page is full of cards
			front_cards = cards_add_last_page_padding(front_cards, this.options);
			
			// Split cards to pages
			pages = cards_split_to_pages(front_cards, this.options);
		} 
		else if (this.options.cardsArrangement === 'side_by_side') {
			let cardsStr = [];
			for (let i = 0; i < front_cards.length; i++) {
				cardsStr.push(front_cards[i]);
				cardsStr.push(back_cards[i]);
				if (this.options.pageColumns > 2) {
					cardsStr.concat(card_repeat(card_generate_empty(this.options), this.options.pageColumns - 2));
				}
			}
			
			// Add padding cards so that the last page is full of cards
			cardsStr = cards_add_last_page_padding(cardsStr, this.options);

			// Split cards to pages
			pages = cards_split_to_pages(cardsStr, this.options);
		}

		// Wrap all pages in a <page> element and add CSS for the page size
		let size = 'A4';
		switch (this.options.pageSize) {
			case 'A3': size = 'A3 portrait'; break;
			case 'A4': size = '210mm 297mm'; break;
			case 'A5': size = 'A5 portrait'; break;
			case 'Letter': size = 'letter portrait'; break;
			case '25x35': size = '2.5in 3.5in'; break;
			default: size = 'auto';
		}

		let result = '';
		result += '<style>\n';
		result += '@page {\n';
		result += '    margin: 0;\n';
		result += '    size:' + size + ';\n';
		result += '    -webkit-print-color-adjust: exact;\n';
		result += '}\n';
		result += '</style>\n';

		for (let i = 0; i < pages.length; ++i) {
			let style = '';
			if ((this.options.cardsArrangement === 'doublesided') && (i % 2 === 1)) {
				style += 'style="background-color:white"';
			} else {
				style += 'style="background-color:white"';
			}
			result += '<page class="page page-preview" size="' + size + '" ' + style + '>\n';
			result += pages[i].join('\n');
			result += '</page>\n';
		}
		return result;
	}
}



/**
 * @param {DocumentOptions} options
 * @returns {string}
 */
function card_generate_empty(options) {
	let color = 'white';
	let style_color = 'style="color:' + color + ';border-color:' + color + ';background-color:' + color + '"';
	let result = '';
	result += '<div class="card card-size-' + options.cardsSize + '" ' + style_color + '>';
	result += '</div>';
	return result;
}

/**
 * @param {string} card
 * @param {number} count
 * @returns {string[]}
 */
function card_repeat(card, count) {
	let result = [];
	for (let i = 0; i < count; ++i) {
		result.push(card);
	}
	return result;
}

/**
 * @param {string[]} cards  
 * @param {DocumentOptions} options
 * @returns {string[]}
 */
function cards_add_last_page_padding(cards, options) {
	let cards_per_page = options.pageRows * options.pageColumns;
	let last_page_cards = cards.length % cards_per_page;
	if (last_page_cards !== 0) {
		return cards.concat(card_repeat(card_generate_empty(options), cards_per_page - last_page_cards));
	} else {
		return cards;
	}
}

/**
 * @param {string[]} cards
 * @param {DocumentOptions} options
 * @returns {string[][]}
 */
function cards_split_to_pages(cards, options) {
	let cards_per_page = options.pageRows * options.pageColumns;
	let pages = [];
	for (let i = 0; i < cards.length; i += cards_per_page) {
		let page = cards.slice(i, i + cards_per_page);
		pages.push(page);
	}
	return pages;
}
