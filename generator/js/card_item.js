import { Card } from './card.js';

export class ItemCard extends Card {
	constructor() {
		super();
		this.color = '#696969';
		this.icon = 'swap-bag';
	}

	/**
	 * @returns {ItemCard}
	 */
	clone() {
		let card = new ItemCard();
		Object.assign(card, this);
		return card;
	}
}
