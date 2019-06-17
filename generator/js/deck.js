import { Card } from './card.js';
import { CreatureCard } from './card_creature.js';
import { ItemCard } from './card_item.js';
import { PowerCard } from './card_power.js';
import { SpellCard } from './card_spell.js';

export class DeckOptions {
	name = 'Deck';
	filename = 'Deck.json';
	pageSize = 'A4';
	pageRows = 3;
	pageColumns = 3;
	cardsArrangement = 'front_only';
	cardsSize = '25x35';
	smallIcons = true;
	roundCorners = true;
	showSpellClasses = false;
	titleSize = '14';
	count = 1;
	cardsDefault = {};

	constructor(name) {
		this.name = name || this.name;
		this.filename = this.name + '.json';
		this.cardsDefault['Card'] = new Card();
		this.cardsDefault['CreatureCard'] = new CreatureCard();
		this.cardsDefault['ItemCard'] = new ItemCard();
		this.cardsDefault['SpellCard'] = new SpellCard();
		this.cardsDefault['PowerCard'] = new PowerCard();
	}

	stringify(space) {
		let result = '{';
		for (const property in this) {
			if (property === 'cardsDefault' || property === 'filename')
				continue;
			if (space) {
				result += '\n' + space + '\t"' + property + '":';
				result += JSON.stringify(this[property], null, '\t');
				result += ',';
			} else {
				result += '"' + property + '":';
				result += JSON.stringify(this[property]);
				result += ',';
			}
		}

		if (space) {
			result += '\n' + space + '\t"cardsDefault":{';
		} else {
			result += '"cardsDefault":{';
		}

		for (const cardType in this.cardsDefault) {
			if (space) {
				result += '\n' + space + '\t\t"' + cardType + '":';
				result += this.cardsDefault[cardType].stringify(null, space + '\t\t');
				result += ',';
			} else {
				result += '"' + cardType + '":';
				result += this.cardsDefault[cardType].stringify(null);
				result += ',';
			}
		}

		if (space) {
			result = result.slice(0, result.length - 1);// Remove the last ','
			result += '\n' + space + '\t}\n' + space + '}';
		} else {
			result = result.slice(0, result.length - 1);// Remove the last ','
			result += '}}';
		}

		return result;
	}

	load(options) {
		for (const property in options) {
			if (property === 'cardsDefault')
				continue;
			if (this.hasOwnProperty(property)) {
				this[property] = options[property];
			}
		}
		if (options.cardsDefault) {
			for (const cardType in options.cardsDefault) {
				if (!this.cardsDefault.hasOwnProperty(cardType))
					continue;

				for (const key in this.cardsDefault[cardType]) {
					if (options.cardsDefault[cardType].hasOwnProperty(key)) {
						this.cardsDefault[cardType][key] = options.cardsDefault[cardType][key];
					}
				}

				this.cardsDefault[cardType].update();
			}
		}
	}
}

export class Deck {
	/** @type {Card[]} */
	#cards = [];
	/** @type {DeckOptions} */
	options = null;

	constructor(name) {
		this.options = new DeckOptions(name);
	}

	/**
	 * @return {Card[]}
	 */
	get cards() {
		return this.#cards;
	}

	clear() {
		this.#cards.length = 0;
		this.options = new DeckOptions();
	}

	/**
	 * @param {number} cardIdx
	 * @param {Card[]} cards
	 */
	addCards(cardIdx, cards) {
		cards.forEach(function (card) {
			card.update();
		});

		if (cardIdx + 1 < this.#cards.length && cardIdx + 1 >= 0) {
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
		if (cardType === 'CreatureCard')
			new_card = new CreatureCard();
		else if (cardType === 'ItemCard')
			new_card = new ItemCard();
		else if (cardType === 'SpellCard')
			new_card = new SpellCard();
		else if (cardType === 'PowerCard')
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
	 * @param {string} space
	 */
	stringifyCards(space) {
		let strCards = '[';
		for (let i = 0; i < this.#cards.length; ++i) {
			let card = this.#cards[i];
			let strCard = '';
			strCard += card.stringify(this.options, space ? space + '\t' : null);

			if (i < this.#cards.length - 1)
				strCard += ',';
			strCards += strCard;
		}
		strCards += space ? '\n' + space + ']' : ']';
		return strCards;
	}

	/**
	 * @param {Object[]} cards
	 */
	loadCards(cards) {
		for (const i in cards) {
			let card;
			if (cards[i].cardType === 'CreatureCard')
				card = new CreatureCard();
			else if (cards[i].cardType === 'ItemCard')
				card = new ItemCard();
			else if (cards[i].cardType === 'SpellCard')
				card = new SpellCard();
			else if (cards[i].cardType === 'PowerCard')
				card = new PowerCard();
			else
				card = new Card();

			for (const key in cards[i]) {
				if (card.hasOwnProperty(key)) {
					card[key] = cards[i][key];
				}
			}

			card.update();
			this.#cards.push(card);
		}
	}

	/**
	 * @param {boolean} readable
	 */
	stringify(readable) {
		let result = '{';
		if (readable) {
			result += '\n\t"options":' + this.options.stringify('\t') + ',';
			result += '\n\t"cards":' + this.stringifyCards('\t');
			result += '\n}';
		} else {
			result += '"options":' + this.options.stringify() + ',';
			result += '"cards":' + this.stringifyCards();
			result += '}';
		}
		return result;
	}

	/**
	 * @param {Object} deck
	 */
	load(deck) {
		if (deck.options)
			this.options.load(deck.options);
		if (deck.cards)
			this.loadCards(deck.cards);
	}


	/**
	 * @param {string} fn_code The sorting code to use.
	 */
	sort(fn_code) {
		let fn = new Function('card_a', 'card_b', fn_code);

		this.cards = this.cards.sort(function (card_a, card_b) {
			let result = fn(card_a, card_b);
			return result;
		});
	}

	/**
	 * @param {string} fn_code The filtering code to use.
	 */
	filter(fn_code) {
		let fn = new Function('card', fn_code);

		this.cards = this.cards.filter(function (card) {
			let result = fn(card);
			if (result === undefined) return true;
			else return result;
		});
	}


	generatePagesHtml() {
		// Generate the HTML for each card
		/** @type {string[]} */
		let frontCards = [];
		/** @type {string[]} */
		let backCards = [];
		let options = this.options;
		
		for (let i = 0; i < options.count; i++) {
			this.cards.forEach(function (card) {
				let front = card.generateFront(options);
				let back = card.generateBack(options);
				frontCards = frontCards.concat(card_repeat(front, card.count));
				backCards = backCards.concat(card_repeat(back, card.count));
			});
		}

		/** @type {string[][]} */
		let pages = [];
		if (this.options.cardsArrangement === 'doublesided') {
			// Add padding cards so that the last page is full of cards
			frontCards = cards_add_last_page_padding(frontCards, this.options);
			backCards = cards_add_last_page_padding(backCards, this.options);

			// Split cards to pages
			let frontPages = cards_split_to_pages(frontCards, this.options);
			let backPages = cards_split_to_pages(backCards, this.options);

			// Mirror back cards so that they line up with their corresponding front cards
			backPages = backPages.map(function (page) {
				let resultPage = [];
				let i = 0;
				for (let r = 0; r < options.pageRows; ++r) {
					i += options.pageColumns;
					for (let c = 0; c < options.pageColumns; ++c) {
						resultPage.push(page[i - 1 - c]);
					}
				}
				return resultPage;
			});

			// Interleave front and back pages so that we can print double-sided
			for (let i = 0; i < frontPages.length; ++i) {
				pages.push(frontPages[i]);
				pages.push(backPages[i]);
			}
		}
		else if (this.options.cardsArrangement === 'front_only') {
			// Add padding cards so that the last page is full of cards
			frontCards = cards_add_last_page_padding(frontCards, this.options);

			// Split cards to pages
			pages = cards_split_to_pages(frontCards, this.options);
		}
		else if (this.options.cardsArrangement === 'side_by_side') {
			/** @type {string[]} */
			let cardsStr = [];
			const nbPaddingColumns = this.options.pageColumns - (this.options.pageColumns % 2);
			for (let i = 0; i < frontCards.length; i++) {
				cardsStr.push(frontCards[i]);
				cardsStr.push(backCards[i]);
				if (nbPaddingColumns > 0) {
					cardsStr = cardsStr.concat(card_repeat(card_generate_empty(this.options), nbPaddingColumns));
				}
			}

			// Add padding cards so that the last page is full of cards
			cardsStr = cards_add_last_page_padding(cardsStr, this.options);

			// Split cards to pages
			pages = cards_split_to_pages(cardsStr, this.options);
		}

		let size = 'A4';
		switch (this.options.pageSize) {
			case 'A3': size = 'A3 portrait'; break;
			case 'A4': size = '210mm 297mm'; break;
			case 'A5': size = 'A5 portrait'; break;
			case 'Letter': size = 'letter portrait'; break;
			case '25x35': size = '2.5in 3.5in'; break;
			default: size = 'auto';
		}

		let resultHtml = '';
		resultHtml += '<style>\n';
		resultHtml += '@page {\n';
		resultHtml += '    margin: 0;\n';
		resultHtml += '    size:' + size + ';\n';
		resultHtml += '    -webkit-print-color-adjust: exact;\n';
		resultHtml += '}\n';
		resultHtml += '</style>\n';

		// Wrap all pages in a <page> element and add CSS for the page size
		for (let i = 0; i < pages.length; ++i) {
			let style = '';
			if ((this.options.cardsArrangement === 'doublesided') && (i % 2 === 1)) {
				style += 'style="background-color:white"';
			} else {
				style += 'style="background-color:white"';
			}
			resultHtml += '<page class="page page-preview" size="' + this.options.pageSize + '" ' + style + '>\n';
			resultHtml += pages[i].join('\n');
			resultHtml += '</page>\n';
		}
		return resultHtml;
	}
}



/**
 * @param {DeckOptions} options
 * @return {string}
 */
function card_generate_empty(options) {
	let color = 'white';
	let style_color = 'style="color:' + color + ';border-color:' + color + ';background-color:' + color + '"';
	let resultCard = '';
	resultCard += '<div class="card card-size-' + options.cardsSize + '" ' + style_color + '>';
	resultCard += '</div>';
	return resultCard;
}

/**
 * @param {string} cardStr
 * @param {number} count
 */
function card_repeat(cardStr, count) {
	let resultCards = [];
	for (let i = 0; i < count; ++i) {
		resultCards.push(cardStr);
	}
	return resultCards;
}

/**
 * @param {string[]} cards  
 * @param {DeckOptions} options
 * @return {string[]}
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
 * @param {DeckOptions} options
 * @return {string[][]}
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
