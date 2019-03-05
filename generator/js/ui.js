'use strict'


// Ugly global variable holding the current card deck
var g_card_data = [];
var g_card_options = card_default_options();

var g_ui = {
	foldedSections: {},
	foldedBlocks: {},
	selectedCardIdx: 0,
	filename: [],
	saveTime: '-'
};
var g_previousCardIdx;


function ui_open_help() {
	$("#help-modal").modal('show');
}

function ui_load_sample() {
	g_card_data = card_data_example;
	ui_init_cards(g_card_data);
	ui_update_card_list();
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

function mergeSort(arr, compare) {
	if (arr.length < 2)
		return arr;

	var middle = parseInt(arr.length / 2);
	var left = arr.slice(0, middle);
	var right = arr.slice(middle, arr.length);

	return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}


function ui_sort() {
	$("#sort-modal").modal('show');
}

function ui_sort_execute() {
	$("#sort-modal").modal('hide');

	var fn_code = $("#sort-function").val();
	var fn = new Function("card_a", "card_b", fn_code);

	g_card_data = g_card_data.sort(function (card_a, card_b) {
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

	g_card_data = g_card_data.filter(function (card) {
		var result = fn(card);
		if (result === undefined) return true;
		else return result;
	});

	ui_update_card_list();
}

function ui_clear_all() {
	g_card_data = [];
	ui_update_card_list();
}

function ui_init_cards(data) {
	data.forEach(function (card) {
		card_update(card);
	});
}

function ui_add_cards(data) {
	ui_init_cards(data);
	g_card_data = g_card_data.concat(data);
	ui_update_card_list();
}

function ui_load_files(evt) {
	g_card_data = [];

	var files = evt.target.files;

	g_ui.filename = [];
	g_ui.saveTime = '-';
	g_ui.selectedCardIdx = 0;

	for (var i = 0, f; f = files[i]; i++) {
		g_ui.filename.push(f.name);

		var reader = new FileReader();
		reader.onload = function (reader) {
			var data = JSON.parse(this.result);
			for (var i in data) {
				var card;
				if (data[i].cardType == CardType.CREATURE)
					card = new CreatureCard();
				else if (data[i].cardType == CardType.ITEM)
					card = new ItemCard();
				else if (data[i].cardType == CardType.SPELL)
					card = new SpellCard();
				else if (data[i].cardType == CardType.POWER)
					card = new PowerCard();
				else
					card = new Card();
				Object.assign(card, data[i]);
				data[i] = card;
			}
			ui_add_cards(data);
		};
		reader.readAsText(f);
	}

	// Reset file input
	$("#file-load-form")[0].reset();
	$("#file-name").html('<b>File:</b> ' + g_ui.filename.join(", ") + '<br/><b>Last save:</b> ' + g_ui.saveTime);
	local_store_ui_save();
}

function ui_import_files(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		g_ui.filename.push(f.name);

		var reader = new FileReader();
		reader.onload = function (reader) {
			var data = JSON.parse(this.result);
			for (var i in g_card_data) {
				if (g_card_data[i].cardType == CardType.CREATURE)
					g_card_data[i].__proto__ = CreatureCard.prototype;
				else if (g_card_data[i].cardType == CardType.ITEM)
					g_card_data[i].__proto__ = ItemCard.prototype;
				else if (g_card_data[i].cardType == CardType.SPELL)
					g_card_data[i].__proto__ = SpellCard.prototype;
				else if (g_card_data[i].cardType == CardType.POWER)
					g_card_data[i].__proto__ = PowerCard.prototype;
				else
					g_card_data[i].__proto__ = Card.prototype;
			}
			ui_add_cards(data);
		};
		reader.readAsText(f);
	}

	// Reset file input
	$("#file-load-form")[0].reset();
	$("#file-name").html('<b>File:</b> ' + g_ui.filename.join(", ") + '<br/><b>Last save:</b> ' + g_ui.saveTime);
	local_store_ui_save();
}

function ui_save_file() {
	var parts = ["[\n"];
	var defaultCreature = new CreatureCard();
	var defaultItem = new ItemCard();
	var defaultSpell = new SpellCard();
	var defaultPower = new PowerCard();
	var defaultCard = new Card();
	for (var i = 0; i < g_card_data.length; ++i) {
		var card = g_card_data[i];
		var str = "";

		if (card.tags && card.tags.length == 0)
			delete card.tags;

		if (card.cardType === CardType.CREATURE) {
			str = JSON.stringify(card, function (key, value) {
				if (key == "cardType" || value !== defaultCreature[key])
					return value;
			}, "\t");
		} else if (card.cardType === CardType.ITEM) {
			str = JSON.stringify(card, function (key, value) {
				if (key == "cardType" || value !== defaultItem[key])
					return value;
			}, "\t");
		} else if (card.cardType === CardType.SPELL) {
			str = JSON.stringify(card, function (key, value) {
				if (key == "cardType" || value !== defaultSpell[key])
					return value;
			}, "\t");
		} else if (card.cardType === CardType.POWER) {
			str = JSON.stringify(card, function (key, value) {
				if (key == "cardType" || value !== defaultPower[key])
					return value;
			}, "\t");
		} else {
			str = JSON.stringify(card, function (key, value) {
				if (key == "cardType" || value !== defaultCard[key])
					return value;
			}, "\t");
		}

		if (i < g_card_data.length - 1)
			str = str.concat(",\n");
		parts.push(str);
	}
	parts.push("\n]");
	var blob = new Blob(parts, { type: 'application/json' });
	var url = URL.createObjectURL(blob);

	var a = $("#file-save-link")[0];
	a.href = url;
	ui_save_file.filename = g_ui.filename[0] || ui_save_file.filename;
	a.download = prompt("Filename:", ui_save_file.filename);
	if (a.download && a.download != "null") {
		g_ui.filename = [a.download];

		var d = new Date();
		g_ui.saveTime = d.getDate() + '/' + d.getMonth() + '/' + (d.getFullYear() % 100) + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

		$("#file-name").html('<b>File:</b> ' + g_ui.filename.join(", ") + '<br/><b>Last save:</b> ' + g_ui.saveTime);
		local_store_ui_save();
		ui_save_file.filename = a.download;
		a.click();
	}

	setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}
ui_save_file.filename = 'Cards.json';

var g_ui_generate_modal_shown = false;
function ui_generate() {
	if (g_card_data.length === 0) {
		alert("Your deck is empty. Please define some cards first, or load the sample deck.");
		return;
	}

	if (g_ui_generate_modal_shown === false) {
		$("#print-modal").modal('show');
		g_ui_generate_modal_shown = true;
	}

	// Generate output HTML
	var card_html = card_pages_generate_html(g_card_data, g_card_options);

	// Open a new window for the output
	// Use a separate window to avoid CSS conflicts
	var tab = window.open("output.html", 'rpg-cards-output');

	// Send the generated HTML to the new window
	// Use a delay to give the new window time to set up a message listener
	setTimeout(function () { tab.postMessage(card_html, '*'); }, 500);
}


function ui_select_card_by_index(index) {
	g_previousCardIdx = g_ui.selectedCardIdx;
	g_ui.selectedCardIdx = index;
	local_store_ui_save();
	ui_update_selected_card();
}

function ui_selected_card() {
	return g_card_data[g_ui.selectedCardIdx];
}

function ui_add_new_card() {
	var cardIdx = g_ui.selectedCardIdx;
	var cardType = $("#card-type").val();
	var new_card;
	if (cardType == CardType.CREATURE)
		new_card = new CreatureCard();
	else if (cardType == CardType.ITEM)
		new_card = new ItemCard();
	else if (cardType == CardType.SPELL)
		new_card = new SpellCard();
	else if (cardType == CardType.POWER)
		new_card = new PowerCard();
	else
		new_card = new Card();

	new_card.title = "New " + new_card.cardType;
	if (cardIdx + 1 != g_card_data.length) {
		var cards_after = g_card_data.splice(cardIdx + 1, g_card_data.length - cardIdx - 1, new_card);
		g_card_data = g_card_data.concat(cards_after);
	} else
		g_card_data.push(new_card);
	ui_update_card_list(true);
	ui_select_card_by_index(cardIdx + 1);

	$('#card-title').select();
}

function ui_duplicate_card() {
	if (g_card_data.length > 0) {
		var cardIdx = g_ui.selectedCardIdx;
		var old_card = ui_selected_card();
		var new_card = clone(old_card);
		new_card.title = new_card.title + " (Copy)";
		if (cardIdx + 1 != g_card_data.length) {
			var cards_after = g_card_data.splice(cardIdx + 1, g_card_data.length - cardIdx - 1, new_card);
			g_card_data = g_card_data.concat(cards_after);
		} else
			g_card_data.push(new_card);
		ui_update_card_list(true);
		ui_select_card_by_index(cardIdx + 1);

		$('#card-title').select();
	}
}

function ui_delete_card() {
	if (g_card_data.length > 0) {
		var index = g_ui.selectedCardIdx;
		g_card_data.splice(index, 1);
		ui_update_card_list(true);
		ui_select_card_by_index(Math.min(index, g_card_data.length - 1));
	}
}


function ui_update_card_list(doNotUpdateSelectedCard) {
	$("#total_card_count").text("(" + g_card_data.length + " unique)");

	var cardsList = $("#cards-list");
	cardsList.empty();
	for (var i in g_card_data) {
		var card = g_card_data[i];

		var newCardInList = $('<div class="card-name"></div>').attr('index', i);
		newCardInList.append($('<h4></h4>').text(card.title).click(ui_card_list_select_card));
		var countBlock = $('<div class="card-count"></div>');
		var buttonDecrease = $('<button type="button" class="btn btn-default card-count-less">-</button>').click(ui_change_card_count_decrease);
		var count;
		if (card.count == 0) {
			buttonDecrease[0].disabled = true;
			count = $('<span></span>').text(0);
		} else
			count = $('<span></span>').text(card.count || 1);
		countBlock.append(buttonDecrease);
		countBlock.append(count);
		countBlock.append($('<button type="button" class="btn btn-default card-count-more">+</button>').click(ui_change_card_count_increase));
		newCardInList.append(countBlock);
		if (card.color)
			newCardInList.css("background-color", card.color + "33");
		cardsList.append(newCardInList);
	}

	if (!doNotUpdateSelectedCard)
		ui_update_selected_card();
}

var g_dontRenderSelectedCard = false;
function ui_update_selected_card() {
	g_dontRenderSelectedCard = true;
	var card = ui_selected_card();
	if (card) {
		$("#card-type").val(card.cardType);

		$("#card-title").val(card.title);
		$("#card-title-size").val(card.title_size);
		$("#card-subtitle").val(card.subtitle);
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

		if (card.cardType == CardType.CREATURE) {
			$(".creature-hide").hide();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").show();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").hide();

			$("#card-creature-cr").val(card.cr);
			$("#card-creature-size").val(card.size);
			$("#card-creature-alignment").val(card.alignment);
			$("#card-creature-type").val(card.type);

			$("#card-creature-ac").val(card.ac);
			$("#card-creature-hp").val(card.hp);
			$("#card-creature-perception").val(card.perception);
			$("#card-creature-speed").val(card.speed);

			$("#card-creature-strength").val(card.stats[0]);
			$("#card-creature-dexterity").val(card.stats[1]);
			$("#card-creature-constitution").val(card.stats[2]);
			$("#card-creature-intelligence").val(card.stats[3]);
			$("#card-creature-wisdom").val(card.stats[4]);
			$("#card-creature-charisma").val(card.stats[5]);

			$("#card-creature-resistances").val(card.resistances);
			$("#card-creature-vulnerabilities").val(card.vulnerabilities);
			$("#card-creature-immunities").val(card.immunities);

			$('#card-contents').attr("rows", 17);
		} else if (card.cardType == CardType.ITEM) {
			$(".creature-hide").show();
			$(".item-hide").hide();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").show();
			$(".spell-only").hide();
			$(".power-only").hide();

			$('#card-contents').attr("rows", 27);
		} else if (card.cardType == CardType.SPELL) {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").hide();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").show();
			$(".power-only").hide();

			$("#card-spell-level").val(card.level);
			$("#card-spell-ritual").prop("checked", card.ritual);
			$("#card-spell-casting-time").val(card.casting_time);
			$("#card-spell-range").val(card.range);
			$("#card-spell-verbal").prop("checked", card.verbal);
			$("#card-spell-somatic").prop("checked", card.somatic);
			$("#card-spell-materials").val(card.materials);
			$("#card-spell-duration").val(card.duration);
			$("#card-spell-type").val(card.type);
			$("#card-spell-classes").val(card.classes);

			$('#card-contents').attr("rows", 21);
		} else if (card.cardType == CardType.POWER) {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").hide();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").show();

			$('#card-contents').attr("rows", 27);
		} else {
			$(".creature-hide").show();
			$(".item-hide").show();
			$(".spell-hide").show();
			$(".power-hide").show();

			$(".creature-only").hide();
			$(".item-only").hide();
			$(".spell-only").hide();
			$(".power-only").hide();

			$('#card-contents').attr("rows", 27);
		}
	} else {
		$("#card-type").val("");

		$("#card-title").val("");
		$("#card-title-size").val("");
		$("#card-subtitle").val("");
		$("#card-color").val("").change();
		$("#card-icon").val("");
		$("#card-icon-back").val("");
		$("#card-background").val("");
		$("#card-description").val("");
		$("#card-contents").val("");
		$("#card-tags").val("");
		$("#card-reference").val("");
		$("#card-compact").prop("checked", false);

		$(".creature-only").hide();
		$(".item-only").hide();
		$(".spell-only").hide();
		$(".power-only").hide();
	}

	if (g_card_data.length > 0) {
		var cardsList = $("#cards-list");
		if ((g_previousCardIdx || g_previousCardIdx == 0) && g_previousCardIdx < g_card_data.length) {
			var oldCard = g_card_data[g_previousCardIdx];
			cardsList[0].children[g_previousCardIdx].style.backgroundColor = oldCard.color ? oldCard.color + "33" : "";
			cardsList[0].children[g_previousCardIdx].classList.remove("selected");
		}
		var cardScrollHeight = cardsList[0].children[g_ui.selectedCardIdx].scrollHeight;
		var scrollPos = g_ui.selectedCardIdx * cardScrollHeight;
		if (scrollPos < cardsList[0].scrollTop + cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardScrollHeight;
		else if (scrollPos >= cardsList[0].scrollTop + cardsList[0].offsetHeight - 2 * cardScrollHeight)
			cardsList[0].scrollTop = scrollPos - cardsList[0].offsetHeight + 2 * cardScrollHeight;
		cardsList[0].children[g_ui.selectedCardIdx].classList.add("selected");
	}

	g_dontRenderSelectedCard = false;
	ui_render_selected_card();
}

function ui_render_selected_card() {
	if (g_dontRenderSelectedCard)
		return;
	var card = ui_selected_card();
	$('#preview-container').empty();
	if (card) {
		card_update(card);

		var front = card_generate_front(card, g_card_options);
		var back = card_generate_back(card, g_card_options);
		$('#preview-container').html(front + "\n" + back);
	}
	local_store_cards_save();
}


function ui_update_card_color_selector(color, input, selector) {
	if ($(selector + " option[value='" + color + "']").length > 0) {
		// Update the color selector to the entered value
		$(selector).colorselector('setColor', color);
	} else {
		ui_set_card_color(color);
		input.val(color);
	}
}

function ui_set_default_color(color) {
	g_card_options.default.color = color;
	ui_render_selected_card();
}

function ui_set_foreground_color(color) {
	g_card_options.foreground_color = color;
}

function ui_set_background_color(color) {
	g_card_options.background_color = color;
}

function ui_set_card_color(value) {
	var card = ui_selected_card();
	if (card) {
		if (value)
			card.color = value;
		else
			card.color = g_card_options.default.color;
		if (g_ui.selectedCardIdx || g_ui.selectedCardIdx == 0)
			$("#cards-list")[0].children[g_ui.selectedCardIdx].style.backgroundColor = card.color + "33";
		ui_render_selected_card();
	}
}

function ui_change_card_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#card_color_selector");
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
	g_card_options[property] = value;
	ui_render_selected_card();
}

function ui_change_card_count_decrease() {
	var idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	var card = g_card_data[idx];
	if (!card.count || card.count == 0)
		card.count = 0;
	else
		card.count--;
	if (card.count == 0)
		$(this)[0].disabled = true;
	var cardCount = $(this)[0].parentElement.children[1];
	cardCount.innerText = card.count;
	local_store_cards_save();
}

function ui_change_card_count_increase() {
	var idx = $(this)[0].parentElement.parentElement.attributes.index.value;
	var card = g_card_data[idx];
	if (!card.count)
		card.count = 2;
	else
		card.count++;
	$(this)[0].parentElement.children[0].disabled = false;
	var cardCount = $(this)[0].parentElement.children[1];
	cardCount.innerText = card.count;
	local_store_cards_save();
}

function ui_change_card_title() {
	var title = $("#card-title").val();
	var card = ui_selected_card();
	if (card) {
		card.title = title;
		if (g_ui.selectedCardIdx || g_ui.selectedCardIdx == 0)
			$("#cards-list")[0].children[g_ui.selectedCardIdx].children[0].innerText = title;
		ui_render_selected_card();
	}
}

function ui_change_card_property() {
	var property = $(this).attr("data-property");
	var value;
	if ($(this).attr('type') === 'checkbox')
		value = $(this).is(':checked');
	else
		value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		card[property] = value;
		ui_render_selected_card();
	}
}

function ui_change_creature_stats() {
	var property = $(this).attr("data-property");
	var value = $(this).val();
	var card = ui_selected_card();
	if (card) {
		card.stats[property] = value;
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

function ui_change_card_contents() {
	var value = $(this).val();

	var card = ui_selected_card();
	if (card) {
		card.contents = value.replace(/ /g, " ").replace(/ +/g, " ").split("\n");
		ui_render_selected_card();
	}
}

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

function ui_change_card_element_keyup() {
	clearTimeout(ui_change_card_element_keyup.timeout);
	ui_change_card_element_keyup.timeout = setTimeout(function (element) {
		$(element).trigger('change');
	}, 200, this);
}
ui_change_card_element_keyup.timeout = null;


function ui_change_default_color() {
	var input = $(this);
	var color = input.val();

	ui_update_card_color_selector(color, input, "#default_color_selector");
}

function ui_change_default_icon() {
	var value = $(this).val();
	g_card_options.default.icon = value;
	ui_render_selected_card();
}

function ui_change_default_title_size() {
	g_card_options.default.title_size = $(this).val();
	$("#card-title-size")[0].options[0].innerText = "default (" + g_card_options.default.title_size + "pt)";
	ui_render_selected_card();
}

function ui_change_default_icon_size() {
	g_card_options.icon_inline = $(this).is(':checked');
	ui_render_selected_card();
}

function ui_apply_default_color() {
	for (var i = 0; i < g_card_data.length; ++i) {
		if (!g_card_data[i].cardType)
			g_card_data[i].color = g_card_options.default.color;
	}
	ui_render_selected_card();
}

function ui_apply_default_icon() {
	for (var i = 0; i < g_card_data.length; ++i) {
		g_card_data[i].icon = g_card_options.default.icon;
	}
	ui_render_selected_card();
}

function ui_apply_default_icon_back() {
	for (var i = 0; i < g_card_data.length; ++i) {
		g_card_data[i].icon_back = g_card_options.default.icon;
	}
	ui_render_selected_card();
}


function ui_card_list_select_card() {
	var idx = $(this).parent().attr("index");
	ui_select_card_by_index(parseInt(idx));
}

function ui_card_list_up() {
	var cardIdx = g_ui.selectedCardIdx;
	if (cardIdx > 0) {
		var old_card = ui_selected_card();
		g_card_data[cardIdx] = g_card_data[cardIdx - 1];
		g_card_data[cardIdx - 1] = old_card;
		ui_update_card_list(true);
		ui_select_card_by_index(cardIdx - 1);
	}
}

function ui_card_list_down() {
	var cardIdx = g_ui.selectedCardIdx;
	if (cardIdx < g_card_data.length - 1) {
		var old_card = ui_selected_card();
		g_card_data[cardIdx] = g_card_data[cardIdx + 1];
		g_card_data[cardIdx + 1] = old_card;
		ui_update_card_list(true);
		ui_select_card_by_index(cardIdx + 1);
	}
}

function ui_card_list_insert_lexical() {
	var cardIdx = g_ui.selectedCardIdx;
	if (cardIdx >= g_card_data.length - 1 || cardIdx < 0)
		cardIdx = 0;

	var cardLexicals = card_create_lexicals();
	g_card_data = cardLexicals.concat(g_card_data);

	ui_update_card_list(true);
	ui_select_card_by_index(cardIdx + cardLexicals.length);
}


//Adding support for local store
function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return e instanceof DOMException && (
			// everything except Firefox
			e.code === 22 ||
			// Firefox
			e.code === 1014 ||
			// test name field too, because code might not be present
			// everything except Firefox
			e.name === 'QuotaExceededError' ||
			// Firefox
			e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage.length !== 0;
	}
}
function local_store_cards_save() {
	if (storageAvailable('localStorage') && window.localStorage) {
		try {
			localStorage.setItem("card_data", JSON.stringify(g_card_data));
		} catch (e) {
			//if the local store save failed should we notify the user that the data is not being saved?
			console.log(e);
		}
	}
}
function local_store_cards_load() {
	if (storageAvailable('localStorage') && window.localStorage) {
		try {
			g_card_data = JSON.parse(localStorage.getItem("card_data")) || g_card_data;
			for (var i in g_card_data) {
				var card;
				if (g_card_data[i].cardType == CardType.CREATURE)
					card = new CreatureCard();
				else if (g_card_data[i].cardType == CardType.ITEM)
					card = new ItemCard();
				else if (g_card_data[i].cardType == CardType.SPELL)
					card = new SpellCard();
				else if (g_card_data[i].cardType == CardType.POWER)
					card = new PowerCard();
				else
					card = new Card();
				Object.assign(card, g_card_data[i]);
				g_card_data[i] = card;
			}
		} catch (e) {
			//if the local store load failed should we notify the user that the data load failed?
			console.log(e);
		}
	}
}
function local_store_ui_save() {
	if (storageAvailable('localStorage') && window.localStorage) {
		try {
			localStorage.setItem("ui", JSON.stringify(g_ui));
		} catch (e) {
			//if the local store save failed should we notify the user that the data is not being saved?
			console.log(e);
		}
	}
}
function local_store_ui_load() {
	if (storageAvailable('localStorage') && window.localStorage) {
		try {
			g_ui = JSON.parse(localStorage.getItem("ui")) || g_ui;
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

function typeahead_contents_matcher(item) {
	var selectionStart = this.$element[0].selectionStart;
	var textBefore = this.query.substring(0, selectionStart);
	var lastSpaceIdx = textBefore.search(/\n[^\W]*$/);
	var newWord = textBefore.substring(lastSpaceIdx + 1);
	if (newWord == "")
		return false;
	return item.startsWith(newWord);
}

function typeahead_updater(item) {
	var lastSpaceIdx = this.query.lastIndexOf(" ");
	if (lastSpaceIdx > 0)
		return this.query.substring(0, lastSpaceIdx) + " " + item;
	return item;
}

function typeahead_contents_updater(item) {
	var selectionStart = this.$element[0].selectionStart;
	var textBefore = this.query.substring(0, selectionStart);
	var lastSpaceIdx = textBefore.search(/\W[^\W]*$/);
	textBefore = textBefore.substring(0, lastSpaceIdx + 1);

	this.$element[0].selectionStart = (textBefore + item).length;
	this.$element[0].selectionEnd = this.$element[0].selectionStart;

	var textAfter = this.query.slice(selectionStart);
	return textBefore + item + ' | ' + textAfter;
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


function ui_setup_shortcut() {
	$(document).keydown(function (e) {
		if (e.which == 33) { // Pg up
			if (e.preventDefault)
				e.preventDefault();
			var idx = g_ui.selectedCardIdx;
			if (idx > 0)
				ui_select_card_by_index(idx - 1);
			e.returnValue = false;
		} else if (e.which == 34) { // Pg down
			if (e.preventDefault)
				e.preventDefault();
			var idx = g_ui.selectedCardIdx;
			if (idx < g_card_data.length - 1)
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

function ui_update_cards_list_height() {
	var cardsListParents = $('#cards-list').parents();
	var top = $('#cards-list').position().top;

	for (var i = 0; i < cardsListParents.length; i++)
		top += $(cardsListParents[i]).position().top;

	$('#cards-list').css("height", ($(window).height() - top) + 'px');
}

function ui_fold_section() {
	var shouldSave = '';

	if (g_isSmallLayout) {
		var foldedContainer = $('#' + $(this).attr('for'));
		var sideName = '';
		if ($(this).hasClass('btn-fold-section-right')) {
			sideName = 'right';
		} else {
			sideName = 'left';
		}
		var cssSideInt = parseInt(foldedContainer.css(sideName));
		if (cssSideInt < 0) {
			foldedContainer.css(sideName, '0px');
			$(this).css(sideName, parseInt(foldedContainer.css('width')) - parseInt($(this).css('width')) + 'px');
		} else {
			foldedContainer.css(sideName, '-' + foldedContainer.css('width'));
			$(this).css(sideName, '0px');
		}
	} else {
		var cardFormWrapper = $('#card-form-container-wrapper');
		var cardFormContainer = $('#card-form-container');
		var cardFormContainerClass = cardFormWrapper[0].classList.value;
		var cardFormContainerLGIdx = cardFormContainerClass.indexOf('col-lg-') + 7;
		cardFormContainerClass = parseInt(cardFormContainerClass.substring(cardFormContainerLGIdx, cardFormContainerLGIdx + 2));

		var foldedContainer = $('#' + $(this).attr('for'));
		var foldedContainerClass = foldedContainer[0].classList.value;
		var foldedContainerLGIdx = foldedContainerClass.indexOf('col-lg-') + 7;
		foldedContainerClass = parseInt(foldedContainerClass.substring(foldedContainerLGIdx, foldedContainerLGIdx + 2));

		var foldedContainerDisplay = foldedContainer.css('display');

		var buttonSpaceWidth = parseInt($(this).css('width'));

		var buttonIncreasedWidth = 8;
		if (foldedContainerDisplay !== 'none') {
			shouldSave = !g_ui.foldedSections[foldedContainer.selector];
			g_ui.foldedSections[foldedContainer.selector] = '#' + this.id;
			foldedContainer.hide();

			buttonSpaceWidth += buttonIncreasedWidth;
			$(this).css('width', buttonSpaceWidth + 'px');

			if (parseInt($(this).css('margin-right')) < 0) {
				cardFormContainer.css('padding-right', (parseInt(cardFormContainer.css('padding-right')) + buttonSpaceWidth) + 'px');
				$(this).css('margin', '0px 0px 0px ' + (-buttonSpaceWidth - 1) + 'px');
			} else {
				cardFormContainer.css('padding-left', (parseInt(cardFormContainer.css('padding-left')) + buttonSpaceWidth) + 'px');
				$(this).css('margin', '0px ' + (-buttonSpaceWidth - 1) + 'px 0px 0px');
			}

			cardFormWrapper.toggleClass('col-lg-' + cardFormContainerClass + ' col-lg-' + (cardFormContainerClass + foldedContainerClass));
		} else {
			shouldSave = g_ui.foldedSections[foldedContainer.selector];
			g_ui.foldedSections[foldedContainer.selector] = null;
			foldedContainer.show();

			if (parseInt($(this).css('margin-right')) >= 0)
				cardFormContainer.css('padding-right', '');
			else
				cardFormContainer.css('padding-left', '');

			$(this).css('margin', '');

			buttonSpaceWidth -= buttonIncreasedWidth;
			$(this).css('width', buttonSpaceWidth + 'px');

			cardFormWrapper.toggleClass('col-lg-' + cardFormContainerClass + ' col-lg-' + (cardFormContainerClass - foldedContainerClass));
		}

		$(this).toggleClass('btn-fold-section-right btn-fold-section-left');
	}

	if (shouldSave)
		local_store_ui_save();
}

function ui_small_layout_fold_all_sections(e) {
	if (e && e.isDefaultPrevented())
		return;
	var foldMenuButton = $('#button-fold-menu');
	if (parseInt(foldMenuButton.css('left')) > 0) {
		foldMenuButton.click();
	}
	var foldPreviewButton = $('#button-fold-preview');
	if (parseInt(foldPreviewButton.css('right')) > 0) {
		foldPreviewButton.click();
	}
}

function ui_fold_block() {
	var button = $('#' + this.id);

	var foldedBlock = $('#' + $(this).attr('for'));
	var display = foldedBlock.css('display');
	var shouldSave = '';
	if (display !== 'none') {
		shouldSave = !g_ui.foldedBlocks[foldedBlock.selector];
		g_ui.foldedBlocks[foldedBlock.selector] = button.selector;
		foldedBlock.hide();
		var buttonsPoints = button[0].children[0].children[0].points;
		buttonsPoints[0].x = 0;
		buttonsPoints[0].y = 0;
		buttonsPoints[1].x = 100;
		buttonsPoints[1].y = 50;
		buttonsPoints[2].x = 0;
		buttonsPoints[2].y = 100;
	} else {
		shouldSave = g_ui.foldedBlocks[foldedBlock.selector];
		g_ui.foldedBlocks[foldedBlock.selector] = null;
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

	ui_update_cards_list_height();
}

function clean_style(styleObj) {
	for (var i = styleObj.length; i--;) {
		var nameString = styleObj[i];
		styleObj.removeProperty(nameString);
	}
}

var g_isSmallLayout;
$(document).ready(function () {

	var preventPageDownOrUp = function (e) {
		if (e.which == 33 || e.which == 34) { // Pg up or down
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
	};
	ui_setup_shortcut();

	g_isSmallLayout = $('html').width() < 1200;
	$(window).resize(function (e) {
		var isSmallLayout = $('html').width() < 1200;
		if (isSmallLayout) {
			var foldedSectionsKeys = Object.keys(g_ui.foldedSections);
			if (isSmallLayout != g_isSmallLayout) {
				for (var i = 0; i < foldedSectionsKeys.length; i++) {
					if (g_ui.foldedSections[foldedSectionsKeys[i]])
						$(g_ui.foldedSections[foldedSectionsKeys[i]]).click();
				}
			}
			for (var i = 0; i < foldedSectionsKeys.length; i++) {
				g_ui.foldedSections[foldedSectionsKeys[i]] = null;
			}

			$('#menu-container-wrapper').click(function (e) {
				if (e.preventDefault)
					e.preventDefault();
			});
			$('#preview-container-wrapper').click(function (e) {
				if (e.preventDefault)
					e.preventDefault();
			});
			$('.container-wrapper').click(ui_small_layout_fold_all_sections);
		} else {
			$('#menu-container-wrapper').click(null);
			$('#preview-container-wrapper').click(null);
			$('.container-wrapper').click(null);
		}

		if (g_isSmallLayout != isSmallLayout) {
			clean_style($('#button-fold-menu')[0].style);
			clean_style($('#menu-container-wrapper')[0].style);
			clean_style($('#button-fold-preview')[0].style);
			clean_style($('#preview-container-wrapper')[0].style);
			g_isSmallLayout = isSmallLayout;
		}

		$('body').children(0).children(0).css('height', $(window).height() + 'px');
		$('.container-wrapper').css('height', $(window).height() + 'px');
		$('.btn-fold-section').css('height', $(window).height() + 'px');
		ui_update_cards_list_height();
	});


	local_store_cards_load();
	local_store_ui_load();

	if (g_ui.selectedCardIdx >= g_card_data.length)
		g_ui.selectedCardIdx = g_card_data.length - 1;

	$(".btn-fold-section").click(ui_fold_section);
	var isSmallLayout = $('html').width() < 1200;
	var foldedSectionsKeys = Object.keys(g_ui.foldedSections);
	if (isSmallLayout) {
		for (var i = 0; i < foldedSectionsKeys.length; i++) {
			g_ui.foldedSections[foldedSectionsKeys[i]] = null;
		}
	} else {
		for (var i = 0; i < foldedSectionsKeys.length; i++) {
			if (g_ui.foldedSections[foldedSectionsKeys[i]])
				$(g_ui.foldedSections[foldedSectionsKeys[i]]).click();
		}
	}

	$(".btn-fold-block").click(ui_fold_block);
	var foldedBlockKeys = Object.keys(g_ui.foldedBlocks);
	for (var i = 0; i < foldedBlockKeys.length; i++) {
		if (g_ui.foldedBlocks[foldedBlockKeys[i]])
			$(g_ui.foldedBlocks[foldedBlockKeys[i]]).click();
	}

	ui_setup_color_selector();
	$(".icon-list").typeahead({
		source: icon_names,
		items: 'all',
		render: typeahead_icon_render
	});
	$(".icon-list").keydown(preventPageDownOrUp);
	$(".icon-select-button").click(function () { window.open("http://game-icons.net/", "_blank"); });

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

	if (g_ui.filename)
		$("#file-name").html('<b>File:</b> ' + g_ui.filename.join(", ") + '<br/><b>Last save:</b> ' + g_ui.saveTime);

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
	$("#button-insert-lexical").click(ui_card_list_insert_lexical);

	// ----- Card

	$("#button-add-card").click(ui_add_new_card);
	$("#button-duplicate-card").click(ui_duplicate_card);
	$("#button-delete-card").click(ui_delete_card);

	$("#card-title").keyup(ui_change_card_element_keyup);
	$("#card-title").change(ui_change_card_title);
	$("#card-title-size")[0].options[0].innerText = "default (" + g_card_options.default.title_size + "pt)";
	$("#card-title-size").change(ui_change_card_property);
	$("#card-subtitle").change(ui_change_card_property);
	$("#card-icon").change(ui_change_card_property);
	$("#card-icon-back").change(ui_change_card_property);
	$("#card-background").change(ui_change_card_property);
	$("#card-color").change(ui_change_card_color);
	$("#card-tags").change(ui_change_card_tags);
	$("#card-reference").keyup(ui_change_card_element_keyup);
	$("#card-reference").change(ui_change_card_property);

	$("#card-description").keyup(ui_change_card_element_keyup);
	$("#card-description").change(ui_change_card_description);
	/* $("#card-contents").typeahead({
		source: Object.keys(card_element_generators),
		items: 'all',
		minLength: 0,
		matcher: typeahead_contents_matcher,
		updater: typeahead_contents_updater,
		render: typeahead_render
	}); */
	$("#card-contents").keyup(ui_change_card_element_keyup);
	$("#card-contents").change(ui_change_card_contents);
	$("#card-contents").keydown(function (e) {
		if (e.shiftKey && e.key == "Delete") {
			var value = $(this)[0].value;

			var textBefore = value.slice(0, $(this)[0].selectionStart);
			var idxLineFirstChar = textBefore.lastIndexOf('\n');
			if (idxLineFirstChar == -1) {
				idxLineFirstChar = 0;
				textBefore = '';
			} else
				textBefore = textBefore.slice(0, idxLineFirstChar);

			var textAfter = value.slice($(this)[0].selectionEnd);
			var idxLineLastChar = textAfter.indexOf('\n');
			if (idxLineLastChar == -1)
				textAfter = '';
			else
				textAfter = textAfter.slice(idxLineLastChar);

			$(this)[0].value = textBefore + textAfter;
			$(this)[0].selectionStart = idxLineFirstChar;
			$(this)[0].selectionEnd = $(this)[0].selectionStart;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
		if (e.altKey) {
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
		}
	});

	$("#card-compact").change(ui_change_card_compact);

	// ----- Creature

	$("#card-creature-cr").change(ui_change_card_property);
	$("#card-creature-size").change(ui_change_card_property);
	$("#card-creature-alignment").typeahead({
		source: Object.values(I18N.ALIGNMENTS),
		items: 'all',
		minLength: 0,
		render: typeahead_render
	});
	$("#card-creature-alignment").keydown(preventPageDownOrUp);
	$("#card-creature-alignment").change(ui_change_card_property);
	$("#card-creature-type").change(ui_change_card_property);

	$("#card-creature-ac").change(ui_change_card_property);
	$("#card-creature-hp").change(ui_change_card_property);
	$("#card-creature-perception").change(ui_change_card_property);
	$("#card-creature-speed").change(ui_change_card_property);

	$("#card-creature-strength").change(ui_change_creature_stats);
	$("#card-creature-dexterity").change(ui_change_creature_stats);
	$("#card-creature-constitution").change(ui_change_creature_stats);
	$("#card-creature-intelligence").change(ui_change_creature_stats);
	$("#card-creature-wisdom").change(ui_change_creature_stats);
	$("#card-creature-charisma").change(ui_change_creature_stats);

	$("#card-creature-resistances").change(ui_change_card_property);
	$("#card-creature-vulnerabilities").change(ui_change_card_property);
	$("#card-creature-immunities").change(ui_change_card_property);

	// ----- Spell

	$("#card-spell-level").change(ui_change_card_property);
	$("#card-spell-ritual").change(ui_change_card_property);
	$("#card-spell-casting-time").change(ui_change_card_property);
	$("#card-spell-casting-time").keyup(ui_change_card_element_keyup);
	$("#card-spell-range").change(ui_change_card_property);
	$("#card-spell-range").keyup(ui_change_card_element_keyup);
	$("#card-spell-verbal").change(ui_change_card_property);
	$("#card-spell-somatic").change(ui_change_card_property);
	$("#card-spell-materials").change(ui_change_card_property);
	$("#card-spell-duration").change(ui_change_card_property);
	$("#card-spell-duration").keyup(ui_change_card_element_keyup);
	$("#card-spell-type").typeahead({
		source: Object.values(I18N.SPELL_TYPES),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$("#card-spell-type").keydown(preventPageDownOrUp);
	$("#card-spell-type").change(ui_change_card_property);
	$("#card-spell-classes").typeahead({
		source: Object.values(I18N.CLASSES),
		items: 'all',
		minLength: 0,
		matcher: typeahead_matcher,
		updater: typeahead_updater,
		render: typeahead_render
	});
	$("#card-spell-classes").keydown(preventPageDownOrUp);
	$("#card-spell-classes").change(ui_change_card_property);

	ui_update_card_list();


	$(window).resize();
});
