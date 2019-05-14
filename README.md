# rpg-cards
=========

RPG spell/item/monster card generator, based on the [crobi rpg-cards](https://github.com/crobi/rpg-cards). It has been upgraded with D&D 5e in mind.

## Preview
=======

[TODO GREGOIRE]

## Status of the project
=====================

In active development. I have a list of stuffs i would like to improve/add, but you can always create an issue or send me a message on twitter [@Grimo_](https://twitter.com/Grimo_).

## FAQ
=====================

- What browsers are supported?
  - This poject uses ES6 features like `import` and `class`, therefore it's not supported by all browsers. It works on Chrome 73+ and the list of supported browsers will be updated later. 
- Cards are generated without icons and background colors, what's wrong?
  - Enable printing backround images in your browser print dialog
- I can't find an icon that I've seen on [game-icons.net](https://game-icons.net), where is it?
  - See the section "updating icons" below.
- The layout of the cards is broken (e.g., cards are placed outside the page), what's wrong?
  - Check your page size, card size, and cards/page settings. If you ask the generator to place 4x4 poker-sized cards on a A4 paper, they won't fit and they will overflow the page.

## Setup
=====

[TODO GREGOIRE]

## Updating icons
==============

This project includes a copy of icons from the [game-icons](https://game-icons.net) project,
which regularly publishes new icons.
To download these new icons:

- Install Imagemagick
- Run the following commands from the root of the project:
  - `npm install`
  - `node ./resources/tools/update-icons.js`


## License
=======

This generator is provided under the terms of the MIT License and is hugely based on the one made by Robert ['crobi'](https://github.com/crobi) Autenrieth at [https://github.com/crobi/rpg-cards](https://github.com/crobi/rpg-cards).

Icons are made by various artists, available at [https://game-icons.net](https://game-icons.net).
They are provided under the terms of the Creative Commons 3.0 BY license.
