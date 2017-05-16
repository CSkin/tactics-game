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
  constructor(sprite, name, descrip, position, sprites) {
    this.sprite = 'sprites/' + sprite;
    this.name = name;
    this.descrip = descrip;
    this.position = position;
    this.sprites = sprites.map( s => 'sprites/' + s );
  }
}

class Weapon extends Item {
  constructor(sprite, name, descrip, power, range, position, sprites, equipped) {
    super(sprite, name, descrip, position, sprites);
    this.power = power;
    this.range = range;
    this.equipped = equipped;
  }
}

var heavyStick = new Weapon('log.png', 'Heavy Stick', 'An unusually heavy stick.', 1, 1, [1], ['log.png'], true);

class Unit {
  constructor(id, faction, sprite, name, offense, defense, range, movement, weapons, clothing, accessories, posY, posX, friendly, control, behavior) {
    this.id = id;
    this.faction = faction;
    this.sprite = 'sprites/' + sprite;
    this.name = name;
    this.condition = 'Healthy';
    this.offense = offense;
    this.defense = defense;
    this.defBonus = null;
    this.range = range;
    this.movement = movement;
    this.items = {
      weapons: weapons,
      clothing: clothing,
      accessories: accessories
    };
    // hidden properties
    this.posY = posY;
    this.posX = posX;
    this.moves = this.movement;
    this.moving = null;
    this.path = null;
    this.attacksperturn = 1;
    this.attacks = this.attacksperturn;
    this.friendly = friendly;
    this.control = control;
    if (behavior) { this.behavior = behavior }
  }
}

var player0 = new Unit('player0', 'Player', 'player.png', 'Player Unit', 1, 2, 3, 5, [heavyStick], [], [], 9, 4, true, 'player'),
    enemy0  = new Unit('enemy0', 'Enemy', 'enemy.png', 'Enemy Unit', 2, 1, 3, 5, [], [], [], 6, 11, false, 'ai', 'sentry');

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