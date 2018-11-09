'use strict'

var I18N = {
	CLASSES: {
		BARBARIAN: "Barbare",
		BARD: "Barde",
		CLERIC: "Clerc",
		DRUID: "Druide",
		FIGHTER: "Guerrier",
		MONK: "Moine",
		PALADIN: "Paladin",
		RANGER: "Rôdeur",
		ROGUE: "Voleur",
		SORCERER: "Ensorceleur",
		WARLOCK: "Sorcier",
		WIZARD: "Mage",
		SCHOLAR: "Lettré"
	},

	AC: "CA",
	HP: "PV",
	PERCEPTION: "Perception",
	SPEED: "VD",
	RESISTANCES: "Résistances",
	VULNERABILITIES: "Vulnérabilités",
	IMMUNITIES: "Immunités",

	STRENGTH: "FOR",
	DEXTERITY: "DEX",
	CONSTITUTION: "CON",
	INTELLIGENCE: "INT",
	WISDOM: "SAG",
	CHARISMA: "CHA",

	ABREVIATIONS: [
		{ name: "JS", meaning: "Jet de sauvegarde" },
		{ name: "JA", meaning: "Jet d'attaque" },
		{ name: "JC", meaning: "Jet de caractéristique" },
		{ name: "CA", meaning: "Classe d'armure" },
		{ name: "VD", meaning: "Vitesse de déplacement" },
		{ name: "PP", meaning: "Perception passive" },
		{ name: "CM", meaning: "Caractéristique magique" },
		{ name: "av", meaning: "Avantage (sur 2d20, garder le meilleur)" },
		{ name: "dav", meaning: "Désavantage (sur 2d20, garder le moins bon)" },
		{ name: "FP", meaning: "Facteur de puissance" }
	],

	ALIGNMENTS: {
		UNALIGNED: "Sans alignement",
		ANY_ALIGNMENT: "Tout alignement",
		GOOD: "Bon",
		BAD: "Mauvais",
		NEUTRAL: "Neutre",
		NEUTRAL_GOOD: "Neutre bon",
		NEUTRAL_EVIL: "Neutre mauvais",
		CHAOTIC: "Chaotique",
		CHAOTIC_NEUTRAL: "Chaotique neutre",
		CHAOTIC_GOOD: "Chaotique bon",
		CHAOTIC_EVIL: "Chaotique mauvais",
		LOYAL: "Loyal",
		LOYAL_NEUTRAL: "Loyal neutre",
		LOYAL_GOOD: "Loyal bon",
		LOYAL_EVIL: "Loyal mauvais"
	},

	DAMAGE_TYPES: [
		{
			file: "physical_not_magical", name: "physique non magique",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?physique[s]? non magique[s]?", 'gi')
		}, {
			file: "bludgeoning", name: "contondant",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?contondant[s]?", 'gi')
		}, {
			file: "piercing", name: "perforant",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?perforant[s]?", 'gi')
		}, {
			file: "slashing", name: "tranchant",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?tranchant[s]?", 'gi')
		}, {
			file: "fire", name: "feu",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?feu[s]?", 'gi')
		}, {
			file: "ice", name: "froid",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?froid[s]?", 'gi')
		}, {
			file: "lightning", name: "foudre",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?foudre[s]?", 'gi')
		}, {
			file: "acid", name: "acide",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?acide[s]?", 'gi')
		}, {
			file: "poison", name: "poison",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?poison[s]?", 'gi')
		}, {
			file: "necrotic", name: "nécrotique",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?nécrotique[s]?", 'gi')
		}, {
			file: "thunder", name: "tonnerre",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?tonnerre[s]?", 'gi')
		}, {
			file: "force", name: "force",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?force[s]?", 'gi')
		}, {
			file: "psychic", name: "psychique",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?psychique[s]?", 'gi')
		}, {
			file: "radiant", name: "radiant",
			regex: new RegExp("([ \(\[0-9]|^){1}[ ]?radiant[s]?", 'gi')
		}
	],
	CONDITION: [
		{
			file: "blinded", name: "aveuglé",
			regex: new RegExp("([ \(\[]|^){1}aveuglé[e]?[s]?", 'gi')
		}, {
			file: "charmed", name: "charmé",
			regex: new RegExp("([ \(\[]|^){1}charmé[e]?[s]?", 'gi')
		}, {
			file: "deafened", name: "assourdi",
			regex: new RegExp("([ \(\[]|^){1}assourdi[e]?[s]?", 'gi')
		}, {
			file: "exhaustion", name: "épuisé",
			regex: new RegExp("([ \(\[]|^){1}épuisé[e]?[s]?", 'gi')
		}, {
			file: "frightened", name: "effrayé",
			regex: new RegExp("([ \(\[]|^){1}effrayé[e]?[s]?", 'gi')
		}, {
			file: "grappled", name: "agrippé",
			regex: new RegExp("([ \(\[]|^){1}agrippé[e]?[s]?", 'gi')
		}, {
			file: "incapacitated", name: "neutralisé",
			regex: new RegExp("([ \(\[]|^){1}neutralisé[e]?[s]?", 'gi')
		}, {
			file: "invisible", name: "invisible",
			regex: new RegExp("([ \(\[]|^){1}invisible[s]?", 'gi')
		}, {
			file: "paralyzed", name: "paralysé",
			regex: new RegExp("([ \(\[]|^){1}paralysé[e]?[s]?", 'gi')
		}, {
			file: "petrified", name: "pétrifié",
			regex: new RegExp("([ \(\[]|^){1}pétrifié[e]?[s]?", 'gi')
		}, {
			file: "poisoned", name: "empoisonné",
			regex: new RegExp("([ \(\[]|^){1}empoisonné[e]?[s]?", 'gi')
		}, {
			file: "prone", name: "à terre",
			regex: new RegExp("([ \(\[]|^){1}à terre[s]?", 'gi')
		}, {
			file: "restrained", name: "entravé",
			regex: new RegExp("([ \(\[]|^){1}entravé[e]?[s]?", 'gi')
		}, {
			file: "stunned", name: "étourdi",
			regex: new RegExp("([ \(\[]|^){1}étourdi[e]?[s]?", 'gi')
		}, {
			file: "unconscious", name: "inconscient",
			regex: new RegExp("([ \(\[]|^){1}inconscient[e]?[s]?", 'gi')
		}
	],
	
	CASTING_TIME: "Incantation",
	RANGE: "Portée",
	DURATION: "Durée",
	RITUAL: "Rituel",

	SPELL_TYPES: {
		CONJURATION: "Abjuration",
		DIVINATION: "Divination",
		ENCHANTMENT: "Enchantement",
		EVOCATION: "Évocation",
		ILLUSION: "Illusion",
		NECROMANCY: "Nécromancie",
		SUMMONING: "Invocation",
		TRANSMUTATION: "Transmutation"
	},

	CUSTOM: [
		{
			file: "creature", name: "créature",
			regex: new RegExp("(?:([\(\[])|^| ){1}cr[ée]ature[s]?[ ]?([^a-zA-Z]?|$)", 'gi')
		},
		{
			file: "timer", name: "prochain tour",
			regex: new RegExp("([ \(\[]|^){1}prochain[s]? tour[s]?([^a-zA-Z]|$)", 'gi')
		},
		{
			file: "ac", name: "ca",
			regex: new RegExp("(?:([\(\[])|^| ){1}CA([^a-zA-Z]|$)", 'gi')
		},
		{
			file: "hp", name: "pv",
			regex: new RegExp("(?:([ \(\[])|^){1}PV[s]?([^a-zA-Z]|$)", 'gi')
		},
		{
			file: "gp", name: "po",
			regex: new RegExp("(?:([\(\[])|^| ){1}po[s]?([^a-zA-Z]|$)", 'gi')
		}
	],

	PICTO: "Picto",
	LEXICAL: "Lexique"
};

