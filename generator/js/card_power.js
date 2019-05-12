import { Card } from './card.js';

export class PowerCard extends Card {
	constructor() {
		super();
		this.color = '#2F4F4F';
		this.color_front = this.color;
		this.color_back = this.color;
		this.icon = 'lob-arrow';
	}
}
