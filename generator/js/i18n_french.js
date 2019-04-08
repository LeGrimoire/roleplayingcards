'use strict'

// (?: ?=.)? to remove space if not in front of a dot
// [ ]? to remove a space

const I18N = {
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
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}physique[s]? non magique[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "bludgeoning", name: "contondant",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}contondant[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "piercing", name: "perforant",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}perforant[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "slashing", name: "tranchant",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}tranchant[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "fire", name: "feu",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}feu[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "ice", name: "froid",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}froid[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "lightning", name: "foudre",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}foudre[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "acid", name: "acide",
			regex: new RegExp("(?:([ \(\[0-9]| |['’])|^){1}acide[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "poison", name: "poison",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}poison[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "necrotic", name: "nécrotique",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}nécrotique[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "thunder", name: "tonnerre",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}tonnerre[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "force", name: "force",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}force[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "psychic", name: "psychique",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}psychique[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "radiant", name: "radiant",
			regex: new RegExp("(?:([ \(\[0-9]| )|^){1}radiant[s]?([^a-zA-Z]{1}|$)", 'gi')
		}
	],
	CONDITION: [
		{
			file: "blinded", name: "aveuglé",
			regex: new RegExp("([ \(\[>']|^){1}aveuglé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "charmed", name: "charmé",
			regex: new RegExp("([ \(\[>]|^){1}charmé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "deafened", name: "assourdi",
			regex: new RegExp("([ \(\[>']|^){1}assourdi[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "exhaustion", name: "épuisé",
			regex: new RegExp("([ \(\[>']|^){1}épuisé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "frightened", name: "effrayé",
			regex: new RegExp("([ \(\[>']|^){1}effrayé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "grappled", name: "agrippé",
			regex: new RegExp("([ \(\[>']|^){1}agrippé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "incapacitated", name: "neutralisé",
			regex: new RegExp("([ \(\[>]|^){1}neutralisé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "invisible", name: "invisible",
			regex: new RegExp("([ \(\[>']|^){1}invisible[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "paralyzed", name: "paralysé",
			regex: new RegExp("([ \(\[>]|^){1}paralysé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "petrified", name: "pétrifié",
			regex: new RegExp("([ \(\[>]|^){1}pétrifié[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "poisoned", name: "empoisonné",
			regex: new RegExp("([ \(\[>']|^){1}empoisonné[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "prone", name: "à terre",
			regex: new RegExp("([ \(\[>]|^){1}à terre[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "restrained", name: "entravé",
			regex: new RegExp("([ \(\[>']|^){1}entravé[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "stunned", name: "étourdi",
			regex: new RegExp("([ \(\[>']|^){1}étourdi[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			file: "unconscious", name: "inconscient",
			regex: new RegExp("([ \(\[>']|^){1}inconscient[e]?[s]?([^a-zA-Z]{1}|$)", 'gi')
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

	FAIL: "Échec",
	SUCCESS: "Réussite",

	CUSTOM_ICONS: [
		{
			file: "creature", name: "créature",
			regex: new RegExp("(?:([\(\[>])|^| ){1}cr[ée]ature[s]?[ ]?([^a-zA-Z]?|$)", 'gi')
		}, {
			file: "ac", name: "CA",
			regex: new RegExp("(?:([ \(\[>0-9])|^){1}CA([^a-zA-Z]|$)", 'gi')
		}, {
			file: "hp", name: "PV temporaire",
			regex: new RegExp("(?:([ \(\[>0-9])|^){1}PV[s]? temporaire[s]?([^a-zA-Z]|$)", 'gi')
		}, {
			file: "hp", name: "PV",
			regex: new RegExp("(?:([ \(\[>0-9])|^){1}PV[s]?([^a-zA-Z]|$)", 'gi')
		}, {
			file: "gp", name: "PO",
			regex: new RegExp("(?:([\(\[>])|^| ){1}po[s]?([^a-zA-Z]|$)", 'gi')
		}, {
			file: "action_bonus", name: "action bonus",
			regex: new RegExp("(?:([ \(\[>])|^){1}action[s]? bonus(?: ?=.)?([^a-zA-Z]?|$)", 'gi')
		}, {
			file: "action", name: "action",
			regex: new RegExp("(?:([ \(\[>])|^){1}action[s]?(?: ?=.)?([^a-zA-Z]?|$)", 'gi')
		}
	],

	ABREVIATIONS: [
		{ 
			name: "JS", meaning: "Jet de sauvegarde",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(JS)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "JA", meaning: "Jet d'attaque",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(JA)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "JC", meaning: "Jet de caractéristique",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(JC)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "CA", meaning: "Classe d'armure",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(CA)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "VD", meaning: "Vitesse de déplacement",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(VD)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "PP", meaning: "Perception passive",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(pp)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "CM", meaning: "Caractéristique magique",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(CM)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "av", meaning: "Avantage (sur 2d20, garder le meilleur)",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(av)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "dav", meaning: "Désavantage (sur 2d20, garder le moins bon)",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(dav)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, { 
			name: "FP", meaning: "Facteur de puissance",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(FP)[ ]?([^a-zA-Z]{1}|$)", 'g') 
		}, {
			name: "DD", meaning: "Degré de difficulté",
			regex: new RegExp("((?:[\(\[>])|^| ){1}(DD)[ ]?([^a-zA-Z]{1}|$)", 'g')
		}
	],

	COMMON_RULES: [
		{
			name: "Obstacles", meaning: "Le sort est capable de pénétrer la plupart des \\obstacles, mais 90 cm de bois ou de terre, 30 cm de pierre, 2,5 cm de la plupart des métaux ou une mince feuille de plomb le bloquent. Les frontières éthérées (cf. chapitre « Utiliser la magie ») peuvent mettre le sort en échec.",
			regex: new RegExp("((?:[\(\[>'])|^| ){1}(obstacles)[ ]?([^a-zA-Z]{1}|$)", 'gi')
		}, {
			name: "Arrêt", meaning: "Par défaut, un sort ayant une durée de plus d'un round peut être interrompu par le lanceur au prix d'une action.",
			regex: null
		}
	],

	PICTO: "Picto",
	ABREVIATIONS_TITLE: "Lexique",
	COMMON_RULES_TITLE: "Règles courantes"
};
