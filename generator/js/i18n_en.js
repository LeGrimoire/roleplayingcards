// (?: ?=.)? to remove space if not in front of a dot
// [ ]? to remove a space

export const I18N = {
	CLASSES: {
		BARBARIAN: 'Barbarian',
		BARD: 'Bard',
		CLERIC: 'Cleric',
		DRUID: 'Druid',
		FIGHTER: 'Fighter',
		MONK: 'Monk',
		PALADIN: 'Paladin',
		RANGER: 'Ranger',
		ROGUE: 'Rogue',
		SORCERER: 'Sorcerer',
		WARLOCK: 'Warlock',
		WIZARD: 'Wizard',
		SCHOLAR: 'Scholar'
	},

	CREATURE: {
		CR: 'CR',
		AC: 'AC',
		HP: 'HP',
		PERCEPTION: 'Perception',
		SPEED: 'Speed',
		RESISTANCES: 'Resistances',
		VULNERABILITIES: 'Vulnerabilities',
		IMMUNITIES: 'Immunities',

		STRENGTH: 'STR',
		DEXTERITY: 'DEX',
		CONSTITUTION: 'CON',
		INTELLIGENCE: 'INT',
		WISDOM: 'WIS',
		CHARISMA: 'CHA',

		ALIGNMENTS: {
			UNALIGNED: 'Unaligned',
			ANY_ALIGNMENT: 'Any alignement',
			GOOD: 'Good',
			BAD: 'Bad',
			NEUTRAL: 'Neutral',
			NEUTRAL_GOOD: 'Neutral good',
			NEUTRAL_EVIL: 'Neutral bad',
			CHAOTIC: 'Chaotic',
			CHAOTIC_NEUTRAL: 'Chaotic neutral',
			CHAOTIC_GOOD: 'Chaotic good',
			CHAOTIC_EVIL: 'Chaotic bad',
			LOYAL: 'Loyal',
			LOYAL_NEUTRAL: 'Loyal neutral',
			LOYAL_GOOD: 'Loyal good',
			LOYAL_EVIL: 'Loyal bad'
		}
	},

	SPELL: {
		LEVEL: 'Level',
		CASTING_TIME: 'Casting time',
		RANGE: 'Range',
		DURATION: 'Duration',
		RITUAL: 'Ritual',
		MATERIALS: 'Materials',
		VERBAL: 'Verbal',
		SOMATIC: 'Somatic',

		SPELL_TYPES: {
			CONJURATION: 'Conjuration',
			DIVINATION: 'Divination',
			ENCHANTMENT: 'Enchantment',
			EVOCATION: 'Evocation',
			ILLUSION: 'Illusion',
			NECROMANCY: 'Necromancy',
			SUMMONING: 'Summoning',
			TRANSMUTATION: 'Transmutation'
		},

		AT_HIGHER_LEVELS: 'At higher levels'
	},

	DAMAGE_TYPES: [
		{
			file: 'physical_not_magical', name: 'physical not magical',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}physical[s]? not magical[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'bludgeoning', name: 'bludgeoning',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}bludgeoning[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'piercing', name: 'piercing',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}piercing[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'slashing', name: 'slashing',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}slashing[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'fire', name: 'fire',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}fire[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'ice', name: 'ice',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}ice[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'lightning', name: 'lightning',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}lightning[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'acid', name: 'acid',
			regex: new RegExp('(?:([ ([0-9]| |[\'’])|^){1}acid[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'poison', name: 'poison',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}poison[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'necrotic', name: 'necrotic',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}necrotic[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'thunder', name: 'thunder',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}thunder[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'force', name: 'force',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}force[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'psychic', name: 'psychic',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}psychic[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'radiant', name: 'radiant',
			regex: new RegExp('(?:([ ([0-9]| )|^){1}radiant[s]?([^a-zA-Z]{1}|$)', 'gi')
		}
	],
	CONDITION: [
		{
			file: 'blinded', name: 'blinded',
			regex: new RegExp('([ ([>\']|^){1}blinded([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'charmed', name: 'charmed',
			regex: new RegExp('([ ([>]|^){1}charmed([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'deafened', name: 'deafened',
			regex: new RegExp('([ ([>\']|^){1}deafened([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'exhaustion', name: 'exhaustion',
			regex: new RegExp('([ ([>\']|^){1}exhaustion([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'frightened', name: 'frightened',
			regex: new RegExp('([ ([>\']|^){1}frightened([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'grappled', name: 'grappled',
			regex: new RegExp('([ ([>\']|^){1}grappled([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'incapacitated', name: 'incapacitated',
			regex: new RegExp('([ ([>]|^){1}incapacitated([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'invisible', name: 'invisible',
			regex: new RegExp('([ ([>\']|^){1}invisible[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'paralyzed', name: 'paralyzed',
			regex: new RegExp('([ ([>]|^){1}paralyzed([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'petrified', name: 'petrified',
			regex: new RegExp('([ ([>]|^){1}petrified([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'poisoned', name: 'poisoned',
			regex: new RegExp('([ ([>\']|^){1}poisoned([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'prone', name: 'prone',
			regex: new RegExp('([ ([>]|^){1}prone[s]?([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'restrained', name: 'restrained',
			regex: new RegExp('([ ([>\']|^){1}restrained([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'stunned', name: 'stunned',
			regex: new RegExp('([ ([>\']|^){1}stunned([^a-zA-Z]{1}|$)', 'gi')
		}, {
			file: 'unconscious', name: 'unconscious',
			regex: new RegExp('([ ([>\']|^){1}unconscious([^a-zA-Z]{1}|$)', 'gi')
		}
	],

	FAIL: 'Fail',
	SUCCESS: 'Success',

	CUSTOM_ICONS: [
		{
			file: 'creature', name: 'creature',
			regex: new RegExp('(?:([([>])|^| ){1}creature[s]?[ ]?([^a-zA-Z]?|$)', 'gi')
		}, {
			file: 'ac', name: 'AC',
			regex: new RegExp('(?:([ ([>0-9])|^){1}AC([^a-zA-Z]|$)', 'gi')
		}, {
			file: 'hp', name: 'HP',
			regex: new RegExp('(?:([ ([>0-9])|^){1}HP[s]?([^a-zA-Z]|$)', 'gi')
		}, {
			file: 'gp', name: 'gp',
			regex: new RegExp('(?:([([>])|^| ){1}gp[s]?([^a-zA-Z]|$)', 'gi')
		}, {
			file: 'action_bonus', name: 'bonus action',
			regex: new RegExp('(?:([ ([>])|^){1}bonus action[s]?(?: ?=.)?([^a-zA-Z]?|$)', 'gi')
		}, {
			file: 'action', name: 'action',
			regex: new RegExp('(?:([ ([>])|^){1}action[s]?(?: ?=.)?([^a-zA-Z]?|$)', 'gi')
		}
	],

	ABREVIATIONS: [
		{
			name: 'AC', meaning: 'Armor Class',
			regex: new RegExp('((?:[([>])|^| ){1}(AC)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'HP', meaning: 'Hit Points',
			regex: new RegExp('((?:[([>])|^| ){1}(HP)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'PP', meaning: 'Passive Perception',
			regex: new RegExp('((?:[([>])|^| ){1}(PP)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'MC', meaning: 'Magical Caracteristic',
			regex: new RegExp('((?:[([>])|^| ){1}(MC)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'av', meaning: 'Advantage (on 2d20, keep the best)',
			regex: new RegExp('((?:[([>])|^| ){1}(av)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'dav', meaning: 'Disadvantage (sur 2d20, keep the worst)',
			regex: new RegExp('((?:[([>])|^| ){1}(dav)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'CR', meaning: 'Challenge rating',
			regex: new RegExp('((?:[([>])|^| ){1}(CR)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}, {
			name: 'DC', meaning: 'Difficulty Class',
			regex: new RegExp('((?:[([>])|^| ){1}(DC)[ ]?([^a-zA-Z]{1}|$)', 'g')
		}
	],

	COMMON_RULES: [
		{
			name: 'Obstacles', meaning: 'The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.',
			regex: new RegExp('((?:[([>\'])|^| ){1}(obstacles)[ ]?([^a-zA-Z]{1}|$)', 'gi')
		}
	],

	PICTO: 'Picto',
	ABREVIATIONS_TITLE: 'Lexical',
	COMMON_RULES_TITLE: 'Common rules',

	UI: {
		HELP: 'Help',
		ICONS: 'Icons',
		LANGUAGE: 'Language',
		SORT: 'Sort',
		FILTER: 'Filter',
		SAMPLE: 'Add sample',
		LEXICAL: 'Ins. lexical',
		CLEAR: 'Delete all',
		IMPORT: 'Import file',
		SAVE: 'Save to file',
		GENERATE: 'Generate',
		FILE: 'File',
		DECK_SETTINGS: 'Deck settings',
		PAGE: 'Page',
		CARDS_PAGE: 'Cards/page',
		ROWS: 'Row',
		COLUMNS: 'Col',
		CARD: 'Card',
		CARDS: 'Cards',
		DOUBLESIDED: 'Double sided',
		FRONT_ONLY: 'Front only',
		SIDE_BY_SIDE: 'Side by side',
		ROUND_CORNERS: 'Round corners',
		SMALL_ICONS: 'Small icons',
		SPELL_CLASSES: 'Spell classes',
		DEFAULT_VALUES: 'Default values',
		GENERIC: 'Generic',
		CREATURE: 'Creature',
		ITEM: 'Item',
		SPELL: 'Spell',
		POWER: 'Power',
		CONTENT: 'Content',
		FRONT: 'Front',
		BACK: 'Back',
		COLOR: 'Color',
		ICON_NAME: 'Icon name',
		UNIQUE: 'unique',
		DELETE: 'Delete',
		COPY: 'Copy',
		NEW: 'New',
		TITLE: 'Title',
		MULTILINE: 'on 2 lines',
		SUBTITLE: 'Subtitle',
		FRONT_ICON: 'Front icon',
		DEFAULT: 'Default',
		BACK_ICON: 'Back icon',
		SAME_AS_FRONT: 'Same as front',
		BACKGROUND: 'Background',
		BACK_DESCRIPTION: 'Back description',
		SIZE: 'Size',
		ALIGNMENT: 'Alignment',
		TYPE: 'Type',
		CONTENTS: 'Contents',
		CLASSES: 'Classes',
		TAGS: 'Tags',
		REFERENCE: 'Reference',
		COMPACT: 'Compact'
	}
};
