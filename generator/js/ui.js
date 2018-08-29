'use strict'

// Ugly global variable holding the current card deck
var card_data = [];
var card_options = card_default_options();

var ui = { "foldedSection": {} };


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

	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();

		reader.onload = function (reader) {
			var data = JSON.parse(this.result);
			ui_add_cards(data);
		};

		reader.readAsText(f);
	}

	// Reset file input
	$("#file-load-form")[0].reset();
}

function ui_save_file() {
	/*var str = JSON.stringify(card_data, null, "  ");
	var parts = [str];*/
	var parts = ["[\n"];
	for (var i = 0; i < card_data.length; ++i) {
		var card = card_data[i];
		var str = "";

		/*card_add_tag(card, card.type);
		card_add_tag(card, card.creature.cr);
		card_add_tag(card, card.creature.type);
		card_add_tag(card, card.creature.size);
		card_add_tag(card, card.creature.alignment);*/

		if (card.tags && card.tags.length == 0)
			delete card.tags;

		var tagsToSave = ["type", "title", "subtitle"];

		if (card.type == "creature") {
			tagsToSave.push("creature", "cr", "size", "alignment", "ac", "hp", "perception", "speed", "stats", "vulnerabilities", "resistances", "immunities");
		} else if (card.type == "item") {
			tagsToSave.push();
		} else {
			tagsToSave.push();
		}

		tagsToSave.push("description", "contents", "tags");

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
	a.download = prompt("Filename:", ui_save_file.filename);
	if (a.download) {
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

	$('#selected-card').empty();
	for (var i = 0; i < card_data.length; ++i) {
		var card = card_data[i];
		$('#selected-card')
			.append($("<option></option>")
				.attr("value", i)
				.text(card.title));
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
		if (card.tags)
			$("#card-tags").val(card.tags.join(", "));
		else
			$("#card-tags").val("");
		$("#card-description").val(card.description);
		$("#card-contents").val(card.contents.join("\n"));
		$("#card-reference").val(card.reference);

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
		}
		else {
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

function ui_change_default_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#default_color_selector");
	ui_set_default_color(color);
}

function ui_change_card_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#card_color_selector");
	ui_set_card_color(color);
}

function ui_change_default_icon() {
	var value = $(this).val();
	card_options.default.icon = value;
	ui_render_selected_card();
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

function typeahead_icon_list(items) {
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

function typeahead_list(items) {
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

$(document).ready(function () {
	local_store_cards_load();
	local_store_ui_load();
	ui_setup_color_selector();
	$(".icon-list").typeahead({
		source: icon_names,
		items: 'all',
		render: typeahead_icon_list
	});
	$(".icon-select-button").click(ui_select_icon);

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

		var buttonSpaceWidth = parseInt($(this).css('width')) / 2;

		var display = foldedContainer.css('display');
		var shouldSave = '';
		if (display !== 'none') {
			shouldSave = !ui.foldedSection[foldedContainer.selector];
			ui.foldedSection[foldedContainer.selector] = '#' + this.id;
			foldedContainer.hide();
			this.style.margin = '0px 2px';
			cardFormContainer.css('margin-left', (cardFormMargin - buttonSpaceWidth - 2) + 'px');
			cardFormContainer.css('margin-right', (cardFormMargin - buttonSpaceWidth - 2) + 'px');
			cardFormContainer.css('padding-left', (cardFormPadding + buttonSpaceWidth) + 'px');
			cardFormContainer.css('padding-right', (cardFormPadding + buttonSpaceWidth) + 'px');
			cardFormContainer.toggleClass('col-lg-' + cardFormContainerLG + ' col-lg-' + (cardFormContainerLG + foldedContainerLG));
		} else {
			shouldSave = ui.foldedSection[foldedContainer.selector];
			ui.foldedSection[foldedContainer.selector] = null;
			foldedContainer.show();
			this.style.margin = '';
			cardFormContainer.css('margin-left', (cardFormMargin + buttonSpaceWidth + 2) + 'px');
			cardFormContainer.css('margin-right', (cardFormMargin + buttonSpaceWidth + 2) + 'px');
			cardFormContainer.css('padding-left', (cardFormPadding - buttonSpaceWidth) + 'px');
			cardFormContainer.css('padding-right', (cardFormPadding - buttonSpaceWidth) + 'px');
			cardFormContainer.toggleClass('col-lg-' + cardFormContainerLG + ' col-lg-' + (cardFormContainerLG - foldedContainerLG));
		}

		$(this).toggleClass('btn-fold-section-right btn-fold-section-left');
		if (shouldSave)
			local_store_ui_save();
	});
	var foldedSectionKeys = Object.keys(ui.foldedSection);
	for (var i = 0; i < foldedSectionKeys.length; i++) {
		if (ui.foldedSection[foldedSectionKeys[i]])
			$(ui.foldedSection[foldedSectionKeys[i]]).click();
	}

	$("#button-generate").click(ui_generate);
	$("#button-load").click(function () { $("#file-load").click(); });
	$("#file-load").change(ui_load_files);
	$("#button-clear").click(ui_clear_all);
	$("#button-load-sample").click(ui_load_sample);
	$("#sort-execute").click(ui_sort_execute);
	$("#button-save").click(ui_save_file);
	$("#button-sort").click(ui_sort);
	$("#button-filter").click(ui_filter);
	$("#filter-execute").click(ui_filter_execute);
	$("#button-help").click(ui_open_help);


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

	// ----- Creature

	$("#card-creature-cr").change(ui_change_creature_property);
	$("#card-creature-size").change(ui_change_creature_property);
	// var alignments = Object.values(I18N.ALIGNMENTS);
	// for (var i = 0; i < alignments.length; i++) {
	// 	$("#card-creature-alignment").append('<option value="' + alignments[i] + '">' + alignments[i] + '</option>');
	// }
	$("#card-creature-alignment").typeahead({
		source: Object.values(I18N.ALIGNMENTS),
		items: 'all',
		minLength: 0,
		render: typeahead_list
	});
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
		matcher: function (item) {
			var words = this.query.toLowerCase().split(" ");
			return ~item.toLowerCase().indexOf(words[words.length - 1]);
		},
		updater: function (item) {
			var lastSpaceIdx = this.query.lastIndexOf(" ");
			if (lastSpaceIdx > 0)
				return this.query.substring(0, lastSpaceIdx) + " " + item;
			return item;
		},
		render: typeahead_list
	});
	$("#card-spell-type").change(ui_change_spell_property);
	$("#card-spell-classes").typeahead({
		source: Object.values(I18N.CLASSES),
		items: 'all',
		minLength: 0,
		matcher: function (item) {
			var words = this.query.toLowerCase().split(" ");
			return ~item.toLowerCase().indexOf(words[words.length - 1]);
		},
		updater: function (item) {
			var lastSpaceIdx = this.query.lastIndexOf(" ");
			if (lastSpaceIdx > 0)
				return this.query.substring(0, lastSpaceIdx) + " " + item;
			return item;
		},
		render: typeahead_list
	});
	$("#card-spell-classes").change(ui_change_spell_property);

	ui_update_card_list();
});
