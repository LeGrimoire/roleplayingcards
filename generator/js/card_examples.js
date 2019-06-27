
import { Card } from './card.js';
import { ItemCard } from './card_item.js';
import { PowerCard } from './card_power.js';
import { SpellCard } from './card_spell.js';
import { CreatureCard } from './card_creature.js';

/**
 * @return {Card[]}
 */
export function CardExamples() {
	let cards = [];

	let card = new Card();
	card.title = 'All';
	card.contents = [
		'comment | icon | name | size | align',
		'icon | oak-leaf | 15 | right',
		'line | 1',
		'comment | picture | url | height',
		'picture | ./img/3d-hammer.png | 15',
		'ruler',
		'fill | 1',
		'comment | boxes | (count) | (size) | (dashed) | (center)',
		'boxes | 5 | 1.5 | true | true',
		'fill | 2',
		'property | property | Texte sans indentation',
		'description | Texte d\'appoint',
		'Texte à gauche; feu',
		'right | Texte à droite; feu | false',
		'center | Texte centré; feu',
		'justify | Texte justifié',
		'section | section',
		'bullet | bullet',
		'table_header | titre1 | titre 2 | | titre 4',
		'table_line | item1 | | item 3 | item 4'
	];
	card.count = 1;
	cards.push(card);

	let creature = new CreatureCard();
	creature.title = 'Creature';
	creature.type = 'Type';
	creature.cr = '1/2';
	creature.size = 'M';
	creature.alignment = 'Sans alignement';
	creature.ac = '10';
	creature.hp = '3 (1d6)';
	creature.perception = '10';
	creature.speed = '9 m';
	creature.stats = ['10', '10', '10S', '10M', '10', '10'];
	creature.contents = [
		'description | Is proficient in Con saving throw and the magic caracteristic is Int as shown by the icons above.',
		'comment | spells | (level) | ability | spells-0 | spell-1-nb | spells-1 | ... | text',
		'spells | 5 | DD 12, +2 | spells | 5 | spells | | | 2 | spells | text',
		'comment | attack | name | hit bonus | damage & text',
		'attack | Attack | +3 | 1d10feu'
	];
	creature.count = 1;
	cards.push(creature);

	let item = new ItemCard();
	item.title = 'Item';
	item.contents = [
	];
	item.count = 1;
	cards.push(item);

	let spell = new SpellCard();
	spell.title = 'Spell';
	spell.type = 'Abjuration';
	spell.level = 1;
	spell.ritual = false;
	spell.casting_time = '1 action';
	spell.range = '18 m';
	spell.verbal = true;
	spell.somatic = false;
	spell.materials = 'Some herbs, crisals, gems and the tracing of a pentagram';
	spell.duration = '1 round';
	spell.classes = 'Barde, Mage, Moine';
	spell.contents = [
	];
	spell.count = 1;
	cards.push(spell);

	let power = new PowerCard();
	power.title = 'Power';
	power.contents = [
	];
	power.count = 1;
	cards.push(power);
	
	cards.push(new Card('SEPARATOR'));

	let goblin = new CreatureCard();
	goblin.title = 'Goblin';
	goblin.type = 'Small humanoid (goblinoid)';
	goblin.cr = '1/4';
	goblin.size = 'M';
	goblin.alignment = 'Neutre bon';
	goblin.ac = '15 (leather armor, shield)';
	goblin.hp = '7 (2d6)';
	goblin.perception = '15';
	goblin.speed = '6 m, vol 15 m';
	goblin.stats = ['8', '14', '10', '10', '8', '8'];
	goblin.contents = [
		'Stealth +6',
		'ruler',
		'property | Nimble escape | Disengage or Hide as bonus action',
		'fill',
		'section | Actions',
		'attack | Scimitar | +4 (5 ft.) | one target. 5 (1d6 + 2) slashing'
	];
	goblin.count = 1;
	cards.push(goblin);

	let fullPlate = new ItemCard();
	fullPlate.title = 'Full Plate';
	fullPlate.subtitle = 'Heavy armor';
	fullPlate.icon = 'breastplate';
	fullPlate.contents = [
		'property | AC | 18',
		'property | Strength required | 15',
		'property | Stealth | Disadvantage',
		'ruler',
		'property | Heavy | Unless you have the required strength, your speed is reduced by 10 feet.',
		'property | Stealth | You have disadvantage on Dexterity (Stealth) checks.'
	];
	fullPlate.count = 1;
	cards.push(fullPlate);

	let dagger = new ItemCard();
	dagger.title = 'Dagger';
	dagger.subtitle = 'Simple melee weapon';
	dagger.icon = 'daggers';
	dagger.contents = [
		'property | Damage | 1d4 piercing',
		'property | Modifier | Strength or Dexterity',
		'property | Properties | Light, Finesse, Thrown (20/60)',
		'ruler',
		'property | Finesse | Use your choice of Strength or Dexterity modifier for attack and damage.',
		'property | Light | When you attack while dual wielding light weapons, you may use a bonus action to attack with your off hand.',
		'property | Thrown | You can throw the weapon to make a ranged attack with the given range.'
	];
	dagger.count = 1;
	cards.push(dagger);

	let wand = new ItemCard();
	wand.title = 'Wand of Magic Missiles';
	wand.subtitle = 'Wondrous item';
	wand.icon = 'crystal-wand';
	wand.contents = [
		'property | Maximum charges | 7',
		'property | Recharge | 1d6+1 each day',
		'property | Depletion | If you expend the last charge, roll a d20. On a 1, the item is destroyed.',
		'ruler',
		'fill | 2',
		'property | Spells | You can use your action to cast the following spells:',
		'bullet | magic missile, 1st level (1 charge)',
		'bullet | magic missile, 2nd level (2 charges)',
		'bullet | magic missile, 3rd level (3 charges)',
		'fill | 3',
		'boxes | 7 | 2 | true'
	];
	wand.count = 1;
	cards.push(wand);

	let potion = new ItemCard();
	potion.title = 'Potion of Healing';
	potion.subtitle = 'Potion';
	potion.icon = 'drink-me';
	potion.contents = [
		'property | Use time | 1 action',
		'property | Hit points restored | 2d4+2',
		'ruler',
		'When you drink this potion, you regain 2d4+2 hp.',
		'Drinking or administering a potion takes 1 action.'
	];
	potion.count = 1;
	cards.push(potion);

	let burningHand = new SpellCard();
	burningHand.title = 'Burning Hands';
	burningHand.subtitle = '1st level evocation';
	burningHand.icon = 'magic-swirl';
	burningHand.icon_back = 'robe';
	burningHand.type = 'Abjuration';
	burningHand.level = 1;
	burningHand.ritual = false;
	burningHand.casting_time = '1 action';
	burningHand.range = 'Self (15ft cone)';
	burningHand.verbal = true;
	burningHand.somatic = true;
	burningHand.materials = '';
	burningHand.duration = '1 round';
	burningHand.classes = '';
	burningHand.contents = [
		'Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes <b>3d6 fire</b> on a failed save, or half as much damage on a successful one.',
		'The fire ignites any flammable objects in the area that aren\'t being worn or carried.'
	];
	burningHand.higherLevels = '+1d6 damage for each slot above 1st';
	burningHand.count = 1;
	cards.push(burningHand);

	let cunningAction = new PowerCard();
	cunningAction.title = 'Cunning Action';
	cunningAction.subtitle = 'Rogue feature';
	cunningAction.color = '#4B0082';
	cunningAction.icon_back = 'cloak-dagger';
	cunningAction.contents = [
		'You can take a <b>bonus action on each of your turns</b> in combat. This action can be used only to take the <b>Dash, Disengage, or Hide</b> action.',
		'fill',
		'section | Fast hands (Thief 3rd)',
		'You can also use the bonus action to make a Dexterity (<b>Sleight of Hand</b>) check, use your thieves\' tools to <b>disarm a trap</b> or <b>open a lock</b>, or take the <b>Use an Object</b> action.'
	];
	cunningAction.count = 1;
	cards.push(cunningAction);

	return cards;
}
