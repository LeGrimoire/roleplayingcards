'use strict'

var CardType = {
	CREATURE: "creature",
	ITEM: "item",
	SPELL: "spell",
	POWER: "power"
};

class Card {
	cardType;
	title = "";
	title_multiline = false;
	subtitle = "";
	color = "#A9A9A9";
	icon = "";
	icon_back;
	description;
	contents = [];
	tags;
	reference;
	compact = false;

	constructor() {
	}
}

class CreatureCard extends Card {
	cr = "1/2";
	px = 100;
	proficiency = 2;
	size = "M";
	alignment = I18N.ALIGNMENTS.UNALIGNED;
	type = "";
	ac = "10";
	hp = "3 (1d6)";
	perception = "10";
	speed = "9 m";
	stats = ["10", "10", "10", "10", "10", "10"];
	vulnerabilities = "";
	resistances = "";
	immunities = "";

	constructor() {
		super();
		this.cardType = CardType.CREATURE;
		this.color = "#000000";
		this.icon = "";
	}
}

class ItemCard extends Card {
	constructor() {
		super();
		this.cardType = CardType.ITEM;
		this.color = "#696969";
		this.icon = "swap-bag";
	}
}

class SpellCard extends Card {
	level = 1;
	ritual = false;
	casting_time = "1 action";
	range = "18 m";
	verbal = false;
	somatic = false;
	material = "";
	duration = "1 round";
	type = "";
	classes = "";

	constructor() {
		super();
		this.cardType = CardType.SPELL;
		this.color = "#800000";
		this.icon_back = "magic-swirl";
		this.title_multiline = true;
	}
}

class PowerCard extends Card {
	constructor() {
		super();
		this.cardType = CardType.POWER;
		this.color = "#2F4F4F";
		this.icon = "";
	}
}


// ============================================================================
// Card definition related functions
// ============================================================================

function card_default_options() {
	return {
		foreground_color: "white",
		background_color: "black",
		default: {
			color: "black",
			icon: "",
			title_size: "13"
		},
		page_size: "A4",
		page_rows: 3,
		page_columns: 3,
		card_arrangement: "front_only",
		card_size: "25x35",
		icon_inline: true,
		rounded_corners: true
	};
}

function card_create_lexicals() {
	var cards = [];

	// Picto
	var card = new Card();
	card.title = I18N.PICTO;
	for (var i = 0; i < I18N.DAMAGE_TYPES.length; i++) {
		var line = "property | " + I18N.DAMAGE_TYPES[i].name + " | " + I18N.DAMAGE_TYPES[i].name;
		if (i < I18N.DAMAGE_TYPES.length - 1) {
			i++;
			line += " | property | " + I18N.DAMAGE_TYPES[i].name + " | " + I18N.DAMAGE_TYPES[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push("line");
	for (var i = 0; i < I18N.CONDITION.length; i++) {
		var line = "property | " + I18N.CONDITION[i].name + " | " + I18N.CONDITION[i].name;
		if (i < I18N.CONDITION.length - 1) {
			i++;
			line += " | property | " + I18N.CONDITION[i].name + " | " + I18N.CONDITION[i].name;
		}
		card.contents.push(line);
	}
	card.contents.push("line");
	for (var i = 0; i < I18N.CUSTOM_ICONS.length; i++) {
		var line = "property | " + I18N.CUSTOM_ICONS[i].name + " | " + I18N.CUSTOM_ICONS[i].name;
		if (i < I18N.CUSTOM_ICONS.length - 1) {
			i++;
			line += " | property | " + I18N.CUSTOM_ICONS[i].name + " | " + I18N.CUSTOM_ICONS[i].name;
		}
		card.contents.push(line);
	}
	cards.push(card);

	// Lexical
	card = new Card();
	card.title = I18N.ABREVIATIONS_TITLE;
	for (var i = 0; i < I18N.ABREVIATIONS.length; i++) {
		var line = "property | " + I18N.ABREVIATIONS[i].name + " | " + I18N.ABREVIATIONS[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	// Common rules
	card = new Card();
	card.title = I18N.COMMON_RULES_TITLE;
	for (var i = 0; i < I18N.COMMON_RULES.length; i++) {
		var line = "property | " + I18N.COMMON_RULES[i].name + " | " + I18N.COMMON_RULES[i].meaning;
		card.contents.push(line);
	}
	cards.push(card);

	return cards;
}


function clone(originalCard) {
	if ((typeof originalCard !== 'object') || originalCard === null) {
		throw new TypeError("originalCard parameter must be an object which is not null");
	}
	var card;
	if (originalCard.cardType == CardType.CREATURE)
		card = new CreatureCard();
	else if (originalCard.cardType == CardType.ITEM)
		card = new ItemCard();
	else if (originalCard.cardType == CardType.SPELL)
		card = new SpellCard();
	else if (originalCard.cardType == CardType.POWER)
		card = new PowerCard();
	else
		card = new Card();
	Object.assign(card, originalCard);
	return card;
}

function card_update(card) {
	if (card.cardType == CardType.CREATURE) {
		var pxByCR = [
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
		var cr = card.cr;
		if (cr === "1/8") {
			cr = 1 / 8;
			card.xp = 25;
		} else if (cr === "1/4") {
			cr = 1 / 4;
			card.xp = 50;
		} else if (cr === "1/2") {
			cr = 1 / 2;
			card.xp = 100;
		} else
			card.xp = pxByCR[cr];
		card.proficiency = Math.floor(cr / 4) + 2;
	}
}

function card_has_tag(card, tag) {
	if (!tag || !card.tags)
		return false;
	tag = tag.trim().toLowerCase();
	var index = card.tags.indexOf(tag);
	return index > -1;
}

function card_add_tag(card, tag) {
	if (!tag || !card.tags)
		return;
	tag = tag.trim();
	var index = card.tags.indexOf(tag);
	if (index === -1) {
		card.tags.push(tag);
	}
}

function card_remove_tag(card, tag) {
	if (!tag || !card.tags)
		return;
	tag = tag.trim().toLowerCase();
	card.tags = card.tags.filter(function (t) {
		return tag !== t;
	});

	if (card.tags.length == 0)
		delete card.tags;
}


function card_data_color_front(card_data, options) {
	return card_data.color_front || card_data.color || options.default.color || "black";
}

function card_data_color_back(card_data, options) {
	return card_data.color_back || card_data.color || options.default.color || "black";
}

function card_data_icon_front(card_data, options) {
	return card_data.icon_front || card_data.icon || options.default.icon || "";
}

function card_data_icon_back(card_data, options) {
	return card_data.icon_back || card_data.icon || options.default.icon || "";
}

function card_data_split_params(value) {
	return value.split("|").map(function (str) { return str.trim(); });
}

function card_data_parse_icons_params(value) {
	if (!value)
		return value;
	for (var i = 0; i < I18N.DAMAGE_TYPES.length; i++)
		value = value.replace(I18N.DAMAGE_TYPES[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-type-' + I18N.DAMAGE_TYPES[i].file + '"></span><span class="tooltiptext">' + I18N.DAMAGE_TYPES[i].name + '</span></span>$2');
	for (var i = 0; i < I18N.CONDITION.length; i++)
		value = value.replace(I18N.CONDITION[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-condition-' + I18N.CONDITION[i].file + '"></span><span class="tooltiptext">' + I18N.CONDITION[i].name + '</span></span>$2');
	for (var i = 0; i < I18N.CUSTOM_ICONS.length; i++)
		value = value.replace(I18N.CUSTOM_ICONS[i].regex, '$1<span class="card-inlineicon-tooltip"><span class="card-inlineicon icon-custom-' + I18N.CUSTOM_ICONS[i].file + '"></span><span class="tooltiptext">' + I18N.CUSTOM_ICONS[i].name + '</span></span>$2');
	for (var i = 0; i < I18N.ABREVIATIONS.length; i++)
		value = value.replace(I18N.ABREVIATIONS[i].regex, '$1<span class="abreviation">$2<span class="tooltiptext">' + I18N.ABREVIATIONS[i].meaning + '</span></span>$3');
	for (var i = 0; i < I18N.COMMON_RULES.length; i++)
		value = value.replace(I18N.COMMON_RULES[i].regex, '$1<span class="commonrules">$2<span class="tooltiptext">' + I18N.COMMON_RULES[i].meaning + '</span></span>$3');
	return value
		.replace(/\\/gi, '')
		// .replace(/ comme /g,       							' ĉ ')
		;
}

// ============================================================================
// Card element generating functions
// ============================================================================

function card_title(card_data, options) {
	var title = card_data.title || "";
	var title_size = card_data.title_multiline ? 'multiline' : (options.default.title_size || 'normal');
	return '<div class="card-title card-title-' + title_size + '">' + title + '</div>';
}

function card_title_icon(card_data, options) {
	var icon = card_data_icon_front(card_data, options);
	var classname = "icon";
	if (options.icon_inline) {
		classname = "inlineicon";
	}

	var result = "";
	result += '<div class="card-title-' + classname + '-container">';
	result += 	'<div class="card-title-' + classname + ' icon-' + icon + '"></div>';
	result += '</div>';
	return result;
}

function card_subtitle(card_data, options) {
	var result = "";
	if (card_data.subtitle)
		result += '<div class="card-element card-subtitle">' + card_data.subtitle + '</div>';
	return result;
}

function card_creature_header(card_data, options) {
	var result = "";
	result += '<div class="card-title-cr-container">';
	result += 	'<p class="card-title-cr">' + card_data.cr + '</p>';
	result += 	'<p class="card-title-proficiency">(+' + card_data.proficiency + ')</p>';
	if (card_data.xp > 1000) {
		var thousands = Math.floor(card_data.xp / 1000);
		var rest = (card_data.xp - thousands * 1000);
		if (rest == 0)
			result += '<p class="card-title-xp">' + thousands + ' 000px</p>';
		else if (rest < 10)
			result += '<p class="card-title-xp">' + thousands + ' 00' + rest + 'px</p>';
		else if (rest < 100)
			result += '<p class="card-title-xp">' + thousands + ' 0' + rest + 'px</p>';
		else 
			result += '<p class="card-title-xp">' + thousands + ' ' + rest + 'px</p>';
	} else
		result += '    <p class="card-title-xp">' + card_data.xp + 'px</p>';
	result += '</div>';
	result += '<div class="card-subtitle card-creature-subtitle">' + card_data.type + ", taille " + card_data.size;
	if (card_data.alignment)
		result += '<div style="float:right">' + card_data.alignment + '</div>';
	result += '</div>';
	return result;
}

function card_creature_base(card_data, options) {
	var result = "";
	result += '<div class="card-creature-base">';
	result += '<div class="card-creature-base-element">';
	result += 	'<h4 class="card-inlineicon icon-custom-ac"></h4>';
	result += 	'<p class="card-property-text">' + card_data.ac + '</p>';
	result += 	'<div class="card-creature-base-element">';
	result += 		'<h4 class="card-property-name">' + I18N.PERCEPTION + '.</h4>';
	result += 		'<p class="card-property-text">' + card_data.perception + '</p>';
	result += 	'</div>';
	result += '</div>';
	result += '<div class="card-creature-base-element">';
	result += 	'<h4 class="card-inlineicon icon-custom-hp"></h4>';
	result += 	'<p class="card-property-text">' + card_data.hp + '</p>';
	result += 	'<div class="card-creature-base-element">';
	result += 		'<h4 class="card-property-name">' + I18N.SPEED + '.</h4>';
	result += 		'<p class="card-property-text">' + card_data.speed + '</p>';
	result += 	'</div>';
	result += '</div>';
	result += card_element_ruler(null, card_data, options);

	var stats = ["", "", "", "", "", ""];
	var spellcasting = ["", "", "", "", "", ""];
	var saving = ["", "", "", "", "", ""];
	for (var i = 0; i < 6; ++i) {
		stats[i] = card_data.stats[i];
		if (stats[i].includes("M")) {
			stats[i] = stats[i].replace("M", "");
			spellcasting[i] = '<span class="card-stats-header-spellcasting">★</span>';
		} else
			spellcasting[i] = '<span class="card-stats-header-spellcasting" style="opacity:0.2;">☆</span>'; 

		if (stats[i].includes("S")) {
			stats[i] = stats[i].replace("S", "");
			saving[i] = '<span class="card-stats-header-saving">●</span>';
		} else
			saving[i] = '<span class="card-stats-header-saving" style="font-size:17px;opacity:0.25;">◦</span>';//○

		stats[i] = parseInt(stats[i], 10) || 0;
		var mod = Math.floor((stats[i] - 10) / 2);
		if (mod >= 0)
			mod = "+" + mod;
		else
			mod = "" + mod;
		stats[i] += " (" + mod + ")";
	}

	result += '<table class="card-stats">';
	result += 	'<tbody>';
	result += 		'<tr>';
	result += 			'<th class="card-stats-header">' + I18N.STRENGTH 		+ spellcasting[0] + saving[0] + '</th>';
	result += 			'<th class="card-stats-header">' + I18N.DEXTERITY 		+ spellcasting[1] + saving[1] + '</th>';
	result += 			'<th class="card-stats-header">' + I18N.CONSTITUTION 	+ spellcasting[2] + saving[2] + '</th>';
	result += 			'<th class="card-stats-header">' + I18N.INTELLIGENCE 	+ spellcasting[3] + saving[3] + '</th>';
	result += 			'<th class="card-stats-header">' + I18N.WISDOM 			+ spellcasting[4] + saving[4] + '</th>';
	result += 			'<th class="card-stats-header">' + I18N.CHARISMA 		+ spellcasting[5] + saving[5] + '</th>';
	result += 		'</tr>';
	result += 		'<tr>';
	result += 			'<td class="card-stats-cell">' + stats[0] + '</td>';
	result += 			'<td class="card-stats-cell">' + stats[1] + '</td>';
	result += 			'<td class="card-stats-cell">' + stats[2] + '</td>';
	result += 			'<td class="card-stats-cell">' + stats[3] + '</td>';
	result += 			'<td class="card-stats-cell">' + stats[4] + '</td>';
	result += 			'<td class="card-stats-cell">' + stats[5] + '</td>';
	result += 		'</tr>';
	result += 	'</tbody>';
	result += '</table>';
	result += '</div>'; // card-creature-base
	result += card_element_ruler(null, card_data, options);
	return result;
}

function card_spell_header(card_data, options) {
	var result = "";
	result += '<div class="card-title-inlineicon-container">';
	if (card_data.level)
		result += '<div class="card-title-spellicon icon-spell-level_' + card_data.level + '"></div>';
	result += '</div>';
	result += '<div class="card-subtitle card-spell-subtitle">' + card_data.type;
	if (card_data.ritual)
		result += ' (' + I18N.RITUAL + ')';
	result += '</div>';
	return result;
}

function card_spell_base(card_data, options) {
	var color = card_data_color_front(card_data, options);
	var result = "";
	result += '<div class="card-spell-base">';
	result +=	'<div class="card-spell-base-texts">';
	result +=		'<div>';
	result += 			'<h4>' + I18N.CASTING_TIME + ':</h4>';
	result += 			'<p>' + card_data.casting_time + '</p>';
	result +=		'</div>';
	result +=		'<div>';
	result += 			'<h4>' + I18N.RANGE + ':</h4>';
	result += 			'<p>' + card_data.range + '</p>';
	result +=		'</div>';
	result +=		'<div>';
	result += 			'<h4>' + I18N.DURATION + ':</h4>';
	result += 			'<p>' + card_data.duration + '</p>';
	result +=		'</div>';
	result +=	'</div>';
	result += 	'<div class="card-spell-components">';
	// var colorStyle = 'filter:sepia(1) hue-rotate(86deg) saturate(10) brightness(0.7);';
	if (card_data.materials) {
		result += '<span class="card-inlineicon icon-custom-arrow-down" style="top:1px;"></span>';
	}
	result += '<span class="card-inlineicon icon-spell-material" style="' + (card_data.materials ? 'margin-left:0px;' : 'opacity:0.4;') + '"></span>';
	result += 		'<span class="card-inlineicon icon-spell-verbal" style="' + (card_data.verbal ? '' : 'opacity:0.4;') + '"></span>';
	result += 		'<span class="card-inlineicon icon-spell-somatic" style="' + (card_data.somatic ? '' : 'opacity:0.4;') + '"></span>';
	if (card_data.materials) {
		result += '<p class="card-spell-materials">' + card_data.materials + '</p>';
	}
	result += 	'</div>';
	result += card_element_ruler(null, card_data, options);
	result += '</div>'
	return result;
}

function card_spell_footer(card_data, options) {
	var result = "";
	result += '<div class="card-spell-classes">';
	var classesKeys = Object.keys(I18N.CLASSES);
	for (var i = 0; i < classesKeys.length; i++) {
		var isForClass = card_data.classes.search(new RegExp(I18N.CLASSES[classesKeys[i]], 'gi')) != -1;
		result += '<span class="card-class-inlineicon icon-class-' + classesKeys[i].toLowerCase() + (isForClass ? '' : ' card-class-hidden') + '""></span>';
	}
	result += '</div>';
	return result;
}

/**
 * @description name | size | align background
 * @var align: is center, left, right 
 * @var background: show a square back of the card color
 */
function card_element_icon(params, card_data, options) {
	var name = params[0] || "";
	var size = params[1] || "40";
	var background = "";
	if (params[2] && params[2].includes("background")) {
		background = 'background-color:' + card_data_color_front(card_data, options) + ';border-radius: 1px;';
		params[2] = params[2].replace("background", "");
	}
	var align = params[2] || "center";
	var result = '';

	result += '<div class="card-element">';
	result += '<div class="card-icon align-' + align + '">';
	result += '<span class="icon-' + name + '" style="height:' + size + 'px;width:' + size + 'px;' + background + '"></span>';
	if (params[3]) {
		result += card_generate_element(params.splice(3), card_data, options);
	}
	result += '</div>';
	result += '</div>';
	return result;
}

function card_element_picture(params, card_data, options) {
	var url = params[0] || "";
	var height = params[1] || "";
	var width = params[2] || height || "";
	var color = card_data_color_front(card_data, options);
	return '<div class="card-element card-picture" style ="background-image: url(&quot;' + url + '&quot;); background-size: contain; background-position: center;background-repeat: no-repeat;height:' + height + 'px;width:' + width + 'px;background-color: ' + color + '"></div>';
}

/**
 * @description height | dash
 * @var height in pixel
 * @var dash
 */
function card_element_line(params, card_data, options) {
	var color = card_data_color_front(card_data, options);
	var styleDash = '';
	var height = params[0] || "1";
	if (params[1] && params[1].indexOf("dash") > -1) {
		styleDash = 'opacity:0.5;stroke-dasharray:1,1';
	}

	var result = "";
	result += '<svg class="card-line" height="' + height + 'px" width="100px" viewbox="0 0 100 1" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
	result += '<line x1="0" y1="0" x2="100" y2="0" stroke-width="' + height + '" style="stroke:' + color + ';' + styleDash + '"	></line>';
	result += '</svg>';
	return result;
}

/**
 * 
 */
function card_element_ruler(params, card_data, options) {
	var color = card_data_color_front(card_data, options);
	var fill = 'fill="' + color + '"';

	var result = "";
	result += '<svg class="card-ruler" height="1px" width="100px" viewbox="0 0 100 1" preserveaspectratio="none" xmlns="http://www.w3.org/2000/svg">';
	result += 	'<polyline points="0,0 100,0.5 0,1" ' + fill + '></polyline>';
	result += '</svg>';
	return result;
}

function card_element_fill(params, card_data, options) {
	var flex = params[0] || "1";
	return '<span class="card-fill" style="flex:' + flex + '"></span>';
}

function card_element_space(params, card_data, options) {
	var height = params[0] || "1";
	return '<span style="height:' + height + 'px"></span>';
}

function card_element_boxes(params, card_data, options) {
	var color = card_data_color_front(card_data, options);
	var count = params[0] || 1;
	var size = params[1] || 1;
	var styleSvg = 'width:' + size + 'em;min-width:' + size + 'em;height:' + size + 'em;min-height:' + size + 'em;';
	var styleDash = '';
	var styleInnerRect = '';
	var align = '';
	var double = false;
	if (params[2]) {
		if (params[2].indexOf("dash") > -1) {
			styleDash = 'stroke-dasharray:11,14;stroke-dashoffset:5.5;opacity:0.5;';
			styleInnerRect = 'stroke-dasharray:11,13;stroke-dashoffset:5.5;opacity:0.5;';
		}
		if (params[2].indexOf("center") > -1)
			align = 'text-align:center;';
		else if (params[2].indexOf("right") > -1)
			align = 'text-align:right;';
		double = params[2].indexOf("double") > -1;
	}

	var result = '';
	result += '<div class="card-element">';
	result += '<div class="card-boxes" style="' + align + '">';
	if (double) {
		for (var i = 0; i < count; ++i) {
			result += '<svg class="card-box" viewbox="-4 -4 108 108" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
			result += '<rect x="0" y="0" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:8;stroke:' + color + '"></rect>';
			result += '<rect x="14" y="14" width="72" height="72" fill="none" style="' + styleInnerRect + ';stroke-width:6;stroke:' + color + '"></rect>';
			result += '</svg>';
		}
	} else {
		for (var i = 0; i < count; ++i) {
			result += '<svg class="card-box" viewbox="-4 -4 108 108" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
			result += '<rect x="0" y="0" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:8;stroke:' + color + '"></rect>';
			result += '</svg>';
		}
	}
	if (params[3]) {
		result += card_generate_element(params.splice(3), card_data, options);
	}
	result += '</div>';
	result += '</div>';
	return result;
}

function card_element_circles(params, card_data, options) {
	var color = card_data_color_front(card_data, options);
	var count = params[0] || 1;
	var size = params[1] || 1;
	var styleSvg = 'width:' + size + 'em;min-width:' + size + 'em;height:' + size + 'em;';
	var styleDash = '';
	var align = '';
	if (params[2]) {
		if (params[2].indexOf("dash") > -1)
			styleDash = 'stroke-dasharray:11,14;stroke-dashoffset:5.5;opacity:0.5;';
		if (params[2].indexOf("center") > -1)
			align = 'text-align:center;';
		else if (params[2].indexOf("right") > -1)
			align = 'text-align:right;';
	}

	var result = '';
	result += '<div class="card-element">';
	result += '<div class="card-circles" style="' + align + '">';
	for (var i = 0; i < count; ++i) {
		result += '<svg class="card-circle" viewbox="-2 -2 104 104" preserveaspectratio="none" style="' + styleSvg + '" xmlns="http://www.w3.org/2000/svg">';
		result += '<circle cx="50" cy="50" r="50" width="100" height="100" fill="none" style="' + styleDash + ';stroke-width:4;stroke:' + color + '"></circle>';
		result += '</svg>';
	}
	if (params[3]) {
		result += card_generate_element(params.splice(3), card_data, options);
	}
	result += '</div>';
	result += '</div>';
	return result;
}

function card_element_property(params, card_data, options) {
	var result = "";
	if (params[2])
		result += '<div class="card-element card-property-line" style="display:flex;flex-direction:row;">';
	else
		result += '<div class="card-element card-property-line">';
	result += 	'<h4 class="card-property-name">' + params[0] + '.</h4>';
	result += 	'<p class="card-property-text">' + (params[1] ? card_data_parse_icons_params(params[1]) : '') + '</p>';
	if (params[2]) {
		result += card_generate_element(params.splice(2), card_data, options);
	}
	result += '</div>';
	return result;
}

function card_element_description(params, card_data, options) {
	var result = "";
	result += '<p class="card-element card-description-text">' + params[0] + '</p>';
	return result;
}

function card_element_text(params, card_data, options) {
	var result = "";
	result += '<p class="card-element">';
	result += card_data_parse_icons_params(params[0]);
	result += '</p>';
	return result;
}

function card_element_right(params, card_data, options) {
	var result = "";
	result += '<p class="card-element" style="text-align:right">';
	result += card_data_parse_icons_params(params[0]);
	result += '</p>';
	return result;
}

function card_element_center(params, card_data, options) {
	var result = "";
	result += '<p class="card-element" style="text-align:center">';
	result += card_data_parse_icons_params(params[0]);
	result += '</p>';
	return result;
}

function card_element_justify(params, card_data, options) {
	var result = "";
	result += '<p class="card-element" style="text-align:justify;hyphens:auto">';
	result += card_data_parse_icons_params(params[0]);
	result += '</p>';
	return result;
}

function card_element_section(params, card_data, options) {
	var color = card_data_color_front(card_data, options);
	var result = '';
	result += '<div class="card-element">';
	result += '<div class="card-section">';
	result += 	'<h3 style="color:' + color + '">' + params[0] + '</h3>';
	if (params[1]) {
		result += card_generate_element(params.splice(1), card_data, options);
	}
	result += '</div>';
	result += '</div>';
	return result;
}

function card_element_bullet(params, card_data, options) {
	var result = "";
	result += '<ul class="card-element card-bullet-line">';
	result += 	'<li class="card-bullet">' + card_data_parse_icons_params(params[0]) + '</li>';
	result += '</ul>';
	return result;
}

var card_table_previous_line_colored = true;
function card_element_table_header(params, card_data, options) {
	card_table_previous_line_colored = true;
	var result = "";
	result += '<table class="card-element card-table card-table-header" style="background-color:' + card_data_color_front(card_data, options) + '88;">';
	result += '<tr>';
	var width = 100 / params.length;
	for (var i = 0; i < params.length; i++) {
		result += '<th style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</th>';
	}
	result += '</tr>';
	result += '</table>';
	return result;
}

function card_element_table_line(params, card_data, options) {
	var result = "";
	if (card_table_previous_line_colored)
		result += '<table class="card-element card-table card-table-line">';
	else
		result += '<table class="card-element card-table card-table-line" style="background-color:' + card_data_color_front(card_data, options) + '33;">';
	card_table_previous_line_colored = !card_table_previous_line_colored;
	result += '<tr>';
	var width = 100 / params.length;
	for (var i = 0; i < params.length; i++) {
		result += '<td style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</td>';
	}
	result += '</tr>';
	result += '</table>';
	return result;
}

function card_element_table_line_center(params, card_data, options) {
	var result = "";
	if (card_table_previous_line_colored)
		result += '<table class="card-element card-table card-table-line" style="text-align:center;">';
	else
		result += '<table class="card-element card-table card-table-line" style="background-color:' + card_data_color_front(card_data, options) + '33;text-align:center;">';
	card_table_previous_line_colored = !card_table_previous_line_colored;
	result += '<tr>';
	var width = 100 / params.length;
	for (var i = 0; i < params.length; i++) {
		result += '<td style="min-width:' + width + '%;width:' + width + '%">' + params[i] + '</td>';
	}
	result += '</tr>';
	result += '</table>';
	return result;
}

function card_element_empty(params, card_data, options) {
	return '';
}

function card_element_unknown(params, card_data, options) {
	return '<div>Unknown element: ' + params.join('<br />') + '</div>';
}

function card_element_spells(params, card_data, options) {
	var result = "";
	result += '<div class="card-element card-spells-line">';
	if (params[0])
		result += 	'<h4 class="card-inlineicon icon-spell-caster_' + params[0] + '"></h4>';
	else
		result += 	'<h4 class="card-inlineicon icon-spell-caster"></h4>';
	result += 	'<p class="card-spells-ability">' + params[1] + '</p>';
	if (params.length == 3) {
		result += 	'<p class="card-spells-level"><span class="card-inlineicon icon-spell-level"></span></p>';
		result += 	'<p class="card-spells-list">' + params[2] + '</p>';
	} else {
		if (params[2]) {
			result += 	'<p class="card-spells-level"><span class="card-inlineicon icon-spell-level_0"></span></p>';
			result += 	'<p class="card-spells-list">' + params[2] + '</p>';   
		}
		var last = params.length - 1;
		for (var i = 1; i < 9; i++) {
			var level = 2 * i + 1;
			if (params[level] && params[level + 1]) {
				last = level + 2;

				result += '<p class="card-spells-level"><span class="card-inlineicon icon-spell-level_' + i + '"></span>(' + params[level] + ')</p>';
				result += 	'<p class="card-spells-list">' + params[level + 1] + '</p>';
			}
		}
		if (last > 2 && params[last])
			result += '<p class="card-spells-text">' + card_data_parse_icons_params(params[last]) + '</p>';
	}
	result += '</div>';
	return result;
}

function card_element_attack(params, card_data, options) {
	var result = "";
	result += '<div class="card-element card-attack-line">';
	result += 	'<h4 class="card-attack-name">' + params[0] + ':</h4>';
	result += 	'<p class="card-attack-hit">' + params[1] + ',</p>';
	result += 	'<p class="card-attack-damages">' + card_data_parse_icons_params(params[2]) + '</p>';
	result += '</div>';
	return result;
}

var card_element_generators = {
	icon: card_element_icon,
	picture: card_element_picture,
	line: card_element_line,
	ruler: card_element_ruler,
	fill: card_element_fill,
	space: card_element_space,
	boxes: card_element_boxes,
	circles: card_element_circles,
	property: card_element_property,
	description: card_element_description,
	text: card_element_text,
	right: card_element_right,
	center: card_element_center,
	justify: card_element_justify,
	section: card_element_section,
	bullet: card_element_bullet,
	table_header: card_element_table_header,
	table_line: card_element_table_line,
	table_line_c: card_element_table_line_center,
	disabled: card_element_empty,
	comment: card_element_empty,
	spells: card_element_spells,
	attack: card_element_attack,
};

// ============================================================================
// Card generating functions
// ============================================================================

function card_generate_element(parts, card_data, options) {
	var element_name = parts[0];
	var element_params = parts.splice(1);
	var element_generator = card_element_generators[element_name];
	if (element_generator) {
		return element_generator(element_params, card_data, options);
	} else if (element_name.length > 0) {
		return card_element_text(parts, card_data, options);
	}
}

function card_generate_contents(contents, card_data, options) {
	card_table_previous_line_colored = true;
	var result = "";
	result += contents.map(function (value) {
		var parts = card_data_split_params(value);
		return card_generate_element(parts, card_data, options);
	}).join("\n");
	return result;
}

function card_generate_color_style(color, options) {
	return 'style="color:' + color + '; border-color:' + color + '; background-color:' + color + '"';
}

function card_generate_color_gradient_style(color, options) {
	return 'style="background: radial-gradient(ellipse at center, white 20%, ' + color + ' 120%)"';
}

function card_generate_front(card_data, options) {
	var color = card_data_color_front(card_data, options);
	var style_color = card_generate_color_style(color, options);

	var result = "";
	result += '<div class="card card-size-' + options.card_size + ' ' 
		+ (options.rounded_corners ? 'rounded-corners' : '')
		+ (card_data.compact ? ' card-compact' : '')
		+ (card_data.cardType ? ' card-type-' + card_data.cardType : '')
		+ '">';
	result += 	'<div class="card-border" ' + style_color + '>';
	result += 		card_title(card_data, options);

	if (card_data.cardType == CardType.CREATURE) {
		result += 	card_creature_header(card_data, options);
		result += 	'<div class="card-content-container">';
		result += 		card_creature_base(card_data, options);
		if (card_data.vulnerabilities)
			result += 	card_element_property([I18N.VULNERABILITIES, card_data.vulnerabilities], card_data, options);
		if (card_data.resistances)
			result += 	card_element_property([I18N.RESISTANCES, card_data.resistances], card_data, options);
		if (card_data.immunities)
			result += 	card_element_property([I18N.IMMUNITIES, card_data.immunities], card_data, options);
	} 
	else if (card_data.cardType == CardType.ITEM) {
		result += 	card_title_icon(card_data, options);
		result += 	'<div class="card-content-container">';
		result += 		card_subtitle(card_data, options);
	} 
	else if (card_data.cardType == CardType.SPELL) {
		result += 	card_spell_header(card_data, options);
		result += 	'<div class="card-content-container">';
		result += 		card_spell_base(card_data, options);
	} 
	else if (card_data.cardType == CardType.POWER) {
		result += 	card_title_icon(card_data, options);
		result += 	'<div class="card-content-container">';
		result += 		card_subtitle(card_data, options);
	}
	 else {
		result += 	card_title_icon(card_data, options);
		result += 	'<div class="card-content-container">';
		result += 		card_subtitle(card_data, options);
	}

	result += 			card_generate_contents(card_data.contents, card_data, options);
	result += 		'</div>';
	result += 	'</div>';

	if (card_data.cardType == CardType.SPELL) {
		result += card_spell_footer(card_data, options);
	}

	if (card_data.reference)
		result += '<p class="card-reference">' + card_data.reference + '</p>';
	result += '</div>';
	return result;
}

function card_generate_back(card_data, options) {
	var color = card_data_color_back(card_data, options);
	var style_color = card_generate_color_style(color, options);
	var url = card_data.background_image;
	var description = card_data.description;
	var back_color = options.background_color || color;
	var background_style = "";
	if (description) {
		background_style = card_generate_color_gradient_style(back_color, options);
	} else if (url) {
		background_style = 'style = "background-image: url(&quot;' + url + '&quot;); background-size: contain; background-position: center; background-repeat: no-repeat;"';
	} else {
		background_style = card_generate_color_gradient_style(back_color, options);
	}

	var result = "";
	result += '<div class="card card-size-' + options.card_size + ' ' + (options.rounded_corners ? 'rounded-corners' : '') + '">';
	result += 	'<div class="card-border" ' + style_color + '>';
	result += 		'<div class="card-back" ' + background_style + '>';
	if (description) {
		result += 	'<div class="card-back-inner card-back-inner-description" style="background: radial-gradient(ellipse at center, #fff 85%, #ddd 94%, ' + back_color + ' 98%);">';
		result += 		'<div class="card-back-description" style="background-image: -webkit-linear-gradient(top, ' + back_color + ', transparent), -webkit-linear-gradient(right, ' + back_color + ', transparent), -webkit-linear-gradient(bottom, ' + back_color + ', transparent), -webkit-linear-gradient(left, ' + back_color + ', transparent);';
		result += 		'background-size: 100% 1mm, 1mm 100%, 100% 1mm, 1mm 100%; background-position: 0 0, 100% 0, 0 100%, 0 0; background-repeat: no-repeat;">';
		result +=			card_title(card_data, options);
		result += 			'<p class="card-back-description-text">' + description + '</p>';
		result += 		'</div>';
		result += 	'</div>';
	} else if (!url) {
		var icon = 	card_data_icon_back(card_data, options);
		result += 	'<div class="card-back-inner">';
		result += 		'<div class="card-back-icon icon-' + icon + '" ' + style_color + '></div>';
		result += 	'</div>';
	}
	result += 		'</div>';
	result += 	'</div>';
	result += '</div>';

	return result;
}

function card_generate_empty(options) {
	var style_color = card_generate_color_style("white");

	var result = "";
	result += '<div class="card card-size-' + options.card_size + '" ' + style_color + '>';
	result += '</div>';
	return result;
}

// ============================================================================
// Functions that generate pages of cards
// ============================================================================

function card_repeat(card, count) {
	var result = [];
	for (var i = 0; i < count; ++i) {
		result.push(card);
	}
	return result;
}

function card_pages_split(data, rows, cols) {
	var cards_per_page = rows * cols;
	var result = [];
	for (var i = 0; i < data.length; i += cards_per_page) {
		var page = data.slice(i, i + cards_per_page);
		result.push(page);
	}
	return result;
}

function card_pages_merge(front_pages, back_pages) {
	var result = [];
	for (var i = 0; i < front_pages.length; ++i) {
		result.push(front_pages[i]);
		result.push(back_pages[i]);
	}
	return result;
}

function card_pages_flip_left_right(cards, rows, cols) {
	var result = [];
	for (var r = 0; r < rows; ++r) {
		for (var c = 0; c < cols; ++c) {
			var i = r*cols + (cols-1-c);
			result.push(cards[i]);
		}
	}
	return result;
}

function card_pages_add_padding(cards, options) {
	var cards_per_page = options.page_rows * options.page_columns;
	var last_page_cards = cards.length % cards_per_page;
	if (last_page_cards !== 0) {
		return cards.concat(card_repeat(card_generate_empty(options), cards_per_page - last_page_cards));
	} else {
		return cards;
	}
}

function card_pages_interleave_cards(front_cards, back_cards, options) {
	var result = [];
	var i = 0;
	while (i < front_cards.length) {
		result.push(front_cards[i]);
		result.push(back_cards[i]);
		if (options.page_columns > 2) {
			result.push(card_repeat(card_generate_empty(options), options.page_columns - 2));
		}
		++i;
	}
	return result;
}

function card_pages_wrap(pages, options) {
	var size = options.page_size || "A4";

	var result = "";
	for (var i = 0; i < pages.length; ++i) {
		var style = "";
		if ((options.card_arrangement === "doublesided") &&  (i % 2 === 1)) {
			style += 'style="background-color:white"';
		} else {
			style += 'style="background-color:white"';
		}
		result += '<page class="page page-preview" size="' + size + '" ' + style + '>\n';
		result += pages[i].join("\n");
		result += '</page>\n';
	}
	return result;
}

function card_pages_generate_style(options) {
	var size = "a4";
	switch (options.page_size) {
		case "A3": size = "A3 portrait"; break;
		case "A4": size = "210mm 297mm"; break;
		case "A5": size = "A5 portrait"; break;
		case "Letter": size = "letter portrait"; break;
		case "25x35": size = "2.5in 3.5in"; break;
		default: size = "auto";
	}

	var result = "";
	result += "<style>\n";
	result += "@page {\n";
	result += "    margin: 0;\n";
	result += "    size:" + size + ";\n";
	result += "    -webkit-print-color-adjust: exact;\n";
	result += "}\n";
	result += "</style>\n";
	return result;
}

function card_pages_generate_html(card_data, options) {
	options = options || card_default_options();
	var rows = options.page_rows || 3;
	var cols = options.page_columns || 3;

	// Generate the HTML for each card
	var front_cards = [];
	var back_cards = [];
	card_data.forEach(function (data) {
		var count = data.count == 0 ? 0 : (data.count || 1);
		var front = card_generate_front(data, options);
		var back = card_generate_back(data, options);
		front_cards = front_cards.concat(card_repeat(front, count));
		back_cards = back_cards.concat(card_repeat(back, count));
	});

	var pages = [];
	if (options.card_arrangement === "doublesided") {
		// Add padding cards so that the last page is full of cards
		front_cards = card_pages_add_padding(front_cards, options);
		back_cards = card_pages_add_padding(back_cards, options);

		// Split cards to pages
		var front_pages = card_pages_split(front_cards, rows, cols);
		var back_pages = card_pages_split(back_cards, rows, cols);

		// Shuffle back cards so that they line up with their corresponding front cards
		back_pages = back_pages.map(function (page) {
			return card_pages_flip_left_right(page, rows, cols);
		});

		// Interleave front and back pages so that we can print double-sided
		pages = card_pages_merge(front_pages, back_pages);
	} else if (options.card_arrangement === "front_only") {
		var cards = card_pages_add_padding(front_cards, options);
		pages = card_pages_split(cards, rows, cols);
	} else if (options.card_arrangement === "side_by_side") {
		var cards = card_pages_interleave_cards(front_cards, back_cards, options);
		cards = card_pages_add_padding(cards, options);
		pages = card_pages_split(cards, rows, cols);
	}

	// Wrap all pages in a <page> element and add CSS for the page size
	var result = "";
	result += card_pages_generate_style(options);
	result += card_pages_wrap(pages, options);

	return result;
}

function card_pages_insert_into(card_data, container) {
	// Clear the previous content of the document
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}

	// Insert the HTML
	var html = card_pages_generate_html(card_data);
	container.innerHTML = html;
}
