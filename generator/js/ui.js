'use strict'

// Ugly global variable holding the current card deck
var card_data = [];
var card_options = card_default_options();

var ui = {
	foldedSections: {},
	foldedBlocks: {},
	selectedCardIdx: 0,
	filename: [],
	saveTime: '-'
};


function mergeSort(arr, compare) {
	if (arr.length < 2)
		return arr;

	var middle = parseInt(arr.length / 2);
	var left = arr.slice(0, middle);
	var right = arr.slice(middle, arr.length);

	return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge(left, right, compare) {
	var result = [];

	while (left.length && right.length) {
		if (compare(left[0], right[0]) <= 0) {
			result.push(left.shift());
		} else {
			result.push(right.shift());
		}
	}

	while (left.length)
		result.push(left.shift());

	while (right.length)
		result.push(right.shift());

	return result;
}

function ui_open_help() {
	$("#help-modal").modal('show');
}

function ui_load_sample() {
	card_data = card_data_example;
	ui_init_cards(card_data);
	ui_update_card_list();
}

function ui_sort() {
	$("#sort-modal").modal('show');
}

function ui_sort_execute() {
	$("#sort-modal").modal('hide');

	var fn_code = $("#sort-function").val();
	var fn = new Function("card_a", "card_b", fn_code);

	card_data = card_data.sort(function (card_a, card_b) {
		var result = fn(card_a, card_b);
		return result;
	});

	ui_update_card_list();
}

function ui_filter() {
	$("#filter-modal").modal('show');
}

function ui_filter_execute() {
	$("#filter-modal").modal('hide');

	var fn_code = $("#filter-function").val();
	var fn = new Function("card", fn_code);

	card_data = card_data.filter(function (card) {
		var result = fn(card);
		if (result === undefined) return true;
		else return result;
	});

	ui_update_card_list();
}

function ui_clear_all() {
	card_data = [];
	ui_update_card_list();
}

function ui_load_files(evt) {
	// ui_clear_all();
	card_data = [];

	var files = evt.target.files;

	ui.filename = [];
	ui.saveTime = '-';
	ui.selectedCardIdx = 0;

	for (var i = 0, f; f = files[i]; i++) {
		ui.filename.push(f.name);

		var reader = new FileReader();
		reader.onload = function (reader) {
			var data = JSON.parse(this.result);
			ui_add_cards(data);
		};
		reader.readAsText(f);
	}

	// Reset file input
	$("#file-load-form")[0].reset();
	$("#file-name").html('<b>File:</b> ' + ui.filename.join(", ") + '<br/><b>Last save:</b> ' + ui.saveTime);
	local_store_ui_save();
}

function ui_import_files(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		ui.filename.push(f.name);

		var reader = new FileReader();
		reader.onload = function (reader) {
			var data = JSON.parse(this.result);
			ui_add_cards(data);
		};
		reader.readAsText(f);
	}

	// Reset file input
	$("#file-load-form")[0].reset();
	$("#file-name").html('<b>File:</b> ' + ui.filename.join(", ") + '<br/><b>Last save:</b> ' + ui.saveTime);
	local_store_ui_save();
}

function ui_save_file() {
	var parts = ["[\n"];
	for (var i = 0; i < card_data.length; ++i) {
		var card = card_data[i];
		var str = "";

		if (card.tags && card.tags.length == 0)
			delete card.tags;

		var tagsToSave = ["type", "title", "subtitle", "color", "color_front", "color_back", "icon", "icon_back"];

		if (card.type == CardType.CREATURE) {
			tagsToSave.push("creature", "cr", "size", "alignment", "ac", "hp", "perception", "speed", "stats", "vulnerabilities", "resistances", "immunities");
		} else if (card.type == CardType.ITEM) {
			tagsToSave.push("item");
		} else if (card.type == CardType.SPELL) {
			tagsToSave.push("spell", "level", "ritual", "casting_time", "range", "verbal", "somatic", "material", "duration", "type", "classes");
		} else if (card.type == CardType.POWER) {
			tagsToSave.push("power");
		} else {
			tagsToSave.push();
		}

		tagsToSave.push("description", "contents", "tags", "reference", "compact");

		if (card.type == "creature")
			str = JSON.stringify(card, tagsToSave, "\t");
		else if (card.type == "item")
			str = JSON.stringify(card, tagsToSave, "\t");
		else
			str = JSON.stringify(card, tagsToSave, "\t");

		if (i < card_data.length - 1)
			str = str.concat(",\n");
		parts.push(str);
	}
	parts.push("\n]");
	var blob = new Blob(parts, { type: 'application/json' });
	var url = URL.createObjectURL(blob);

	var a = $("#file-save-link")[0];
	a.href = url;
	ui_save_file.filename = ui.filename[0] || ui_save_file.filename;
	a.download = prompt("Filename:", ui_save_file.filename);
	if (a.download && a.download != "null") {
		ui.filename = [a.download];

		var d = new Date();
		ui.saveTime = d.getDate() + '/' + d.getMonth() + '/' + (d.getFullYear() % 100) + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

		$("#file-name").html('<b>File:</b> ' + ui.filename.join(", ") + '<br/><b>Last save:</b> ' + ui.saveTime);
		local_store_ui_save();
		ui_save_file.filename = a.download;
		a.click();
	}

	setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}
ui_save_file.filename = 'Cards.json';

var ui_generate_modal_shown = false;
function ui_generate() {
	if (card_data.length === 0) {
		alert("Your deck is empty. Please define some cards first, or load the sample deck.");
		return;
	}

	// Generate output HTML
	var card_html = card_pages_generate_html(card_data, card_options);

	// Open a new window for the output
	// Use a separate window to avoid CSS conflicts
	var tab = window.open("output.html", 'rpg-cards-output');

	if (ui_generate_modal_shown === false) {
		$("#print-modal").modal('show');
		ui_generate_modal_shown = true;
	}

	// Send the generated HTML to the new window
	// Use a delay to give the new window time to set up a message listener
	setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}



function ui_init_cards(data) {
	data.forEach(function (card) {
		card_init(card);
	});
}

function ui_add_cards(data) {
	ui_init_cards(data);
	card_data = card_data.concat(data);
	ui_update_card_list();
}

function ui_select_card_by_index(index) {
	$("#selected-card").val(index);
	ui_update_selected_card();
}

function ui_selected_card_index() {
	return parseInt($("#selected-card").val(), 10);
}

function ui_selected_card() {
	return card_data[ui_selected_card_index()];
}

function ui_add_new_card() {
	var type = $("#card-type").val();
	var card = {};
	card.type = type;
	card_init(card);
	card.title = "New " + card.type;
	card.contents = [];
	card_data.push(card);
	ui_update_card_list(true);
	ui_select_card_by_index(card_data.length - 1);
}

function ui_duplicate_card() {
	var cardIdx = ui_selected_card_index();
	if (card_data.length > 0) {
		var old_card = ui_selected_card();
		var new_card = $.extend({}, old_card);
		if (cardIdx + 1 != card_data.length) {
			var cards_after = card_data.splice(cardIdx + 1, card_data.length - cardIdx - 1, new_card);
			card_data = card_data.concat(cards_after);
		} else
			card_data.push(new_card);
		new_card.title = new_card.title + " (Copy)";
	}
	ui_update_card_list(true);
	ui_select_card_by_index(cardIdx + 1);
}

function ui_delete_card() {
	var index = ui_selected_card_index();
	card_data.splice(index, 1);
	ui_update_card_list(true);
	ui_select_card_by_index(Math.min(index, card_data.length - 1));
}

function ui_select_icon() {
	window.open("http://game-icons.net/", "_blank");
}


function ui_update_card_list(doNotUpdateSelectedCard) {
	$("#total_card_count").text("contains " + card_data.length + " unique cards.");

	var cardsList = $("#cards-list");
	cardsList.empty();
	var selectedCardCombo = $("#selected-card");
	selectedCardCombo.empty();
	for (var i = 0; i < card_data.length; ++i) {
		var card = card_data[i];
		selectedCardCombo.append($('<option></option>').attr("value", i).text(card.title));
		var newCardInList = $('<h4 class="card-name"></h4>').attr("index", i).text(card.title).click(ui_card_list_select_card);
		if (card.color)
			newCardInList.css("background-color", card.color + "33");
		cardsList.append(newCardInList);
	}

	if (!doNotUpdateSelectedCard)
		ui_update_selected_card();
}

function ui_update_selected_card() {
	var card = ui_selected_card();
	if (card) {
		$("#card-type").val(card.type);

		$("#card-title").val(card.title);
		$("#card-title-size").val(card.title_size);
		$("#card-subtitle").val(card.subtitle);
		$("#card-count").val(card.count);
		$("#card-color").val(card.color).change();
		$("#card-icon").val(card.icon);
		$("#card-icon-back").val(card.icon_back);
		$("#card-background").val(card.background_image);
		$("#card-description").val(card.description);
		$("#card-contents").val(card.contents.join("\n"));
		if (card.tags)
			$("#card-tags").val(card.tags.join(", "));
		else
			$("#card-tags").val("");
		$("#card-reference").val(card.reference);
		$("#card-compact").prop("checked", card.compact);

		if (card.type == CardType.CREATURE) {
			$(".creature-hide").hide();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").show();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").hide();

			$("#card-creature-cr").val(card.creature.cr);
			$("#card-creature-size").val(card.creature.size);
			$("#card-creature-alignment").val(card.creature.alignment);
			$("#card-creature-type").val(card.creature.type);

			$("#card-creature-ac").val(card.creature.ac);
			$("#card-creature-hp").val(card.creature.hp);
			$("#card-creature-perception").val(card.creature.perception);
			$("#card-creature-speed").val(card.creature.speed);

			$("#card-creature-strength").val(card.creature.stats[0]);
			$("#card-creature-dexterity").val(card.creature.stats[1]);
			$("#card-creature-constitution").val(card.creature.stats[2]);
			$("#card-creature-intelligence").val(card.creature.stats[3]);
			$("#card-creature-wisdom").val(card.creature.stats[4]);
			$("#card-creature-charisma").val(card.creature.stats[5]);

			$("#card-creature-resistances").val(card.creature.resistances);
			$("#card-creature-vulnerabilities").val(card.creature.vulnerabilities);
			$("#card-creature-immunities").val(card.creature.immunities);
		} else if (card.type == CardType.ITEM) {
			$(".creature-hide").show();
			$(".item-hide").hide();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").show();
			$(".spell-only").hide();
			$(".power-only").hide();
		} else if (card.type == CardType.SPELL) {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").hide();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").show();
			$(".power-only").hide();

			$("#card-spell-level").val(card.spell.level);
			$("#card-spell-ritual").prop("checked", card.spell.ritual);
			$("#card-spell-casting-time").val(card.spell.casting_time);
			$("#card-spell-range").val(card.spell.range);
			$("#card-spell-verbal").prop("checked", card.spell.verbal);
			$("#card-spell-somatic").prop("checked", card.spell.somatic);
			$("#card-spell-materials").val(card.spell.materials);
			$("#card-spell-duration").val(card.spell.duration);
			$("#card-spell-type").val(card.spell.type);
			$("#card-spell-classes").val(card.spell.classes);
		} else if (card.type == CardType.POWER) {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").hide();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").show();
		} else {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").hide();
		}
	} else {
		$(".creature-only").hide();
		$(".item-only").hide();
		$(".spell-only").hide();
		$(".power-only").hide();
	}

	var cardsList = $("#cards-list");
	if ((ui.selectedCardIdx || ui.selectedCardIdx == 0) && ui.selectedCardIdx < card_data.length) {
		var oldCard = card_data[ui.selectedCardIdx];
		cardsList[0].children[ui.selectedCardIdx].style.backgroundColor = oldCard.color ? oldCard.color + "33" : "";
		cardsList[0].children[ui.selectedCardIdx].classList.remove("selected");
	}
	ui.selectedCardIdx = ui_selected_card_index();
	// cardsList[0].children[ui.selectedCardIdx].style.backgroundColor = "#00666633";
	cardsList[0].children[ui.selectedCardIdx].classList.add("selected");

	ui_render_selected_card();
}

function ui_render_selected_card() {
	var card = ui_selected_card();
	$('#preview-container').empty();
	if (card) {
		card_update(card);

		var front = card_generate_front(card, card_options);
		var back = card_generate_back(card, card_options);
		$('#preview-container').html(front + "\n" + back);
	}
	local_store_cards_save();
}

function ui_setup_color_selector() {
	// Insert colors
	$.each(card_colors, function (name, val) {//TODO: Change to a wheel or a line (save as #RRGGBB)
		$(".colorselector-data")
			.append($("<option></option>")
				.attr("value", name)
				.attr("data-color", val)
				.text(name));
	});

	// Callbacks for when the user picks a color
	$('#default_color_selector').colorselector({
		callback: function (value, color, title) {
			$("#default-color").val(title);
			ui_set_default_color(title);
		}
	});
	$('#card_color_selector').colorselector({
		callback: function (value, color, title) {
			$("#card-color").val(title);
			ui_set_card_color(value);
		}
	});
	$('#foreground_color_selector').colorselector({
		callback: function (value, color, title) {
			$("#foreground-color").val(title);
			ui_set_foreground_color(value);
		}
	});
	$('#background_color_selector').colorselector({
		callback: function (value, color, title) {
			$("#background-color").val(title);
			ui_set_background_color(value);
		}
	});

	// Styling
	$(".dropdown-colorselector").addClass("input-group-addon color-input-addon");
}


function ui_update_card_color_selector(color, input, selector) {
	/*if ($(selector + " option[value='" + color + "']").length > 0) {
		// Update the color selector to the entered value
		$(selector).colorselector("setColor", color);
	} else {
		// Unknown color - select a neutral color and reset the text value
		$(selector).colorselector("setColor", "");
		input.val(color);
	}*/
	$(selector).colorselector('setColor', color);
	input.val(color);
}

function ui_set_default_color(color) {
	card_options.default.color = color;
	ui_render_selected_card();
}

function ui_set_foreground_color(color) {
	card_options.foreground_color = color;
}

function ui_set_background_color(color) {
	card_options.background_color = color;
}

function ui_set_card_color(value) {
	var card = ui_selected_card();
	if (card) {
		if (value && value != card_options.default.color)
			card.color = value;
		else
			delete card.color;
		ui_render_selected_card();
	}
}

function ui_change_card_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#card_color_selector");
	ui_set_card_color(color);
}

function ui_change_option() {
	var property = $(this).attr("data-option");
	var value;
	if ($(this).attr('type') === 'checkbox') {
		value = $(this).is(':checked');
	}
	else {
		value = $(this).val();
	}
	card_options[property] = value;
	ui_render_selected_card();
}

function ui_change_card_title() {
	var title = $("#card-title").val();
	var card = ui_selected_card();
	if (card) {
		card.title = title;
		if (ui.selectedCardIdx || ui.selectedCardIdx == 0)
			$("#cards-list")[0].children[ui.selectedCardIdx].innerText = title;
		$("#selected-card option:selected").text(title);
		ui_render_selected_card();
	}
}

function ui_change_card_property() {
	var property = $(this).attr("data-property");
	var value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		if (value == card_options.default[property])
			delete card[property];
		else
			card[property] = value;
		ui_render_selected_card();
	}
}

function ui_change_creature_property() {
	var property = $(this).attr("data-property");
	var value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		card.creature[property] = value;
		ui_render_selected_card();
	}
}

function ui_change_creature_stats() {
	var property = $(this).attr("data-property");
	var value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		card.creature.stats[property] = value;
		ui_render_selected_card();
	}
}

function ui_change_spell_property() {
	var property = $(this).attr("data-property");
	var value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		card.spell[property] = value;
		ui_render_selected_card();
	}
}

function ui_change_card_description() {
	var value = $(this).val();

	var card = ui_selected_card();
	if (card) {
		card.description = value;
		ui_render_selected_card();
	}
}

function ui_change_card_description_keyup() {
	clearTimeout(ui_change_card_description_keyup.timeout);
	ui_change_card_description_keyup.timeout = setTimeout(function () {
		$('#card-description').trigger('change');
	}, 200);
}
ui_change_card_description_keyup.timeout = null;

function ui_change_card_contents() {
	var value = $(this).val();

	var card = ui_selected_card();
	if (card) {
		card.contents = value.replace(/ /g, " ").split("\n");
		ui_render_selected_card();
	}
}

function ui_change_card_contents_keyup() {
	clearTimeout(ui_change_card_contents_keyup.timeout);
	ui_change_card_contents_keyup.timeout = setTimeout(function () {
		$('#card-contents').trigger('change');
	}, 200);
}
ui_change_card_contents_keyup.timeout = null;

function ui_change_card_tags() {
	var value = $(this).val();

	var card = ui_selected_card();
	if (card) {
		if (value.trim().length === 0) {
			card.tags = [];
		} else {
			card.tags = value.split(",").map(function (val) {
				return val.trim().toLowerCase();
			});
		}
		ui_render_selected_card();
	}
}

function ui_change_card_compact() {
	var card = ui_selected_card();
	if (card) {
		card.compact = $(this).is(':checked');
		ui_render_selected_card();
	}
}


function ui_change_default_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#default_color_selector");
	ui_set_default_color(color);
}

function ui_change_default_icon() {
	var value = $(this).val();
	card_options.default.icon = value;
	ui_render_selected_card();
}

function ui_change_default_title_size() {
	card_options.default.title_size = $(this).val();
	ui_render_selected_card();
}

function ui_change_default_icon_size() {
	card_options.icon_inline = $(this).is(':checked');
	ui_render_selected_card();
}

function ui_apply_default_color() {
	for (var i = 0; i < card_data.length; ++i) {
		if (!card_data[i].type)
			card_data[i].color = card_options.default.color;
	}
	ui_render_selected_card();
}

function ui_apply_default_icon() {
	for (var i = 0; i < card_data.length; ++i) {
		card_data[i].icon = card_options.default.icon;
	}
	ui_render_selected_card();
}

function ui_apply_default_icon_back() {
	for (var i = 0; i < card_data.length; ++i) {
		card_data[i].icon_back = card_options.default.icon;
	}
	ui_render_selected_card();
}


function ui_card_list_select_card() {
	var idx = $(this).attr("index");
	ui_select_card_by_index(idx);
}

function ui_card_list_up() {
	var cardIdx = ui_selected_card_index();
	if (cardIdx > 0) {
		var old_card = ui_selected_card();
		card_data[cardIdx] = card_data[cardIdx - 1];
		card_data[cardIdx - 1] = old_card;
		ui_update_card_list(true);
		ui_select_card_by_index(cardIdx - 1);
	}
}

function ui_card_list_down() {
	var cardIdx = ui_selected_card_index();
	if (cardIdx < card_data.length - 1) {
		var old_card = ui_selected_card();
		card_data[cardIdx] = card_data[cardIdx + 1];
		card_data[cardIdx + 1] = old_card;
		ui_update_card_list(true);
		ui_select_card_by_index(cardIdx + 1);
	}
}


//Adding support for local store
function local_store_cards_save() {
	if (window.localStorage) {
		try {
			localStorage.setItem("card_data", JSON.stringify(card_data));
		} catch (e) {
			//if the local store save failed should we notify the user that the data is not being saved?
			console.log(e);
		}
	}
}
function local_store_cards_load() {
	if (window.localStorage) {
		try {
			card_data = JSON.parse(localStorage.getItem("card_data")) || card_data;
		} catch (e) {
			//if the local store load failed should we notify the user that the data load failed?
			console.log(e);
		}
	}
}
function local_store_ui_save() {
	if (window.localStorage) {
		try {
			localStorage.setItem("ui", JSON.stringify(ui));
		} catch (e) {
			//if the local store save failed should we notify the user that the data is not being saved?
			console.log(e);
		}
	}
}
function local_store_ui_load() {
	if (window.localStorage) {
		try {
			ui = JSON.parse(localStorage.getItem("ui")) || ui;
		} catch (e) {
			//if the local store load failed should we notify the user that the data load failed?
			console.log(e);
		}
	}
}


function typeahead_matcher(item) {
	var words = this.query.toLowerCase().split(" ");
	return ~item.toLowerCase().indexOf(words[words.length - 1]);
}

function typeahead_updater(item) {
	var lastSpaceIdx = this.query.lastIndexOf(" ");
	if (lastSpaceIdx > 0)
		return this.query.substring(0, lastSpaceIdx) + " " + item;
	return item;
}

function typeahead_render(items) {
	var that = this;

	items = $(items).map(function (i, item) {
		// Fetch the li tags
		i = $(that.options.item).data('value', item);
		// Highlight matching text in the line
		i.find('a').html(that.highlighter(item));
		return i[0];
	});

	if (this.autoSelect) {
		items.first().addClass('active');
	}
	this.$menu.html(items);
	this.$menu.addClass('dropdown-text');
	return this;
}

function typeahead_icon_render(items) {
	var that = this;

	items = $(items).map(function (i, item) {
		// Fetch the li tags
		i = $(that.options.item).data('value', item);
		// Highlight matching text in the line
		i.find('a').html(that.highlighter(item));
		// Add icons with the span
		var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
		i.find('a').append('<span class="' + classname + '"></span>');
		return i[0];
	});

	if (this.autoSelect) {
		items.first().addClass('active');
	}
	this.$menu.html(items);
	this.$menu.addClass('dropdown-icons');
	return this;
}


$(document).ready(function () {

	// Shortcuts
	var preventPageDownOrUp = function (e) {
		if (e.which == 33 || e.which == 34) { // Pg up or down
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
	};
	$(document).keydown(function (e) {
		if (e.which == 33) { // Pg up
			if (e.preventDefault)
				e.preventDefault();
			var idx = ui_selected_card_index();
			if (idx > 0)
				ui_select_card_by_index(idx - 1);
			e.returnValue = false;
		} else if (e.which == 34) { // Pg down
			if (e.preventDefault)
				e.preventDefault();
			var idx = ui_selected_card_index();
			if (idx < card_data.length - 1)
				ui_select_card_by_index(idx + 1);
			e.returnValue = false;
		} else if (e.ctrlKey && e.key == "s") {
			if (e.preventDefault)
				e.preventDefault();
			ui_save_file();
			e.returnValue = false;
		} else if (e.ctrlKey && e.key == "g") {
			if (e.preventDefault)
				e.preventDefault();
			ui_generate();
			e.returnValue = false;
		}
	});


	local_store_cards_load();
	local_store_ui_load();

	$(".btn-fold-section").click(function () {
		var cardFormContainer = $('#card-form-container');
		var cardFormContainerLG = cardFormContainer[0].classList.value;
		var cardFormContainerLGIdx = cardFormContainerLG.indexOf('col-lg-') + 7;
		cardFormContainerLG = parseInt(cardFormContainerLG.substring(cardFormContainerLGIdx, cardFormContainerLGIdx + 2));
		var cardFormMargin = parseInt(cardFormContainer.css('margin-left'));
		var cardFormPadding = parseInt(cardFormContainer.css('padding-left'));

		var foldedContainer = $('#' + $(this).attr('for'));
		var foldedContainerLG = foldedContainer[0].classList.value;
		var foldedContainerLGIdx = foldedContainerLG.indexOf('col-lg-') + 7;
		foldedContainerLG = parseInt(foldedContainerLG.substring(foldedContainerLGIdx, foldedContainerLGIdx + 2));

		var buttonSpaceWidth = parseInt($(this).css('width'));

		var display = foldedContainer.css('display');
		var shouldSave = '';
		if (display !== 'none') {
			shouldSave = !ui.foldedSections[foldedContainer.selector];
			ui.foldedSections[foldedContainer.selector] = '#' + this.id;
			foldedContainer.hide();
			$(this).css('margin', '0px 2px');
			buttonSpaceWidth += 4;
			$(this).css('width', buttonSpaceWidth + 'px');
			cardFormContainer.css('margin-left', (cardFormMargin - buttonSpaceWidth / 2 - 2) + 'px');
			cardFormContainer.css('margin-right', (cardFormMargin - buttonSpaceWidth / 2 - 2) + 'px');
			cardFormContainer.css('padding-left', (cardFormPadding + buttonSpaceWidth / 2) + 'px');
			cardFormContainer.css('padding-right', (cardFormPadding + buttonSpaceWidth / 2) + 'px');
			cardFormContainer.toggleClass('col-lg-' + cardFormContainerLG + ' col-lg-' + (cardFormContainerLG + foldedContainerLG));
		} else {
			shouldSave = ui.foldedSections[foldedContainer.selector];
			ui.foldedSections[foldedContainer.selector] = null;
			foldedContainer.show();
			$(this).css('margin', '');
			buttonSpaceWidth -= 4;
			$(this).css('width', buttonSpaceWidth + 'px');
			cardFormContainer.css('margin-left', (cardFormMargin + buttonSpaceWidth / 2 + 4) + 'px');
			cardFormContainer.css('margin-right', (cardFormMargin + buttonSpaceWidth / 2 + 4) + 'px');
			cardFormContainer.css('padding-left', (cardFormPadding - buttonSpaceWidth / 2 - 2) + 'px');
			cardFormContainer.css('padding-right', (cardFormPadding - buttonSpaceWidth / 2 - 2) + 'px');
			cardFormContainer.toggleClass('col-lg-' + cardFormContainerLG + ' col-lg-' + (cardFormContainerLG - foldedContainerLG));
		}

		$(this).toggleClass('btn-fold-section-right btn-fold-section-left');
		if (shouldSave)
			local_store_ui_save();
	});
	var foldedSectionsKeys = Object.keys(ui.foldedSections);
	for (var i = 0; i < foldedSectionsKeys.length; i++) {
		if (ui.foldedSections[foldedSectionsKeys[i]])
			$(ui.foldedSections[foldedSectionsKeys[i]]).click();
	}

	$(".btn-fold-block").click(function () {
		var button = $('#' + this.id);

		var foldedBlock = $('#' + $(this).attr('for'));
		var display = foldedBlock.css('display');
		var shouldSave = '';
		if (display !== 'none') {
			shouldSave = !ui.foldedBlocks[foldedBlock.selector];
			ui.foldedBlocks[foldedBlock.selector] = button.selector;
			foldedBlock.hide();
			var buttonsPoints = button[0].children[0].children[0].points;
			buttonsPoints[0].x = 0;
			buttonsPoints[0].y = 0;
			buttonsPoints[1].x = 100;
			buttonsPoints[1].y = 50;
			buttonsPoints[2].x = 0;
			buttonsPoints[2].y = 100;
		} else {
			shouldSave = ui.foldedBlocks[foldedBlock.selector];
			ui.foldedBlocks[foldedBlock.selector] = null;
			foldedBlock.show();
			var buttonsPoints = button[0].children[0].children[0].points;
			buttonsPoints[0].x = 0;
			buttonsPoints[0].y = 0;
			buttonsPoints[1].x = 100;
			buttonsPoints[1].y = 0;
			buttonsPoints[2].x = 50;
			buttonsPoints[2].y = 100;
		}

		if (shouldSave)
			local_store_ui_save();
	});
	var foldedBlockKeys = Object.keys(ui.foldedBlocks);
	for (var i = 0; i < foldedBlockKeys.length; i++) {
		if (ui.foldedBlocks[foldedBlockKeys[i]])
			$(ui.foldedBlocks[foldedBlockKeys[i]]).click();
	}

	ui_setup_color_selector();
	$(".icon-list").typeahead({
		source: icon_names,
		items: 'all',
		render: typeahead_icon_render
	});
	$(".icon-list").keydown(preventPageDownOrUp);
	$(".icon-select-button").click(ui_select_icon);

	$("#button-generate").click(ui_generate);
	$("#button-load").click(function () { $("#file-load").click(); });
	$("#file-load").change(ui_load_files);
	$("#button-import").click(function () { $("#file-import").click(); });
	$("#file-import").change(ui_import_files);
	$("#button-clear").click(ui_clear_all);
	$("#button-load-sample").click(ui_load_sample);
	$("#sort-execute").click(ui_sort_execute);
	$("#button-save").click(ui_save_file);
	$("#button-sort").click(ui_sort);
	$("#button-filter").click(ui_filter);
	$("#filter-execute").click(ui_filter_execute);
	$("#button-help").click(ui_open_help);

	if (ui.filename)
		$("#file-name").html('<b>File:</b> ' + ui.filename.join(", ") + '<br/><b>Last save:</b> ' + ui.saveTime);

	// ----- Page settings

	$("#page-size").change(ui_change_option);
	$("#page-rows").change(ui_change_option);
	$("#page-columns").change(ui_change_option);
	$("#card-arrangement").change(ui_change_option);
	$("#card-size").change(ui_change_option);
	$("#background-color").change(ui_change_option);
	$("#rounded-corners").change(ui_change_option);

	// ----- Default values

	$("#default-color").change(ui_change_default_color);
	$("#default-icon").change(ui_change_default_icon);
	$("#default-title-size").change(ui_change_default_title_size);
	$("#small-icons").change(ui_change_default_icon_size);
	$("#button-apply-color").click(ui_apply_default_color);
	$("#button-apply-icon").click(ui_apply_default_icon);
	$("#button-apply-icon-back").click(ui_apply_default_icon_back);

	// ----- Cards list

	$("#button-up").click(ui_card_list_up);
	$("#button-down").click(ui_card_list_down);

	// ----- Card

	$("#button-add-card").click(ui_add_new_card);
	$("#button-duplicate-card").click(ui_duplicate_card);
	$("#button-delete-card").click(ui_delete_card);
	$("#selected-card").change(ui_update_selected_card);

	$("#card-title").change(ui_change_card_title);
	$("#card-title-size").change(ui_change_card_property);
	$("#card-subtitle").change(ui_change_card_property);
	$("#card-icon").change(ui_change_card_property);
	$("#card-count").change(ui_change_card_property);
	$("#card-icon-back").change(ui_change_card_property);
	$("#card-background").change(ui_change_card_property);
	$("#card-color").change(ui_change_card_color);
	$("#card-tags").change(ui_change_card_tags);
	$("#card-reference").change(ui_change_card_property);

	$("#card-description").keyup(ui_change_card_description_keyup);
	$("#card-description").change(ui_change_card_description);
	$("#card-contents").keyup(ui_change_card_contents_keyup);
	$("#card-contents").change(ui_change_card_contents);
	$("#card-contents").keydown(function (e) {
		if (!e.altKey)
			return;
		if (e.key == "i") {
			var value = $(this)[0].value;
			var selectionStart = $(this)[0].selectionStart;
			var selectionEnd = $(this)[0].selectionEnd;
			var textBefore = value.slice(0, selectionStart);
			var textBetween = value.slice(selectionStart, selectionEnd);
			var textAfter = value.slice(selectionEnd);
			$(this)[0].value = textBefore + '<i>' + textBetween + '</i>' + textAfter;
			if (textBetween.length == 0)
				$(this)[0].selectionStart = selectionStart + 3;
			else
				$(this)[0].selectionStart = selectionStart + textBetween.length + 7;
			$(this)[0].selectionEnd = $(this)[0].selectionStart;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
		if (e.key == "b") {
			var value = $(this)[0].value;
			var selectionStart = $(this)[0].selectionStart;
			var selectionEnd = $(this)[0].selectionEnd;
			var textBefore = value.slice(0, selectionStart);
			var textBetween = value.slice(selectionStart, selectionEnd);
			var textAfter = value.slice(selectionEnd);
			$(this)[0].value = textBefore + '<b>' + textBetween + '</b>' + textAfter;
			if (textBetween.length == 0)
				$(this)[0].selectionStart = selectionStart + 3;
			else
				$(this)[0].selectionStart = selectionStart + textBetween.length + 7;
			$(this)[0].selectionEnd = $(this)[0].selectionStart;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
	});

	$("#card-compact").change(ui_change_card_compact);

	// ----- Creature

	$("#card-creature-cr").change(ui_change_creature_property);
	$("#card-creature-size").change(ui_change_creature_property);
	$("#card-creature-alignment").typeahead({
		source: Object.values(I18N.ALIGNMENTS),
		items: 'all',
		minLength: 0,
		render: typeahead_render
	});
	$("#card-creature-alignment").keydown(preventPageDownOrUp);
	$("#card-creature-alignment").change(ui_change_creature_property);
	$("#card-creature-type").change(ui_change_creature_property);

	$("#card-creature-ac").change(ui_change_creature_property);
	$("#card-creature-hp").change(ui_change_creature_property);
	$("#card-creature-perception").change(ui_change_creature_property);
	$("#card-creature-speed").change(ui_change_creature_property);

	$("#card-creature-strength").change(ui_change_creature_stats);
	$("#card-creature-dexterity").change(ui_change_creature_stats);
	$("#card-creature-constitution").change(ui_change_creature_stats);
	$("#card-creature-intelligence").change(ui_change_creature_stats);
	$("#card-creature-wisdom").change(ui_change_creature_stats);
	$("#card-creature-charisma").change(ui_change_creature_stats);

	$("#card-creature-resistances").change(ui_change_creature_property);
	$("#card-creature-vulnerabilities").change(ui_change_creature_property);
	$("#card-creature-immunities").change(ui_change_creature_property);

	// ----- Spell

	$("#card-spell-level").change(ui_change_spell_property);
	$("#card-spell-ritual").change(ui_change_spell_property);
	$("#card-spell-casting-time").change(ui_change_spell_property);
	$("#card-spell-range").change(ui_change_spell_property);
	$("#card-spell-verbal").change(ui_change_spell_property);
	$("#card-spell-somatic").change(ui_change_spell_property);
	$("#card-spell-materials").change(ui_change_spell_property);
	$("#card-spell-duration").change(ui_change_spell_property);
	$("#card-spell-type").typeahead({
		source: Object.values(I18N.SPELL_TYPES),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$("#card-spell-type").keydown(preventPageDownOrUp);
	$("#card-spell-type").change(ui_change_spell_property);
	$("#card-spell-classes").typeahead({
		source: Object.values(I18N.CLASSES),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$("#card-spell-classes").keydown(preventPageDownOrUp);
	$("#card-spell-classes").change(ui_change_spell_property);

	ui_update_card_list();
});
