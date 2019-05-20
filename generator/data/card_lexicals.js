
import { Card } from '../js/card.js';
import { I18N } from '../js/i18n.js';

/**
 * @return {Card[]}
 */
export function CardLexicals() {
	let cards = [];

	// Picto
	let card = new Card();
	card.title = I18N.get('PICTO');
	let damageTypes = I18N.get('DAMAGE_TYPES');
	for (let i = 0; i < damageTypes.length; i++) {
		let line = 'property | ' + damageTypes[i].name + ' | \\' + damageTypes[i].name;
		if (i < I18N.get('DAMAGE_TYPES.').length - 1) {
			i++;
			line += ' | property | ' + damageTypes[i].name + ' | \\' + damageTypes[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push('line');
	let conditions = I18N.get('CONDITION');
	for (let i = 0; i < conditions.length; i++) {
		let line = 'property | ' + conditions[i].name + ' | \\' + conditions[i].name;
		if (i < conditions.length - 1) {
			i++;
			line += ' | property | ' + conditions[i].name + ' | \\' + conditions[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push('line');
	let customIcons = I18N.get('CUSTOM_ICONS');
	for (let i = 0; i < customIcons.length; i++) {
		let line = 'property | ' + customIcons[i].name + ' | \\' + customIcons[i].name;
		if (i < customIcons.length - 1) {
			i++;
			line += ' | property | ' + customIcons[i].name + ' | \\' + customIcons[i].name;
		}
		card.contents.push(line);
	}
	cards.push(card);

	// Lexical
	card = new Card();
	card.title = I18N.get('ABREVIATIONS_TITLE');
	let abreviations = I18N.get('ABREVIATIONS');
	for (let i = 0; i < abreviations.length; i++) {
		let line = 'property | ' + abreviations[i].name + ' | ' + abreviations[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	// Common rules
	card = new Card();
	card.title = I18N.get('COMMON_RULES_TITLE');
	let commonRules = I18N.get('COMMON_RULES');
	for (let i = 0; i < commonRules.length; i++) {
		let line = 'property | ' + commonRules[i].name + ' | ' + commonRules[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	return cards;
}
