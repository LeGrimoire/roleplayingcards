import { Card } from './card.js';

export class PowerCard extends Card {
	constructor() {
		super();
		this.color = '#2F4F4F';
		this.icon = 'lob-arrow';
	}

	/**
	 * @returns {PowerCard}
	 */
	clone() {
		let card = new PowerCard();
		Object.assign(card, this);
		return card;
	}
}
