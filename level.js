var mapImage = { backgroundImage: "url('maps/level1.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - b b a a l l a a - - - - ',
  ' - - - - b s s B B s s a - - - - ',
  ' - - - - a s s B B s s b - - - - ',
  ' - - - - a a l l a a b b - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

class Terrain {
  constructor(type, name, cost, cover, elevation, seeThru) {
    this.type = type;
    this.name = name;
    this.cost = cost;
    this.cover = cover;
    this.facing = null;
    this.elevation = elevation;
    this.seeThru = seeThru;
  }
}

var barren = new Terrain('barren', 'Barren', 99, 0, 0, true),
    ground = new Terrain('ground', 'Ground', 1, 0, 0, true),
    sand = new Terrain('sand', 'Sand', 2, 0, 0, true),
    grass = new Terrain('grass', 'Grass', 1, 0, 0, true),
    brush = new Terrain('brush', 'Brush', 2, 1, 0, true),
    boulder = new Terrain('boulder', 'Boulder', 99, 0, 0, false),
    log = new Terrain('log', 'Log', 1, 2, 0, true);

class Space {
  constructor(posY, posX, terrain) {
    this.posY = posY;
    this.posX = posX;
    this.terrain = terrain;
    this.unit = null;
    this.moves = null;
    this.path = null;
    this.distance = null;
  }
}

class Item {
  constructor(id, name, descrip, effects, slots) {
    this.id = id;
    this.sprite = 'sprites/' + id.replace(/\d/, '') + '.png';
    this.name = name;
    this.descrip = descrip;
    this.effects = effects;
    this.slots = slots;
    if (slots.length === 1) {
      this.sprites = [this.sprite];
    } else {
      var n, sprites = [];
      for (n = 0; n < slots.length; n++) {
        sprites.push('sprites/' + id.replace(/\d/, '') + slots[n] + '.png');
      }
      this.sprites = sprites;
    }
  }
}

class Weapon extends Item {
  constructor(id, name, descrip, type, power, range, equipped, effects, slots) {
    super(id, name, descrip, effects, slots);
    this.itemType = 'weapon';
    this.type = type;
    this.power = power;
    switch (type) {
      case 'melee': this.range = [1, 1]; break;
      case 'throwing': this.range = [1, range]; break;
      case 'ranged': this.range = [2, range]; break;
    }
    this.equipped = equipped;
  }
}

class Clothing extends Item {
  constructor(id, name, descrip, armor, effects, slots) {
    super(id, name, descrip, effects, slots);
    this.itemType = 'clothing';
    this.armor = armor;
  }
}

class Accessory extends Item {
  constructor(id, name, descrip, effects, slots) {
    super(id, name, descrip, effects, slots);
    this.itemType = 'accessory';
  }
}

var claws = new Weapon('claws', 'Claws', 'Built for digging but useful in a fight.', 'melee', 1, 1, false, null, [0]),
    stones1 = new Weapon('stones1', 'Stones', 'The original projectile weapon.', 'throwing', 1, 3, true, null, [1]),
    stones2 = new Weapon('stones2', 'Stones', 'The original projectile weapon.', 'throwing', 1, 3, true, null, [0]),
    stick1 = new Weapon('stick1', 'Heavy Stick', 'An unusually heavy stick.', 'melee', 2, 1, false, null, [0, 2]),
    stick2 = new Weapon('stick2', 'Heavy Stick', 'An unusually heavy stick.', 'melee', 2, 1, false, null, [0, 2]),
    tunic = new Clothing('tunic', 'Tunic', 'Comfy and easy to wear.', 1, null, [0]),
    boots = new Clothing('boots', 'Boots', "Made for walkin'.", 0, { movement: 1 }, [1]),
    salve1 = new Accessory('salve1', 'Salve', 'Heals most any wound.', { hp: 2 }, [0]),
    salve2 = new Accessory('salve2', 'Salve', 'Heals most any wound.', { hp: 2 }, [1]);

class Unit {
  constructor(id, faction, sprite, name, strength, melee, throwing, ranged, agility, toughness, movement, weapons, clothing, accessories, posY, posX, friendly, control, behavior) {
    this.id = id;
    this.faction = faction;
    this.sprite = 'sprites/' + sprite;
    this.name = name;
    this.hp = 3;
    this.strength = strength;
    this.melee = melee;
    this.throwing = throwing;
    this.ranged = ranged;
    this.agility = agility;
    this.toughness = toughness;
    this.items = {
      weapons: weapons,
      clothing: clothing,
      accessories: accessories
    };
    // hidden properties
    this.movement = movement;
    this.moves = this.movement;
    this.posY = posY;
    this.posX = posX;
    this.moving = null;
    this.path = null;
    this.attacksperturn = 1;
    this.attacks = this.attacksperturn;
    this.friendly = friendly;
    this.control = control;
    if (behavior) { this.behavior = behavior }
  }
  // getters
  get condition() {
    switch (this.hp) {
      case 3: return 'Healthy';
      case 2: return 'Injured';
      case 1: return 'Critical';
      case 0: return 'Defeated';
    }
  }
  get equipped() { return this.items.weapons.filter( weapon => weapon.equipped === true )[0] }
  get skill() { return this[this.equipped.type] }
  get range() { return this.equipped.range }
  get armor() { return this.items.clothing.reduce( (a, b) => a + b.armor , 0) }
}

var player0 = new Unit('player0', 'Player', 'player.png', 'Player Unit', 1, 1, 1, 1, 1, 2, 12, [claws, stones1], [tunic, boots], [salve1, salve2], 9, 4, true, 'player'),
    enemy0  = new Unit('enemy0', 'Enemy', 'enemy.png', 'Enemy Unit', 2, 1, 1, 1, 1, 1, 5, [stones2], [], [], 6, 11, false, 'ai', 'sentry');

var unitPlan = [
  {
    faction: 'Player',
    control: 'player',
    units: [ player0 ]
  }, {
    faction: 'Enemy',
    control: 'ai',
    units: [ enemy0 ]
  }
];