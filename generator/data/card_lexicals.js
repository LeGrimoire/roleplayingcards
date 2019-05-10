
import { Card } from '../js/card.js';
import { I18N } from '../js/i18n_french.js';

/**
 * @returns {Card[]}
 */
export function CardLexicals() {
	let cards = [];

	// Picto
	let card = new Card();
	card.title = I18N.PICTO;
	for (let i = 0; i < I18N.DAMAGE_TYPES.length; i++) {
		let line = 'property | ' + I18N.DAMAGE_TYPES[i].name + ' | ' + I18N.DAMAGE_TYPES[i].name;
		if (i < I18N.DAMAGE_TYPES.length - 1) {
			i++;
			line += ' | property | ' + I18N.DAMAGE_TYPES[i].name + ' | ' + I18N.DAMAGE_TYPES[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push('line');
	for (let i = 0; i < I18N.CONDITION.length; i++) {
		let line = 'property | ' + I18N.CONDITION[i].name + ' | ' + I18N.CONDITION[i].name;
		if (i < I18N.CONDITION.length - 1) {
			i++;
			line += ' | property | ' + I18N.CONDITION[i].name + ' | ' + I18N.CONDITION[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push('line');
	for (let i = 0; i < I18N.CUSTOM_ICONS.length; i++) {
		let line = 'property | ' + I18N.CUSTOM_ICONS[i].name + ' | ' + I18N.CUSTOM_ICONS[i].name;
		if (i < I18N.CUSTOM_ICONS.length - 1) {
			i++;
			line += ' | property | ' + I18N.CUSTOM_ICONS[i].name + ' | ' + I18N.CUSTOM_ICONS[i].name;
		}
		card.contents.push(line);
	}
	cards.push(card);

	// Lexical
	card = new Card();
	card.title = I18N.ABREVIATIONS_TITLE;
	for (let i = 0; i < I18N.ABREVIATIONS.length; i++) {
		let line = 'property | ' + I18N.ABREVIATIONS[i].name + ' | ' + I18N.ABREVIATIONS[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	// Common rules
	card = new Card();
	card.title = I18N.COMMON_RULES_TITLE;
	for (let i = 0; i < I18N.COMMON_RULES.length; i++) {
		let line = 'property | ' + I18N.COMMON_RULES[i].name + ' | ' + I18N.COMMON_RULES[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	return cards;
}
