import { I18N } from './i18n.js';
import { Card } from './card.js';

export class CreatureCard extends Card {
	cr = '1/2';
	xp = 100;
	proficiency = 2;
	size = 'M';
	alignment = I18N.ALIGNMENTS.UNALIGNED;
	type = '';
	ac = '10';
	hp = '3 (1d6)';
	perception = '10';
	speed = '9 m';
	stats = ['10', '10', '10', '10', '10', '10'];
	vulnerabilities = '';
	resistances = '';
	immunities = '';
	
	constructor() {
		super();
		this.color = '#000000';
		this.color_front = this.color;
		this.color_back = this.color;
		this.icon = '';
	}

	/**
	 * Update xp and proficiency based on the cr
	 */
	update() {
		super.update();
		let pxByCR = [
			10,
			200,
			450,
			700,
			1100,
			1800,
			2300,
			2900,
			3900,
			5000,
			5900,
			7200,
			8400,
			10000,
			11500,
			13000,
			15000,
			18000,
			20000,
			22000,
			25000,
			33000,
			41000,
			50000,
			62000,
			75000,
			90000,
			105000,
			120000,
			135000,
			155000
		];
		let cr;
		if (this.cr === '1/8') {
			cr = 1 / 8;
			this.xp = 25;
		}
		else if (this.cr === '1/4') {
			cr = 1 / 4;
			this.xp = 50;
		}
		else if (this.cr === '1/2') {
			cr = 1 / 2;
			this.xp = 100;
		}
		else {
			cr = parseInt(this.cr);
			this.xp = pxByCR[this.cr];
		}
		this.proficiency = Math.floor(cr / 4) + 2;
	}

	/**
     * @param {DeckOptions} options
     * @returns {string}
     */
	// eslint-disable-next-line no-unused-vars
	generateHeader(options) {
		let result = '<div class="card-title-cr-container">';
		result += '<p class="card-title-cr">' + this.cr + '</p>';
		result += '<p class="card-title-proficiency">(+' + this.proficiency + ')</p>';
		if (this.xp > 1000) {
			let thousands = Math.floor(this.xp / 1000);
			let rest = (this.xp - thousands * 1000);
			if (rest === 0)
				result += '<p class="card-title-xp">' + thousands + ' 000px</p>';
			else if (rest < 10)
				result += '<p class="card-title-xp">' + thousands + ' 00' + rest + 'px</p>';
			else if (rest < 100)
				result += '<p class="card-title-xp">' + thousands + ' 0' + rest + 'px</p>';
			else
				result += '<p class="card-title-xp">' + thousands + ' ' + rest + 'px</p>';
		}
		else
			result += '    <p class="card-title-xp">' + this.xp + 'px</p>';
		result += '</div>';
		result += '<div class="card-subtitle card-creature-subtitle">' + this.type + ', taille ' + this.size;
		if (this.alignment)
			result += '<div style="float:right">' + this.alignment + '</div>';
		result += '</div>';
		return result;
	}

	/**
     * @param {DeckOptions} options
     * @returns {string}
     */
	// eslint-disable-next-line no-unused-vars
	generateBase(options) {
		let result = '<div class="card-creature-base">';
		result += '<div class="card-creature-base-element">';
		result += '<h4 class="card-inlineicon icon-custom-ac"></h4>';
		result += '<p class="card-property-text">' + this.ac + '</p>';
		result += '<div class="card-creature-base-element">';
		result += '<h4 class="card-property-name">' + I18N.PERCEPTION + '.</h4>';
		result += '<p class="card-property-text">' + this.perception + '</p>';
		result += '</div>';
		result += '</div>';
		result += '<div class="card-creature-base-element">';
		result += '<h4 class="card-inlineicon icon-custom-hp"></h4>';
		result += '<p class="card-property-text">' + this.hp + '</p>';
		result += '<div class="card-creature-base-element">';
		result += '<h4 class="card-property-name">' + I18N.SPEED + '.</h4>';
		result += '<p class="card-property-text">' + this.speed + '</p>';
		result += '</div>';
		result += '</div>';
		result += this.generateElement_ruler(null, options);
		let stats = ['', '', '', '', '', ''];
		let spellcasting = ['', '', '', '', '', ''];
		let saving = ['', '', '', '', '', ''];
		for (let i = 0; i < 6; ++i) {
			stats[i] = this.stats[i];
			if (stats[i].includes('M')) {
				stats[i] = stats[i].replace('M', '');
				spellcasting[i] = '<span class="card-stats-header-spellcasting">CM</span>';
			}
			else
				spellcasting[i] = '<span class="card-stats-header-spellcasting" style="opacity:0.2;">CM</span>';
			if (stats[i].includes('S')) {
				stats[i] = stats[i].replace('S', '');
				saving[i] = '<span class="card-stats-header-saving">JS</span>';
			}
			else
				saving[i] = '<span class="card-stats-header-saving" style="opacity:0.25;">JS</span>'; // ○
			let stat = parseInt(stats[i], 10) || 0;
			let mod = Math.floor((stat - 10) / 2);
			if (mod >= 0)
				stats[i] += ' (+' + mod + ')';
			else
				stats[i] += ' (' + mod + ')';
		}
		result += '<table class="card-stats">';
		result += '<tbody>';
		result += '<tr>';
		result += '<th class="card-stats-header">' + I18N.STRENGTH + spellcasting[0] + saving[0] + '</th>';
		result += '<th class="card-stats-header">' + I18N.DEXTERITY + spellcasting[1] + saving[1] + '</th>';
		result += '<th class="card-stats-header">' + I18N.CONSTITUTION + spellcasting[2] + saving[2] + '</th>';
		result += '<th class="card-stats-header">' + I18N.INTELLIGENCE + spellcasting[3] + saving[3] + '</th>';
		result += '<th class="card-stats-header">' + I18N.WISDOM + spellcasting[4] + saving[4] + '</th>';
		result += '<th class="card-stats-header">' + I18N.CHARISMA + spellcasting[5] + saving[5] + '</th>';
		result += '</tr>';
		result += '<tr>';
		result += '<td class="card-stats-cell">' + stats[0] + '</td>';
		result += '<td class="card-stats-cell">' + stats[1] + '</td>';
		result += '<td class="card-stats-cell">' + stats[2] + '</td>';
		result += '<td class="card-stats-cell">' + stats[3] + '</td>';
		result += '<td class="card-stats-cell">' + stats[4] + '</td>';
		result += '<td class="card-stats-cell">' + stats[5] + '</td>';
		result += '</tr>';
		result += '</tbody>';
		result += '</table>';
		result += '</div>'; // card-creature-base
		result += this.generateElement_ruler(null, options);
		if (this.vulnerabilities)
			result += this.generateElement_property([I18N.VULNERABILITIES, this.vulnerabilities], options);
		if (this.resistances)
			result += this.generateElement_property([I18N.RESISTANCES, this.resistances], options);
		if (this.immunities)
			result += this.generateElement_property([I18N.IMMUNITIES, this.immunities], options);
		return result;
	}
	

	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
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
	 * @param {DeckOptions} options
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
