import { I18N } from './i18n.js';


export class Card {
	count = 0;
	title = '';
	title_multiline = false;
	subtitle = '';
	color = '#A9A9A9';
	color_front = this.color;
	color_back = this.color;
	icon = '';
	icon_back = '';
	background_image = '';
	description = '';
	contents = [];
	tags = [];
	reference = '';
	compact = false;

	#id = '';
	#error = false;
	#table_previous_line_colored = false;
	#element_counts = {};

	constructor(title) {
		if (title)
			this.title = title;
	}

	get error() {
		return this.#error;
	}

	set error(value) {
		this.#error = value;
	}

	get isPreviousLineColored() {
		this.#table_previous_line_colored = !this.#table_previous_line_colored;
		return !this.#table_previous_line_colored;
	}

	set isPreviousLineColored(value) {
		this.#table_previous_line_colored = value;
	}

	get elementCounts() {
		return this.#element_counts;
	}

	/**
	 * @param {DeckOptions} options
	 * @param {string} space
	 */
	stringify(options, space) {
		let result = space ? '\n' + space + '{' : '{';
		let hasTrailingComma = false;
		for (const property in this) {
			if (Array.isArray(this[property]) && this[property].length === 0)
				continue;

			if (!options || this[property] !== options.cardsDefault[this.constructor.name][property]) {
				hasTrailingComma = true;
				if (space) {
					result += '\n' + space + '\t"' + property + '":';
					result += JSON.stringify(this[property], null, space + '\t\t');
					if (Array.isArray(this[property])) // Fix JSON issue with the closing bracket not indented
						result = result.slice(0, result.length - 1) + space + '\t]';
					result += ',';
				} else {
					result += '"' + property + '":';
					result += JSON.stringify(this[property]);
					result += ',';
				}
			}
		}

		if (this.constructor !== Card) {
			hasTrailingComma = false;
			if (space) {
				result += '\n' + space + '\t"cardType": "' + this.constructor.name + '"';
			} else {
				result += '"cardType":"' + this.constructor.name + '"';
			}
		}

		if (space) {
			if (hasTrailingComma)
				result = result.slice(0, result.length - 1);// Remove the last ','
			result += '\n' + space + '}';
		} else {
			if (hasTrailingComma)
				result = result.slice(0, result.length - 1);// Remove the last ','
			result += '}';
		}
		return result;
	}


	/**
	 * @returns {Card}
	 */
	clone() {
		let card = new this.constructor();
		Object.assign(card, this);
		card.update();
		return card;
	}

	update() {
		this.#id = this.title.replace(new RegExp('[^a-zA-Z0-9]*', 'g'), '');
	}

	/**
	 * @param {string} tag
	 * @returns {boolean}
	 */
	hasTag(tag) {
		if (!tag || !this.tags)
			return false;
		tag = tag.trim().toLowerCase();
		let index = this.tags.indexOf(tag);
		return index > -1;
	}

	/**
	 * @param {string} tag
	 */
	addTag(tag) {
		if (!tag || !this.tags)
			return;
		tag = tag.trim();
		let index = this.tags.indexOf(tag);
		if (index === -1) {
			this.tags.push(tag);
		}
	}

	/**
	 * @param {string} tag
	 */
	removeTag(tag) {
		if (!tag || !this.tags)
			return;
		tag = tag.trim().toLowerCase();
		this.tags = this.tags.filter(function (t) {
			return tag !== t;
		});

		if (this.tags.length === 0)
			delete this.tags;
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	colorContent(options) {
		return this.color || options.cardsDefault[this.constructor.name].color || this.color_front || options.cardsDefault[this.constructor.name].color_front || '#000000';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	colorFront(options) {
		return this.color_front || options.cardsDefault[this.constructor.name].color_front || this.color || options.cardsDefault[this.constructor.name].color || '#000000';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	colorBack(options) {
		return this.color_back || options.cardsDefault[this.constructor.name].color_back || this.color || options.cardsDefault[this.constructor.name].color || '#000000';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	iconFront(options) {
		return this.icon || options.cardsDefault[this.constructor.name].icon || '';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	iconBack(options) {
		return this.icon_back || this.icon || options.cardsDefault[this.constructor.name].icon || '';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateTitle(options) {
		let title = this.title || '';
		let titleSize = this.title_multiline ? 'multiline' : (options.titleSize || 'normal');
		return '<div class="card-title card-title-' + titleSize + '">' + title + '</div>';
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateHeader(options) {
		let icon = this.iconFront(options);
		let classname = 'icon';
		if (options.smallIcons) {
			classname = 'inlineicon';
		}

		let result = '<div class="card-title-' + classname + '-container">';
		result += '<div class="card-title-' + classname + ' icon-' + icon + '"></div>';
		result += '</div>';
		return result;
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBase(options) {
		if (this.subtitle)
			return '<div class="card-element card-subtitle">' + this.subtitle + '</div>';
		return '';
	}
	
	/**
	 * @param {string[]} parts
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	generateElement(parts, options) {
		let element_name = parts[0];
		let element_params = parts.splice(1);
		let element_generator = 'generateElement_' + element_name;
		if (this[element_generator]) {
			return this[element_generator](element_params, options);
		} else if (element_name.length > 0) {
			return this.generateElement_text(parts, options);
		}
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateContents(options) {
		this.isPreviousLineColored = false;
		let card_element_names = Object.keys(this);
		for (let i = 0; i < card_element_names.length; i++) {
			if (card_element_names[i].startsWith('generateElement_'))
				this.#element_counts[card_element_names[i]] = 0;
		}

		let result = '';
		var card = this;
		result += this.contents.map(function (content_line) {
			let parts = content_line.split('|').map(function (str) { return str.trim(); });
			let element_name = parts[0];
			card.#element_counts[element_name]++;
			return card.generateElement(parts, options);
		}).join('\n');
		return result;
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateBottom(options) {
		let result = '';
		return result;
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateFooter(options) {
		let result = '';
		return result;
	}

	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	generateFront(options) {
		let color = this.colorFront(options);
		let style_color = 'style="color:' + color + ';border-color:' + color + ';background-color:' + color + '"';
	
		let result = '';
		result += '<div class="card card-size-' + options.cardsSize
			+ (options.roundCorners ? ' round-corners' : '')
			+ (this.compact ? ' card-compact' : '')
			+ (this.constructor ? ' card-type-' + this.constructor.name.toLowerCase() : '')
			+ '">';
		result += '<div class="card-border" ' + style_color + '>';
		result += this.generateTitle(options);
		result += this.generateHeader(options);
		result += '<div class="card-content-container">';
		result += this.generateBase(options);
		result += this.generateContents(options);
		result += this.generateBottom(options);
		result += '</div>';
		result += '</div>';
		result += this.generateFooter(options);
	
		if (this.reference)
			result += '<p class="card-reference">' + this.reference + '</p>';
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	generateBack(options) {
		let color = this.colorBack(options);
		let style_color = 'style="color:' + color + ';border-color:' + color + ';background-color:' + color + '"';
		let url = this.background_image;
		let description = this.description;
		let background_style = '';
		if (url) {
			background_style = 'style="background-image: url(&quot;' + url + '&quot;); background-size: contain; background-position: center; background-repeat: no-repeat;"';
		} else {
			background_style = 'style="background: radial-gradient(ellipse at center, white 20%, ' + color + ' 120%)"';
		}
	
		let result = '';
		result += '<div class="card card-size-' + options.cardsSize + ' ' + (options.roundCorners ? 'round-corners' : '') + '">';
		result += '<div class="card-border" ' + style_color + '>';
		result += '<div class="card-back" ' + background_style + '>';// style="background: radial-gradient(ellipse at center, #fff 85%, #ddd 94%, ' + color + ' 98%);"
		if (description) {
			result += '<div class="card-back-description" style="'
				+ 'background-image: -webkit-linear-gradient(top,' + color + ',transparent), -webkit-linear-gradient(right,' + color + ',transparent), -webkit-linear-gradient(bottom,' + color + ',transparent), -webkit-linear-gradient(left,' + color + ',transparent);'
				+ 'background-size: 100% 1mm, 1mm 100%, 100% 1mm, 1mm 100%;'
				+ 'background-position: 0 0, 100% 0, 0 100%, 0 0;'
				+ 'background-repeat: no-repeat;'
				+ '">';
			result += this.generateTitle(options);
			result += '<p class="card-back-description-text">' + description + '</p>';
			result += '</div>';
		} else if (!url) {
			let icon = this.iconBack(options);
			
			result += '<div class="card-back-icon icon-' + icon + '" ' + style_color + '></div>';
		}
		result += '</div>';
		result += '</div>';
		result += '</div>';
	
		return result;
	}
	

	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_text(params, options) {
		let result = '';
		result += '<p class="card-element">';
		result += Card.parse_icons_params(params[0]);
		result += '</p>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_right(params, options) {
		let result = '';
		result += '<p class="card-element" style="text-align:right">';
		result += Card.parse_icons_params(params[0]);
		result += '</p>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_center(params, options) {
		let result = '';
		result += '<p class="card-element" style="text-align:center">';
		result += Card.parse_icons_params(params[0]);
		result += '</p>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_justify(params, options) {
		let result = '';
		result += '<p class="card-element" style="text-align:justify;hyphens:auto">';
		result += Card.parse_icons_params(params[0]);
		result += '</p>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_section(params, options) {
		let color = this.colorContent(options);
		let result = '';
		result += '<div class="card-element">';
		result += '<div class="card-section" style="color:' + color + '">';
		result += '<h3>' + params[0] + '</h3>';
		if (params[1]) {
			result += this.generateElement(params.splice(1), options);
		}
		result += '</div>';
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_property(params, options) {
		let result = '';
		let style = '';
		if (params[2])
			style = 'style="display:flex;flex-direction:row;"';
		result += '<div class="card-element card-property-line" ' + style + '>';
		result += '<p class="card-property-name">' + Card.parse_icons_params(params[0]) + '.</p>';
		result += '<p class="card-property-text">' + (params[1] ? Card.parse_icons_params(params[1]) : '') + '</p>';
		if (params[2])
			result += this.generateElement(params.splice(2), options);
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_description(params, options) {
		let result = '';
		result += '<p class="card-element card-description-text">' + params[0] + '</p>';
		return result;
	}

	/**
	 * @param {string[]} params height | dash
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_line(params, options) {
		let color = this.colorContent(options);
		let styleDash = '';
		let height = params[0] || '1';
		if (params[1] && params[1].indexOf('dash') > -1) {
			styleDash = 'opacity:0.5;stroke-dasharray:1,1';
		}
	
		let result = '';
		result += '<svg class="card-line" height="' + height + 'px" width="100px" viewbox="0 0 100 1" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
		result += '<line x1="0" y1="0" x2="100" y2="0" stroke-width="' + height + '" style="stroke:' + color + ';' + styleDash + '"	></line>';
		result += '</svg>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_ruler(params, options) {
		let color = this.colorContent(options);
	
		let result = '';
		result += '<svg class="card-ruler" viewbox="0 0 10 10" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
		result += '<defs>';
		result += '<linearGradient id="grad' + this.id + '" x1="0" y1="0" x2="100%" y2="0">';
		result += '<stop offset="	0%" style="stop-color:' + color + ';stop-opacity:1.0"/>';
		result += '<stop offset="90%" style="stop-color:' + color + ';stop-opacity:0.3"/>';
		result += '<stop offset="100%" style="stop-color:' + color + ';stop-opacity:0.2"/>';
		result += '</linearGradient>';
		result += '</defs>';
		result += '<polygon points="0,0 8,0 10,0 10,10 8,10 0,10" style="fill:url(#grad' + this.id + ')"></polygon>';
		result += '</svg>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_fill(params, options) {
		let flex = params[0] || '1';
		return '<span class="card-fill" style="flex:' + flex + '"></span>';
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_space(params, options) {
		let height = params[0] || '1';
		return '<span style="height:' + height + 'px"></span>';
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_boxes(params, options) {
		let color = this.colorContent(options);
		let count = params[0] || 1;
		let size = params[1] || 1;
		let styleSvg = 'width:' + size + 'em;min-width:' + size + 'em;height:' + size + 'em;min-height:' + size + 'em;';
		let styleDash = '';
		let styleInnerRect = '';
		let align = '';
		let double = false;
		if (params[2]) {
			if (params[2].indexOf('dash') > -1) {
				styleDash = 'stroke-dasharray:11,14;stroke-dashoffset:5.5;opacity:0.5;';
				styleInnerRect = 'stroke-dasharray:11,13;stroke-dashoffset:5.5;opacity:0.5;';
			}
			if (params[2].indexOf('center') > -1)
				align = 'text-align:center;';
			else if (params[2].indexOf('right') > -1)
				align = 'text-align:right;';
			double = params[2].indexOf('double') > -1;
		}
	
		let result = '';
		result += '<div class="card-element">';
		result += '<div class="card-boxes" style="' + align + '">';
		if (double) {
			for (let i = 0; i < count; ++i) {
				result += '<svg class="card-box" viewbox="-4 -4 108 108" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
				result += '<rect x="0" y="0" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:8;stroke:' + color + '"></rect>';
				result += '<rect x="14" y="14" width="72" height="72" fill="none" style="' + styleInnerRect + ';stroke-width:6;stroke:' + color + '"></rect>';
				result += '</svg>';
			}
		} else {
			for (let i = 0; i < count; ++i) {
				result += '<svg class="card-box" viewbox="-4 -4 108 108" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
				result += '<rect x="0" y="0" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:8;stroke:' + color + '"></rect>';
				result += '</svg>';
			}
		}
		if (params[3]) {
			result += this.generateElement(params.splice(3), options);
		}
		result += '</div>';
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_circles(params, options) {
		let color = this.colorContent(options);
		let count = params[0] || 1;
		let size = params[1] || 1;
		let styleSvg = 'width:' + size + 'em;min-width:' + size + 'em;height:' + size + 'em;';
		let styleDash = '';
		let align = '';
		if (params[2]) {
			if (params[2].indexOf('dash') > -1)
				styleDash = 'stroke-dasharray:11,14;stroke-dashoffset:5.5;opacity:0.5;';
			if (params[2].indexOf('center') > -1)
				align = 'text-align:center;';
			else if (params[2].indexOf('right') > -1)
				align = 'text-align:right;';
		}
	
		let result = '';
		result += '<div class="card-element">';
		result += '<div class="card-circles" style="' + align + '">';
		for (let i = 0; i < count; ++i) {
			result += '<svg class="card-circle" viewbox="-2 -2 104 104" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
			result += '<circle cx="50" cy="50" r="50" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:4;stroke:' + color + '"></circle>';
			result += '</svg>';
		}
		if (params[3]) {
			result += this.generateElement(params.splice(3), options);
		}
		result += '</div>';
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_bullet(params, options) {
		let result = '';
		result += '<ul class="card-element card-bullet-line">';
		result += '<li class="card-bullet">' + Card.parse_icons_params(params[0]) + '</li>';
		result += '</ul>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_fail(params, options) {
		let result = '';
		let style = '';
		if (params[1])
			style = 'style="display:flex;flex-direction:row;"';
		result += '<div class="card-element card-property-line card-property-fail" ' + style + '>';
		result += '<p class="card-property-name">' + I18N.FAIL + '.</p>';
		result += '<p class="card-property-text">' + (params[0] ? Card.parse_icons_params(params[0]) : '') + '</p>';
		if (params[1]) {
			result += this.generateElement(params.splice(1), options);
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
	generateElement_success(params, options) {
		let result = '';
		let style = '';
		if (params[1])
			style = 'style="display:flex;flex-direction:row;"';
		result += '<div class="card-element card-property-line card-property-success" ' + style + '>';
		result += '<p class="card-property-name">' + I18N.SUCCESS + '.</p>';
		result += '<p class="card-property-text">' + (params[0] ? Card.parse_icons_params(params[0]) : '') + '</p>';
		if (params[1]) {
			result += this.generateElement(params.splice(2), options);
		}
		result += '</div>';
		return result;
	}

	/**
	 * @param {string[]} params name | size | alignment background
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_icon(params, options) {
		let name = params[0] || '';
		let size = params[1] || '40';
		let background = '';
		if (params[2] && params[2].includes('background')) {
			background = 'background-color:' + this.colorContent(options) + ';border-radius: 1px;';
			params[2] = params[2].replace('background', '');
		}
		let align = params[2] || 'center';
		let result = '';
	
		result += '<div class="card-element">';
		result += '<div class="card-icon align-' + align + '">';
		result += '<span class="icon-' + name + '" style="height:' + size + 'px;width:' + size + 'px;' + background + '"></span>';
		if (params[3]) {
			result += this.generateElement(params.splice(3), options);
		}
		result += '</div>';
		result += '</div>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_picture(params, options) {
		let url = params[0] || '';
		let sizes = params[1].split('x');
		let height = '';
		let width = '';
		if (sizes[1]) {
			width = sizes[0];
			height = sizes[1];
		} else {
			height = width = sizes[0];
		}
		let invert = '';
		if (params[2] === 'invert')
			invert = '-webkit-filter: invert(100%); filter: invert(100%);';
		let color = this.colorContent(options);
		return '<div class="card-element card-picture" style="background:url(&quot;' + url + '&quot;) center no-repeat ' + color + ';background-size:contain; height:' + height + 'px;width:' + width + 'px;' + invert + '"></div>';
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_table_header(params, options) {
		this.isPreviousLineColored = true;
		let result = '';
		result += '<table class="card-element card-table card-table-header" style="background-color:' + this.colorContent(options) + '66;">';
		result += '<tr>';
		let width = 100 / params.length;
		for (let i = 0; i < params.length; i++) {
			result += '<th style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</th>';
		}
		result += '</tr>';
		result += '</table>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_table_line(params, options) {
		let result = '';
		let style = '';
		if (this.isPreviousLineColored)
			style = 'background-color:' + this.colorContent(options) + '0d;';
		else
			style = 'background-color:' + this.colorContent(options) + '22;';
		result += '<table class="card-element card-table card-table-line" style="' + style + '">';
		result += '<tr>';
		let width = 100 / params.length;
		for (let i = 0; i < params.length; i++) {
			result += '<td style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</td>';
		}
		result += '</tr>';
		result += '</table>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_table_line_c(params, options) {
		let result = '';
		let style = '';
		if (this.isPreviousLineColored)
			style = 'background-color:' + this.colorContent(options) + '0d;';
		else
			style = 'background-color:' + this.colorContent(options) + '22;';
		result += '<table class="card-element card-table card-table-line" style="text-align:center;' + style + '">';
		result += '<tr>';
		let width = 100 / params.length;
		for (let i = 0; i < params.length; i++) {
			result += '<td style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</td>';
		}
		result += '</tr>';
		result += '</table>';
		return result;
	}
	
	/**
	 * @param {string[]} params
	 * @param {DeckOptions} options
	 * @returns {string}
	 */
	// eslint-disable-next-line no-unused-vars
	generateElement_comment(params, options) {
		return '';
	}
	
	
	/**
	 * @param {string} content_line
	 * @returns {string}
	 */
	static parse_icons_params(content_line) {
		if (!content_line)
			return content_line;
		for (let i = 0; i < I18N.DAMAGE_TYPES.length; i++)
			content_line = content_line.replace(I18N.DAMAGE_TYPES[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-type-' + I18N.DAMAGE_TYPES[i].file + '"></span><span class="tooltiptext">' + I18N.DAMAGE_TYPES[i].name + '</span></span>$2');
		for (let i = 0; i < I18N.CONDITION.length; i++)
			content_line = content_line.replace(I18N.CONDITION[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-condition-' + I18N.CONDITION[i].file + '"></span><span class="tooltiptext">' + I18N.CONDITION[i].name + '</span></span>$2');
		for (let i = 0; i < I18N.CUSTOM_ICONS.length; i++)
			content_line = content_line.replace(I18N.CUSTOM_ICONS[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-custom-' + I18N.CUSTOM_ICONS[i].file + '"></span><span class="tooltiptext">' + I18N.CUSTOM_ICONS[i].name + '</span></span>$2');
		for (let i = 0; i < I18N.ABREVIATIONS.length; i++)
			content_line = content_line.replace(I18N.ABREVIATIONS[i].regex, '$1<span class="abreviation">$2<span class="tooltiptext">' + I18N.ABREVIATIONS[i].meaning + '</span></span>$3');
		for (let i = 0; i < I18N.COMMON_RULES.length; i++)
			content_line = content_line.replace(I18N.COMMON_RULES[i].regex, '$1<span class="commonrules">$2<span class="tooltiptext">' + I18N.COMMON_RULES[i].meaning + '</span></span>$3');
		return content_line.replace(/\\/gi, '');// .replace(/ comme /g, ' ĉ ');
	}
}
