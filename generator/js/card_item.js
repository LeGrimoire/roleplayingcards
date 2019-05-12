import { Card } from './card.js';

export class ItemCard extends Card {
	constructor() {
		super();
		this.color = '#696969';
		this.color_front = this.color;
		this.color_back = this.color;
		this.icon = 'swap-bag';
	}
}
