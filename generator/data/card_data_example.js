var card_data_example = [
    {
        "title": "Picto",
        "color": "DarkGray",
        "contents": [
            "property | créature | créature | prochain tour | prochain tour",
            "property | ca | ca | pv | pv",
            "ruler",
            "property | physique non magique | physique non magique | contondant | contondant",
            "property | perforant | perforant | tranchant | tranchant",
            "property | feu | feu | froid | froid",
            "property | foudre | foudre | acide | acide",
            "property | poison | poison | nécrotique | nécrotique",
            "property | tonnerre | tonnerre | force | force",
            "property | psychique | psychique | radiant | radiant",
            "ruler",
            "property | aveuglé | aveuglé | charmé | charmé",
            "property | assourdi | assourdi | épuisé | épuisé",
            "property | effrayé | effrayé | agrippé | agrippé",
            "property | neutralisé | neutralisé | invisible | invisible",
            "property | paralysé | paralysé | pétrifié | pétrifié",
            "property | empoisonné | empoisonné | à terre | à terre",
            "property | entravé | entravé | étourdi | étourdi",
            "property | inconscient | inconscient"
        ]
    },
    {
        "title": "Lexique",
        "color": "DarkGray",
        "contents": [
            "property | JS | Jet de sauvegarde",
            "property | CA | Classe d'armure",
            "property | VD | Vitesse de déplacement"
        ]
    },
    {
        "title": "All",
        "color": "DarkGray",
        "contents": [
            "comment | icon | name | size | align",
            "icon | oak-leaf | 15 | right",
            "comment | picture | url | height",
            "picture | ./img/3d-hammer.png | 15",
            "rule",
            "fill | 1",
            "comment | boxes | (count) | (size) | (dashed) | (center)",
            "boxes | 5 | 1 | true | true",
            "fill | 2",
            "property | property | Texte sans indentation",
            "description | Texte d'appoint",
            "text | Texte à gauche; feu | true",
            "right | Texte à droite; feu | false",
            "center | Texte centré; feu",
            "justify | Texte justifié",
            "section | section",
            "bullet | bullet",
            "table_header | titre1 | titre 2 | | titre 4",
            "table_line | item1 | | item 3 | item 4"
        ]
    },
    {
        "type": "creature",
        "title": "Creature",
        "creature": {
            "type": "Type"
        },
        "contents": [
            "comment | spells | (level) | ability | spells-0 | spell-1-nb | spells-1 | ... | text",
            "spells | 5 | DD 12, +2 | spells | 5 | spells | | | 2 | spells | text",
            "",
            "comment | attack | name | hit bonus | damage & text",
            "attack | Attack | +3 | 1d10feu"
        ]
    },
    {
        "type": "item",
        "title": "Item",
        "color": "dimgray"
    },
    {
        "type": "spell",
        "title": "Spell",
        "color": "maroon",
        "spell": {
            "verbal": true,
            "materials": "Some materials materials Some Some materials Some materials"
        }
    },
    {
        "type": "power",
        "title": "Power",
        "color": "indigo"
    },
    {

    },

    {
        "type": "creature",
        "color": "black",
        "title": "Goblin",
        "icon": "imp-laugh",
        "creature": {
            "type": "Small humanoid (goblinoid)",
            "cr": "1/4",
            "size": "M",
            "alignment": "Neutre bon",
            "ac": "15 (leather armor, shield)",
            "hp": "7 (2d6)",
            "perception": "15",
            "speed": "6 m, vol 15 m",
            "stats": [
                "8",
                "14",
                "10",
                "10",
                "8",
                "8"
            ]
        },
        "contents": [
            "text | Stealth +6",
            "rule",
            "description | Nimble escape | Disengage or Hide as bonus action",
            "fill | 1",
            "section | Actions",
            "attack | Scimitar | +4 (5 ft.) | one target. 5 (1d6 + 2) slashing damage"
        ]
    },
    {
        "type": "item",
        "color": "dimgray",
        "title": "Full Plate",
        "icon": "breastplate",
        "contents": [
            "subtitle | Heavy armor (1500gp)",
            "property | AC | 18",
            "property | Strength required | 15",
            "property | Stealth | Disadvantage",
            "rule",
            "fill | 2",
            "description | Heavy | Unless you have the required strength, your speed is reduced by 10 feet.",
            "description | Stealth | You have disadvantage on Dexterity (Stealth) checks.",
            "fill | 3"
        ],
        "tags": ["item", "armor"]
    },
    {
        "type": "item",
        "color": "dimgray",
        "title": "Dagger",
        "icon": "daggers",
        "contents": [
            "subtitle | Simple melee weapon (2gp)",
            "property | Damage | 1d4 piercing",
            "property | Modifier | Strength or Dexterity",
            "property | Properties | Light, Finesse, Thrown (20/60)",
            "rule",
            "fill | 2",
            "description | Finesse | Use your choice of Strength or Dexterity modifier for attack and damage.",
            "description | Light | When you attack while dual wielding light weapons, you may use a bonus action to attack with your off hand.",
            "description | Thrown | You can throw the weapon to make a ranged attack with the given range.",
            "fill | 3"
        ],
        "tags": ["item", "weapon"]
    },
    {
        "type": "item",
        "color": "dimgray",
        "title": "Wand of Magic Missiles",
        "icon": "crystal-wand",
        "contents": [
            "subtitle | Wondrous item",
            "property | Maximum charges | 7",
            "property | Recharge | 1d6+1 each day",
            "property | Depletion | If you expend the last charge, roll a d20. On a 1, the item is destroyed.",
            "rule",
            "fill | 2",
            "description | Spells | You can use your action to cast the following spells:",
            "bullet | magic missile, 1st level (1 charge)",
            "bullet | magic missile, 2nd level (2 charges)",
            "bullet | magic missile, 3rd level (3 charges)",
            "fill | 3",
            "boxes | 7 | 2.5"
        ],
        "tags": ["item", "wondrous-item", "magic"]
    },
    {
        "type": "item",
        "color": "dimgray",
        "title": "Potion of Healing",
        "icon": "drink-me",
        "contents": [
            "subtitle | Potion (50gp)",
            "property | Use time | 1 action",
            "property | Hit points restored | 2d4+2",
            "rule",
            "fill | 2",
            "text | When you drink this potion, you regain 2d4+2 hitpoints.",
            "text | Drinking or administering a potion takes 1 action.",
            "fill | 3"
        ],
        "tags": ["item", "consumable"]
    },
    {
        "type": "spell",
        "color": "maroon",
        "title": "Burning Hands",
        "icon_back": "robe",
        "contents": [
            "subtitle | 1st level evocation",
            "property | Casting time | 1 action",
            "property | Range | Self (15ft cone)",
            "property | Components | V,S",
            "rule",
            "fill | 2",
            "text | Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes <b>3d6 fire damage</b> on a failed save, or half as much damage on a successful one.",
            "text | The fire ignites any flammable objects in the area that aren't being worn or carried.",
            "fill | 3",
            "section | At higher levels",
            "text | +1d6 damage for each slot above 1st"
        ],
        "tags": ["spell", "mage"]
    },
    {
        "type": "power",
        "count": 2,
        "color": "indigo",
        "title": "Cunning Action",
        "icon_back": "cloak-dagger",
        "contents": [
            "subtitle | Rogue feature",
            "fill | 2",
            "text | You can take a <b>bonus action on each of your turns</b> in combat. This action can be used only to take the <b>Dash, Disengage, or Hide</b> action.",
            "fill | 2",
            "section | Fast hands (Thief 3rd)",
            "text | You can also use the bonus action to make a Dexterity (<b>Sleight of Hand</b>) check, use your thieves' tools to <b>disarm a trap</b> or <b>open a lock</b>, or take the <b>Use an Object</b> action."
        ],
        "tags": ["feature", "rogue"]
    }
];