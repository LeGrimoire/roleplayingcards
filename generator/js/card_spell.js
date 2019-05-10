import { I18N } from './i18n_french.js';
import { Card } from './card.js';

export class SpellCard extends Card {
	level = 1;
	type = '';
	ritual = false;
	range = '18 m';
	casting_time = '1 action';
	duration = '1 round';
	materials = '';
	verbal = false;
	somatic = false;
	higherLevels = '';
	classes = '';

	constructor() {
		super();
		this.color = '#800000';
		this.icon_back = 'magic-swirl';
		this.title_multiline = true;
	}

	/**
	 * @returns {SpellCard}
	 */
	clone() {
		let card = new SpellCard();
		Object.assign(card, this);
		return card;
	}

	/**
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateHeader(options) {
		let result = '<div class="card-title-inlineicon-container">';
		if (this.level)
			result += '<div class="card-title-spellicon icon-spell-level_' + this.level + '"></div>';
		result += '</div>';
		result += '<div class="card-subtitle card-spell-subtitle">' + this.type;
		if (this.ritual)
			result += ' (' + I18N.RITUAL + ')';
		result += '</div>';
		return result;
	}

	/**
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBase(options) {
		let color = this.colorFront(options);
		let result = '<div class="card-spell-base">';

		result += '<div class="card-spell-base-texts" style="background-color:' + color + '33;">';

		result += '<div>';
		result += '<h4>' + I18N.CASTING_TIME + ':</h4>';
		result += '<p>' + this.casting_time + '</p>';
		result += '</div>';

		result += '<div>';
		result += '<h4>' + I18N.RANGE + ':</h4>';
		result += '<p>' + this.range + '</p>';
		result += '</div>';

		result += '<div>';
		result += '<h4>' + I18N.DURATION + ':</h4>';
		result += '<p>' + this.duration + '</p>';
		result += '</div>';

		result += '</div>';

		result += '<div class="card-spell-components">';
		// let colorStyle = 'filter:sepia(1) hue-rotate(86deg) saturate(10) brightness(0.7);';
		if (this.materials) {
			result += '<span class="card-inlineicon icon-custom-arrow-down" style="top:1px;"></span>';
		}
		result += '<span class="card-inlineicon icon-spell-materials" style="' + (this.materials ? 'margin-left:0px;' : 'opacity:0.4;') + '"></span>';
		result += '<span class="card-inlineicon icon-spell-verbal" style="' + (this.verbal ? '' : 'opacity:0.4;') + '"></span>';
		result += '<span class="card-inlineicon icon-spell-somatic" style="' + (this.somatic ? '' : 'opacity:0.4;') + '"></span>';
		if (this.materials) {
			result += '<p class="card-spell-materials">' + this.materials + '</p>';
		}
		result += '</div>';

		result += this.generateElement_ruler(null, options);
		result += '</div>';
		return result;
	}

	/**
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBottom(options) {
		let color = this.colorFront(options);
		let result = '';
		if (this.higherLevels && this.higherLevels.length > 0) {
			if (this.elementCounts['fill'] === 0) {
				result += this.generateElement_fill(['1'], options);
			}
			result += '<div class="card-spell-higher-levels">';
			result += '<h3 style="color:' + color + ';background-color:' + color + '33;">' + I18N.AT_HIGHER_LEVELS + '</h3>';
			result += '<p class="card-element" style="background-color:' + color + '11;">' + Card.parse_icons_params(this.higherLevels) + '</p>';
			result += '</div>';
		}
		return result;
	}

	/**
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateFooter(options) {
		let result = '';
		if (options.showSpellClasses) {
			result += '<div class="card-spell-classes">';
			let classesKeys = Object.keys(I18N.CLASSES);
			for (let i = 0; i < classesKeys.length; i++) {
				let isForClass = this.classes.search(new RegExp(I18N.CLASSES[classesKeys[i]], 'gi')) !== -1;
				result += '<span class="card-class-inlineicon icon-class-' + classesKeys[i].toLowerCase() + (isForClass ? '' : ' card-class-hidden') + '"></span>';
			}
			result += '</div>';
		}
		return result;
	}
	

	/**
	 * @param {string[]} params
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_spells(params, options) {
		let result = '';
		result += '<div class="card-element card-spells-line">';
		if (params[0])
			result += '<h4 class="card-inlineicon icon-spell-caster_' + params[0] + '"></h4>';
		else
			result += '<h4 class="card-inlineicon icon-spell-caster"></h4>';
		result += '<p class="card-spells-ability">' + params[1] + '</p>';
		if (params.length === 3) {
			result += '<p class="card-spells-level"><span class="card-inlineicon icon-spell-level"></span></p>';
			result += '<p class="card-spells-list">' + params[2] + '</p>';
		} else {
			if (params[2]) {
				result += '<p class="card-spells-level"><span class="card-inlineicon icon-spell-level_0"></span></p>';
				result += '<p class="card-spells-list">' + params[2] + '</p>';
			}
			let last = params.length - 1;
			for (let i = 1; i < 9; i++) {
				let level = 2 * i + 1;
				if (params[level] && params[level + 1]) {
					last = level + 2;

					result += '<p class="card-spells-level"><span class="card-inlineicon icon-spell-level_' + i + '"></span>(' + params[level] + ')</p>';
					result += '<p class="card-spells-list">' + params[level + 1] + '</p>';
				}
			}
			if (last > 2 && params[last])
				result += '<p class="card-spells-text">' + Card.parse_icons_params(params[last]) + '</p>';
		}
		result += '</div>';
		return result;
	}

	/**
	 * @param {string[]} params
	 * @param {DocumentOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_attack(params, options) {
		let result = '';
		result += '<div class="card-element card-attack-line">';
		result += '<h4 class="card-attack-name">' + params[0] + ':</h4>';
		result += '<p class="card-attack-hit">' + params[1] + ',</p>';
		result += '<p class="card-attack-damages">' + Card.parse_icons_params(params[2]) + '</p>';
		result += '</div>';
		return result;
	}
}
