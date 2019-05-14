import { I18N } from './i18n.js';
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
		this.color_front = this.color;
		this.color_back = this.color;
		this.icon_back = 'magic-swirl';
		this.title_multiline = true;
	}

	/**
	 * @param {DeckOptions} options
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
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBase(options) {
		let color = this.colorContent(options);
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
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBottom(options) {
		let color = this.colorContent(options);
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
	 * @param {DeckOptions} options
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
}
