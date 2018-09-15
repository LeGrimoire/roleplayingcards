var card_data_example = [
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
            "boxes | 5 | 1.5 | true | true",
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
            "type": "Type",
            "cr": "1/2",
            "size": "M",
            "alignment": "Sans alignement",
            "ac": "10",
            "hp": "3 (1d6)",
            "perception": "10",
            "speed": "9 m",
            "stats": [
                "10",
                "10",
                "10S",
                "10M",
                "10",
                "10"
            ]
        },
        "contents": [
            "description | Is proficient in Con saving throw and the magic caracteristic is Int as shown by the icons above",
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
        "color": "dimgray",
        "icon": "swap-bag",
        "item": {},
        "contents": []
    },
    {
        "type": "spell",
        "title": "Spell",
        "color": "maroon",
        "icon": "magic-swirl",
        "spell": {
            "type": "Abjuration",
            "level": 1,
            "ritual": false,
            "casting_time": "1 action",
            "range": "18 m",
            "verbal": true,
            "somatic": false,
            "material": "",
            "duration": "1 round",
            "classes": "Barde, Mage, Moine"
        },
        "contents": [
        ]
    },
    {
        "type": "power",
        "title": "Power",
        "color": "indigo",
        "icon": "lob-arrow",
        "power": {},
        "contents": []
    },
    

    {
        "type": "creature",
        "title": "Goblin",
        "color": "black",
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
            "property | Nimble escape | Disengage or Hide as bonus action",
            "fill | 1",
            "section | Actions",
            "attack | Scimitar | +4 (5 ft.) | one target. 5 (1d6 + 2) slashing damage"
        ]
    },
    {
        "type": "item",
        "title": "Full Plate",
        "subtitle": "Heavy armor",
        "color": "dimgray",
        "icon": "breastplate",
        "item": {},
        "contents": [
            "property | AC | 18",
            "property | Strength required | 15",
            "property | Stealth | Disadvantage",
            "rule",
            "fill | 2",
            "property | Heavy | Unless you have the required strength, your speed is reduced by 10 feet.",
            "property | Stealth | You have disadvantage on Dexterity (Stealth) checks.",
            "fill | 3"
        ]
    },
    {
        "type": "item",
        "title": "Dagger",
        "subtitle": "Simple melee weapon",
        "color": "dimgray",
        "icon": "daggers",
        "item": {},
        "contents": [
            "property | Damage | 1d4 piercing",
            "property | Modifier | Strength or Dexterity",
            "property | Properties | Light, Finesse, Thrown (20/60)",
            "rule",
            "fill | 2",
            "property | Finesse | Use your choice of Strength or Dexterity modifier for attack and damage.",
            "property | Light | When you attack while dual wielding light weapons, you may use a bonus action to attack with your off hand.",
            "property | Thrown | You can throw the weapon to make a ranged attack with the given range.",
            "fill | 3"
        ]
    },
    {
        "type": "item",
        "title": "Wand of Magic Missiles",
        "subtitle": "Wondrous item",
        "color": "dimgray",
        "icon": "crystal-wand",
        "item": {},
        "contents": [
            "property | Maximum charges | 7",
            "property | Recharge | 1d6+1 each day",
            "property | Depletion | If you expend the last charge, roll a d20. On a 1, the item is destroyed.",
            "rule",
            "fill | 2",
            "property | Spells | You can use your action to cast the following spells:",
            "bullet | magic missile, 1st level (1 charge)",
            "bullet | magic missile, 2nd level (2 charges)",
            "bullet | magic missile, 3rd level (3 charges)",
            "fill | 3",
            "boxes | 7 | 2 | true | true"
        ]
    },
    {
        "type": "item",
        "title": "Potion of Healing",
        "subtitle": "Potion",
        "color": "dimgray",
        "icon": "drink-me",
        "item": {},
        "contents": [
            "property | Use time | 1 action",
            "property | Hit points restored | 2d4+2",
            "rule",
            "fill | 2",
            "text | When you drink this potion, you regain 2d4+2 hitpoints.",
            "text | Drinking or administering a potion takes 1 action.",
            "fill | 3"
        ]
    },
    {
        "type": "spell",
        "title": "Burning Hands",
        "subtitle": "1st level evocation",
        "color": "maroon",
        "icon": "magic-swirl",
        "icon_back": "robe",
        "spell": {
            "type": "",
            "level": 1,
            "ritual": false,
            "casting_time": "1 action",
            "range": "Self (15ft cone)",
            "verbal": true,
            "somatic": true,
            "material": "",
            "duration": "1 round",
            "classes": ""
        },
        "contents": [
            "fill | 4",
            "text | Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes <b>3d6 fire</b> on a failed save, or half as much damage on a successful one. | true",
            "text | The fire ignites any flammable objects in the area that aren't being worn or carried.",
            "fill | 5",
            "section | At higher levels",
            "text | +1d6 damage for each slot above 1st",
            "fill | 1"
        ]
    },
    {
        "type": "power",
        "title": "Cunning Action",
        "subtitle": "Rogue feature",
        "color": "indigo",
        "icon": "lob-arrow",
        "icon_back": "cloak-dagger",
        "power": {},
        "contents": [
            "fill | 2",
            "text | You can take a <b>bonus action on each of your turns</b> in combat. This action can be used only to take the <b>Dash, Disengage, or Hide</b> action.",
            "fill | 2",
            "section | Fast hands (Thief 3rd)",
            "text | You can also use the bonus action to make a Dexterity (<b>Sleight of Hand</b>) check, use your thieves' tools to <b>disarm a trap</b> or <b>open a lock</b>, or take the <b>Use an Object</b> action."
        ]
    }
];