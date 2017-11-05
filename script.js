/* jshint loopfunc: true */

// -----------------------------{  Classes  }------------------------------

class Terrain {
  constructor(type, cost, cover, effects, height, shape) {
    this.type = type;
    this.name = capitalize(type);
    this.cost = cost;
    this.cover = cover;
    this.effects = effects;
    if (height) {
      this.height = height;
      this.shape = shape;
    } else {
      this.height = 0;
      this.shape = null;
    }
    this.facing = null;
    this.elevation = null;
  }
}

class Barren extends Terrain {
  constructor() {
    super('barren', 99, 0, null);
  }
}

class Ground extends Terrain {
  constructor() {
    super('ground', 1, 0, null);
  }
}

class Sand extends Terrain {
  constructor() {
    super('sand', 2, 0, null);
  }
}

class Grass extends Terrain {
  constructor() {
    super('grass', 1, 0, null);
  }
}

class TallGrass extends Terrain {
  constructor() {
    super('tall grass', 1, 1, null, 1, 'square');
  }
}

class Brush extends Terrain {
  constructor() {
    super('brush', 2, 2, null, 1, 'circle');
  }
}

class Boulder extends Terrain {
  constructor() {
    super('boulder', 99, 0, null, 2, 'circle');
  }
}

class Tree extends Terrain {
  constructor() {
    super('tree', 99, 0, null, 3, 'circle');
  }
}

class Log extends Terrain {
  constructor() {
    super('log', 1, 3, null);
  }
}

class Plateau extends Terrain {
  constructor() {
    super('plateau', 1, 0, null);
  }
}

class Silversword extends Terrain {
  constructor() {
    super('silversword', 2, 0, { restoreHealth: 1 }, 1, 'circle');
  }
}

class Rocky extends Terrain {
  constructor() {
    super('rocky slope', 3, 3, null);
  }
}

class Lake extends Terrain {
  constructor() {
    super('lake', 99, 0, null);
  }
}

class Hut extends Terrain {
  constructor() {
    super('hut', 99, 0, null, 3, 'square');
  }
}

class Space {
  constructor(posY, posX, terrain) {
    this.posY = posY;
    this.posX = posX;
    this.terrain = terrain;
    this.unit = null;
    this.unit2 = null;
    this.moves = null;
    this.path = null;
    this.distance = null;
    this.goal = false;
    this.items = [];
    this.selected = false;
    this.hideEverything = function () {
      this.moves = null;
      this.path = null;
      this.distance = null;
    };
  }
  get posZ() { return (this.terrain.elevation + this.terrain.height) / 2 }
  get highlight() { return this.path || this.distance || this.goal }
}

class Item {
  constructor(index, id, icon, name, descrip, effects, footprint, slot) {
    this.index = index;
    this.id = id;
    this.sprite = 'img/' + id.replace(/\d/, '') + '.png';
    this.icon = 'img/' + icon + '-icon.png';
    this.name = name;
    this.descrip = descrip;
    this.effects = effects;
    this.footprint = footprint;
    if (footprint.length === 1) {
      this.sprites = [this.sprite];
    } else {
      var n, sprites = [];
      for (n = 0; n < footprint.length; n++) {
        sprites.push('img/' + id.replace(/\d/, '') + footprint[n] + '.png');
      }
      this.sprites = sprites;
    }
    if (!slot) { slot = 0 }
    this.slots = footprint.map( toe => toe + slot );
  }
}

class Weapon extends Item {
  constructor(index, id, icon, name, descrip, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'weapon';
    this.equipped = false;
    this.usable = false;
  }
}

class Melee extends Weapon {
  constructor(index, id, icon, name, descrip, power, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'melee';
    this.power = power;
    this.range = [1, 1];
  }
}

class Throwing extends Weapon {
  constructor(index, id, icon, name, descrip, power, range, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'throwing';
    this.power = power;
    this.range = [1, range];
  }
}

class Ranged extends Weapon {
  constructor(index, id, icon, name, descrip, power, range, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'ranged';
    this.power = power;
    this.range = [2, range];
  }
}

class Clothing extends Item {
  constructor(index, id, icon, name, descrip, armor, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'clothing';
    this.armor = armor;
    this.usable = false;
  }
}

class Accessory extends Item {
  constructor(index, id, icon, name, descrip, usable, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'accessory';
    this.usable = usable;
  }
}

class Unarmed extends Melee {
  constructor() {
    super(1, 'unarmed', 'fist', '--', '--', 0, null, [0]);
  }
}

class Stick extends Melee {
  constructor(id, slot) {
    super(2, id, 'club', 'Heavy Stick', 'An unusually heavy stick.', 2, null, [0, 2], slot);
  }
}

class Club extends Melee {
  constructor(id, slot) {
    super(3, id, 'club', 'Wooden Club', 'Slightly thicker on one end.', 2, null, [0, 2], slot);
  }
}

class Ladle extends Melee {
  constructor(id, slot) {
    super(4, id, 'club', 'Ladle', 'As useful on the battlefield as in the kitchen.', 3, null, [0, 2], slot);
  }
}

class Stones extends Throwing {
  constructor(id, slot) {
    super(5, id, 'stones', 'Stones', 'The original projectile weapon.', 1, 1, null, [0], slot);
  }
}

class Slingshot extends Ranged {
  constructor(id, slot) {
    super(6, id, 'bow', 'Slingshot', 'Packs a sting, fits in a pocket.', 1, 3, null, [0], slot);
  }
}

class ShortBow extends Ranged {
  constructor(id, slot) {
    super(7, id, 'bow', 'Short Bow', 'This compact bow is powerful for its size.', 2, 4, null, [0, 2], slot);
  }
}

class Tunic extends Clothing {
  constructor(id, slot) {
    super(8, id, 'shirt', 'Tunic', 'Comfy and easy to wear.', 1, null, [0], slot);
  }
}

class Boots extends Clothing {
  constructor(id, slot) {
    super(9, id, 'footwear', 'Boots', "Made for walking.", 0, { movement: 1 }, [0], slot);
  }
}

class Salve extends Accessory {
  constructor(id, slot) {
    super(10, id, 'salve', 'Salve', 'Kills pain and heals minor wounds.', true, { restoreHealth: 2 }, [0], slot);
  }
}

class Unit {
  constructor(id, faction, name, strength, melee, throwing, ranged, agility, toughness, movement, items, posY, posX, friendly, control, behavior) {
    // basic info
    this.id = id;
    this.name = name;
    this.faction = faction;
    this.sprites = 'img/' + id.replace(/\d/, '') + '.png';
    // core attributes
    this.hp = 3;
    this.strength = strength;
    this.melee = melee;
    this.throwing = throwing;
    this.ranged = ranged;
    this.agility = agility;
    this.toughness = toughness;
    this.movement = movement;
    // items
    this.items = items;
    if (items.length && items[0].itemType === 'weapon') { this.items[0].equipped = true }
    // inner workings
    this.impaired = [];
    this.movesUsed = 0;
    this.attacksPerTurn = 1;
    this.attacksUsed = 0;
    this.posY = posY;
    this.posX = posX;
    this.moving = null;
    this.path = null;
    this.friendly = friendly;
    if (friendly) { this.facing = 'east' } else { this.facing = 'west' }
    this.control = control;
    if (control === 'ai') { this.behavior = behavior } else { this.behavior = null }
    this.goodbye = null;
    // methods
    this.getFx = function (attr) {
      return this.items
        .filter( i => i.effects && i.effects.hasOwnProperty(attr) && !i.usable )
        .reduce( (a, b) => a + b.effects[attr] , 0 );
    };
    this.getImp = function (attr) {
      var attr1 = attr, attr2 = attr;
      if (attr === 'melee' || attr === 'throwing' || attr === 'ranged') { attr1 = 'skill' }
      return Math.floor(this.impaired
        .map(function(i){ if (i === attr1) { return this[attr2] / 2 } else { return 0 } }, this)
        .reduce( (a, b) => a - b , 0 ));
    };
    this.resetActionPoints = function () {
      this.movesUsed = 0;
      this.attacksUsed = 0;
    };
    this.findItemIndex = function (id) {
      return this.items.indexOf(this.items.filter( i => i.id === id )[0]);
    };
    this.hasItem = function (id) {
      return this.items.filter( i => i.id === id ).length;
    },
    this.findWeaponRange = function (id) {
      if (id === 'unarmed') { return [1, 1] }
      var weapon = this.items[this.findItemIndex(id)];
      if (weapon.type === 'throwing') { return [ 1, Math.floor(this.strSum / weapon.range[1]) ] }
      else { return weapon.range }
    },
    this.equipWeapon = function (id) {
      for (var item of this.items) {
        if (item.itemType === 'weapon') {
          if (item.id === id) { item.equipped = true }
          else { item.equipped = false }
        }
      }
    };
    this.unequipWeapon = function () {
      if (this.equipped.id !== 'unarmed') {
        this.items[this.findItemIndex(this.equipped.id)].equipped = false;
      }
    };
    this.useItem = function (id) {
      var item = this.items.splice(this.findItemIndex(id), 1)[0];
      for (var effect in item.effects) {
        switch (typeof(this[effect])) {
          case 'number': this[effect] += item.effects[effect]; break;
          case 'function': this[effect](item.effects[effect]); break;
        }
      }
    };
    this.restoreHealth = function (hp) {
      while (hp > 0) {
        if (this.hp < 3) {
          this.hp++;
          this.impaired.shift();
        }
        hp--;
      }
    };
    this.sustainDamage = function (damage) {
      while (damage > 0) {
        if (this.hp > 0) {
          this.hp--;
          var attributes = ['strength', 'skill', 'agility', 'toughness', 'movement'];
          this.impaired.push(shuffle(attributes).pop());
        }
        damage--;
      }
    };
  }
  // hp-derived
  get condition() {
    switch (this.hp) {
      case 3: return 'Healthy';
      case 2: return 'Wounded';
      case 1: return 'Critical';
      case 0: return 'Defeated';
    }
  }
  // strength-derived
  get strMod() { return this.getFx('strength') + this.getImp('strength') }
  get strSum() { return this.strength + this.strMod }
  // melee-derived
  get mleMod() { return this.getFx('melee') + this.getImp('melee') }
  get mleSum() { return this.melee + this.mleMod }
  // throwing-derived
  get thrMod() { return this.getFx('throwing') + this.getImp('throwing') }
  get thrSum() { return this.throwing + this.thrMod }
  // ranged-derived
  get rngMod() { return this.getFx('ranged') + this.getImp('ranged') }
  get rngSum() { return this.ranged + this.rngMod }
  // agility-derived
  get agiMod() { return this.getFx('agility') + this.getImp('agility') }
  get agiSum() { return this.agility + this.agiMod }
  // toughness-derived
  get tghMod() { return this.getFx('toughness') + this.getImp('toughness') }
  get tghSum() { return this.toughness + this.tghMod }
  // movement-derived
  get movMod() { return this.getFx('movement') + this.getImp('movement') }
  get movesLeft() {
    if (this.control === 'ai' && this.behavior === 'sentry') { return 0 }
    else { return this.movement + this.movMod - this.movesUsed }
  }
  // item-derived
  get weapons() { return this.items.filter( i => i.itemType === 'weapon' ) }
  get clothing() { return this.items.filter( i => i.itemType === 'clothing' ) }
  get accessories() { return this.items.filter( i => i.itemType === 'accessory' ) }
  get equipped() {
    var equipped = this.weapons.filter( w => w.equipped === true );
    if (equipped.length) { return equipped[0] }
    else { return new Unarmed() }
  }
  get skill() { return this[this.equipped.type] }
  get range() { return this.findWeaponRange(this.equipped.id) }
  get maxRange() {
    if (this.weapons.length > 0) {
      var min = this.weapons
        .map( w => w = this.findWeaponRange(w.id)[0] )
        .reduce( (a, b) => Math.min(a, b) );
      var max = this.weapons
        .map( w => w = this.findWeaponRange(w.id)[1] )
        .reduce( (a, b) => Math.max(a, b) );
      return [min, max];
    }
    else { return [1, 1] }
  }
  get armor() { return this.clothing.reduce( (a, b) => a + b.armor , 0 ) }
  // skill-derived
  get sklMod() { return this.getFx(this.equipped.type) + this.getImp(this.equipped.type) }
  get sklSum() { return this.skill + this.sklMod }
  // attack-derived
  get attacksLeft() { return this.attacksPerTurn - this.attacksUsed }
}

class DialogEvent {
  constructor(unit, message, alignLeft) {
    this.eventType = 'dialog';
    if (unit) {
      this.subject = unit.name;
      this.portrait = unit.sprites;
      this.faction = unit.faction;
      this.alignLeft = alignLeft;
    }
    else { this.alignLeft = true }
    this.message = message;
  }
}

class CombatEvent {
  constructor(unit, target, damage, activeTurn, counter) {
    this.eventType = 'combat';
    this.subject = unit.name;
    this.subjectIcon = unit.sprites;
    if (!counter) { this.verb = 'attacked' } else { this.verb = 'countered' }
    this.verbIcon = unit.equipped.icon;
    this.object = target.name;
    this.objectIcon = target.sprites;
    switch (damage) {
      case 0: this.result = 'Attack missed.'; break;
      case 1: this.result = 'Attack hit.'; break;
      case 2: this.result = 'Critical hit!'; break;
    }
    this.activeTurn = activeTurn;
  }
}

class ConditionEvent {
  constructor(unit, activeTurn) {
    this.eventType = 'condition';
    this.subject = unit.name;
    this.subjectIcon = unit.sprites;
    if (unit.hp > 0) { this.verb = 'is' } else { this.verb = 'was' }
    this.object = unit.condition.toLowerCase();
    if (this.object === 'wounded' || this.object === 'critical') {
      this.result = capitalize(unit.impaired[unit.impaired.length - 1]) + ' -50%';
    }
    this.activeTurn = activeTurn;
  }
}

class ItemEvent {
  constructor(unit, verb, item, activeTurn) {
    this.eventType = 'item';
    this.subject = unit.name;
    this.subjectIcon = unit.sprites;
    this.verb = verb;
    this.object = item.name;
    this.objectIcon = item.icon;
    this.activeTurn = activeTurn;
  }
}

class Shadow {
  constructor(dist, hAng1, hAng2, vDist, hDist) {
    this.dist = dist;
    this.hAng1 = hAng1;
    this.hAng2 = hAng2;
    this.vDist = vDist;
    this.hDist = hDist;
  }
  get vAng() { return Math.atan2(this.vDist, this.hDist) }
  get hDistAdj() {
    if (this.vAng > 0) { return this.hDist + 0.5 }
    else if (this.vAng < 0) { return this.hDist - 0.5 }
    else { return this.hDist }
  }
  get vAngAdj() { return Math.atan2(this.vDist, this.hDistAdj) }
}

// --------------------------{  Level Design  }---------------------------

var mapImage = { backgroundImage: 'none' };

var mapPlan = [
  ' L L L L t a a a a a a a p p p p ',
  ' L L L t t t a a a a a a a p p p ',
  ' L L t a t a a a a a a a a p p p ',
  ' L t a t a a T a a a a a a a p r ',
  ' s t T a a a a a a a a b r r r r ',
  ' a a a a a a a b r r r r r r r r ',
  ' b a T a a a a a a b a r r r r r ',
  ' a a a a a a a a a a a b b r r r ',
  ' r a b a a a a a a a a a a b r r ',
  ' r r a a a a T T a a a a a b T r ',
  ' r r r r r a b b a a T a a a b r ',
  ' r r r r r r r b b a a a a b a b ',
  ' r r r r r b b a a a a T a a b a ',
  ' r r b b a a a a a T a a a a a H ',
  ' r a a a a a a T a a a T a a a g ',
  ' b a a a a T a a a T a a a T a a ',
];

var topoPlan = [
  ' 0 0 1 2 3 3 3 3 3 3 3 4 5 5 5 5 ',
  ' 0 1 2 3 3 3 3 3 3 3 3 3 4 5 5 5 ',
  ' 1 2 3 3 3 3 3 3 3 3 3 3 4 5 5 5 ',
  ' 2 3 3 3 3 3 3 3 3 3 3 3 4 4 5 5 ',
  ' 3 3 3 3 3 3 3 3 4 4 4 4 5 5 5 6 ',
  ' 3 3 3 3 3 3 3 4 5 5 5 5 5 6 6 6 ',
  ' 3 3 3 3 3 3 3 3 4 4 4 5 5 5 6 6 ',
  ' 4 3 3 3 3 3 3 3 3 3 3 4 4 5 5 6 ',
  ' 5 4 3 3 3 3 3 3 3 3 3 3 3 4 5 5 ',
  ' 5 5 4 4 4 3 3 3 3 3 3 3 3 3 4 5 ',
  ' 6 5 5 5 5 4 4 3 3 3 3 3 3 3 4 5 ',
  ' 6 6 6 5 5 5 5 4 3 3 3 3 3 3 3 4 ',
  ' 6 5 5 5 5 4 4 3 3 3 3 3 3 3 3 3 ',
  ' 5 5 4 4 4 3 3 3 3 3 3 3 3 3 3 3 ',
  ' 5 4 3 3 3 3 3 3 3 3 3 3 3 3 3 3 ',
  ' 4 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 ',
];

var stick1 = new Stick('stick1'),
    club1 = new Club('club1'),
    club2 = new Club('club2'),
    ladle1 = new Ladle('ladle1', 1),
    stones1 = new Stones('stones1', 1),
    stones2 = new Stones('stones2'),
    slingshot1 = new Slingshot('slingshot1'),
    shortbow1 = new ShortBow('shortbow1'),
    tunic1 = new Tunic('tunic1'),
    boots1 = new Boots('boots1'),
    salve1 = new Salve('salve1');
    salve2 = new Salve('salve2');

var itemPlan = [
  {
    posY: 14,
    posX: 9,
    items: [stick1]
  }
];

// id, faction, name
// Str, Mle, Thr, Rng, Agi, Tgh, Mov
// posY, posX, friendly, control, behavior

var player0 = new Unit(
      'lizzie', 'Player', 'Lizzie',
      5, 5, 5, 4, 6, 5, 5, [salve1],
      null, null, true, 'player'
    ),
    player1 = new Unit(
      'corbin', 'Player', 'Corbin',
      5, 3, 4, 6, 4, 8, 5, [shortbow1, ladle1, salve2],
      null, null, true, 'player'
    ),
    enemy0 = new Unit(
      'ruffian-leader', 'Enemy', 'Ruffian Leader',
      8, 5, 4, 2, 4, 4, 5, [club2, stones1, boots1],
      null, null, false, 'ai', 'sentry'
    ),
    enemy1 = new Unit(
      'ruffian1', 'Enemy', 'Ruffian',
      6, 4, 3, 2, 3, 5, 5, [club1],
      null, null, false, 'ai', 'sentry'
    ),
    enemy2 = new Unit(
      'ruffian2', 'Enemy', 'Ruffian',
      5, 4, 5, 2, 3, 5, 5, [stones2, tunic1],
      null, null, false, 'ai', 'sentry'
    ),
    enemy3 = new Unit(
      'ruffian3', 'Enemy', 'Ruffian',
      4, 4, 3, 5, 4, 2, 5, [slingshot1],
      null, null, false, 'ai', 'sentry'
    );

var unitPlan = [
  {
    faction: 'Player',
    control: 'player',
    units: []
  }, {
    faction: 'Enemy',
    control: 'ai',
    units: []
  }
];

// --------------------------{  Game Loading  }---------------------------

function loadMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      switch (string[x]) {
        case '-': row.push(new Space(y, x, new Barren())); break;
        case 'g': row.push(new Space(y, x, new Ground())); break;
        case 's': row.push(new Space(y, x, new Sand())); break;
        case 'a': row.push(new Space(y, x, new Grass())); break;
        case 't': row.push(new Space(y, x, new TallGrass())); break;
        case 'b': row.push(new Space(y, x, new Brush())); break;
        case 'T': row.push(new Space(y, x, new Tree())); break;
        case 'B': row.push(new Space(y, x, new Boulder())); break;
        case 'l': row.push(new Space(y, x, new Log())); break;
        case 'p': row.push(new Space(y, x, new Plateau())); break;
        case 'S': row.push(new Space(y, x, new Silversword())); break;
        case 'r': row.push(new Space(y, x, new Rocky())); break;
        case 'L': row.push(new Space(y, x, new Lake())); break;
        case 'H': row.push(new Space(y, x, new Hut())); break;
      }
    }
    mapData.push(row);
  }
  return mapData;
}

function loadFacings (mapData) {
  var y, x;
  for (y = 0; y < 16; y++) {
    for (x = 0; x < 16; x++) {
      if (mapData[y][x].terrain.type === 'log') {
        if      (mapData[y][x + 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'East' }
        else if (mapData[y + 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'South' }
        else if (mapData[y][x - 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'West' }
        else if (mapData[y - 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'North' }
      }
    }
  }
  return mapData;
}

function normalizeTopo (topoPlan) {
  var str, arr, num, normal, y, x,
      tally = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newPlan = [];
  for (str of topoPlan) {
    arr = str.substring(1, str.length - 1).split(' ');
    arr = arr.map( s => Number(s) );
    for (num of arr) { tally[num]++ }
    newPlan.push(arr);
  }
  normal = tally.indexOf(Math.max(...tally));
  newPlan = newPlan.map( y => y.map( x => x - normal ) );
  return newPlan;
}

function loadTopography (mapData, topoPlan) {
  var y, x;
  for (y = 0; y < mapData.length; y++) {
    for (x = 0; x < mapData[y].length; x++) {
      mapData[y][x].terrain.elevation = topoPlan[y][x];
    }
  }
  return mapData;
}

function loadItems (mapData, itemPlan) {
  for (var space of itemPlan) {
    mapData[space.posY][space.posX].items = space.items;
  }
  return mapData;
}

function loadUnits (mapData, unitPlan) {
  for (var faction of unitPlan) {
    for (var unit of faction.units) {
      mapData[unit.posY][unit.posX].unit = unit;
    }
  }
  return mapData;
}

function loadLevel () {
  return  loadUnits(
            loadItems(
              loadTopography(
                loadFacings(
                  loadMap(mapPlan)
                )
              , normalizeTopo(topoPlan))
            , itemPlan)
          , unitPlan);
}

function loadFactions () {
  var obj, factions = [];
  for (obj of unitPlan) {
    factions.push(obj.faction);
  }
  return factions;
}

function shuffle (array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function capitalize (string) {
  return string.split(' ').map( s => s.charAt(0).toUpperCase() + s.slice(1) ).join(' ');
}

$( document ).ready( function () {

// -------------------------{  Vue Components  }--------------------------

var TitleScreen = {
  template: `
    <transition name='fade-glacial'>
      <div id='splash'>
        <img id='background' src='maps/world-map.png'>
        <div class='title bit'>Tactics Game</div>
        <div class='menu bit'>
          <div id='menu-0' class='option' @mouseover='menuNav(0)' @click='startGame'>
            <span class='selector' v-if='menu === 0'>&#x25B6;</span>
            <span>Start Game</span>
          </div>
          <div id='menu-1' class='option' @mouseover='menuNav(1)' @click='toggleTutorial'>
            <span class='selector' v-if='menu === 1'>&#x25B6;</span>
            <span class='sa'>Tutorial Hints</span><span :class='{ inverted : tutorial }'>{{ tutorial ? 'On' : 'Off' }}</span>
          </div>
        </div>
      </div>
    </transition>
  `,
  props: ['menu', 'tutorial'],
  methods: {
    menuNav: function (option) {
      Game.menu = option;
    },
    startGame: function () {
      Game.title = false;
      if (!Game.tutorial) { Game.turnOffHints(Game.scripts) }
      window.setTimeout(function(){ Game.runScripts() }, 2000);
    },
    toggleTutorial: function () {
      Game.tutorial = !Game.tutorial
    }
  }
}

var GroundIcon = {
  template: `
    <transition name='fade'>
      <img class='space terrain' :style='iconStyle' :src='iconSrc'>
    </transition>
  `,
  props: ['itemType', 'transform'],
  computed: {
    iconStyle: function () {
      return { '-webkit-transform': this.transform }
    },
    iconSrc: function () {
      return 'img/ground-' + this.itemType + '.png';
    }
  }
};

var Terrain = {
  // To use terrain sprites instead of map image, add :style='terrainStyle' to parent div.
  template: `
    <div class='space terrain' :style='terrainStyle'>
      <ground-icon v-if='itemsOfType(weapon).length' :itemType='weapon' :transform='transform'></ground-icon>
      <ground-icon v-if='itemsOfType(clothing).length' :itemType='clothing' :transform='transform'></ground-icon>
      <ground-icon v-if='itemsOfType(accessory).length' :itemType='accessory' :transform='transform'></ground-icon>
      <transition name='fade'>
        <img v-show='elevationShow' class='space terrain' :src='elevationSrc'>
      </transition>
    </div>
  `,
  props: ['terrain', 'items', 'topoView'],
  data: function () {
    var scaleX = Math.sign(Math.random() - 0.5),
        rotate = [0, 0.25, 0.5, 0.75][Math.floor(Math.random() * 4)];
    return {
      weapon: 'weapon',
      clothing: 'clothing',
      accessory: 'accessory',
      transform: 'scaleX(' + scaleX + ') rotate(' + rotate + 'turn)'
    };
  },
  computed: {
    terrainStyle: function () {
      if (this.terrain.type === 'hut') { return { backgroundImage: "url('img/hut.gif')" } }
      return { backgroundImage: "url('img/" + this.terrain.type.replace(/\s/g, '') + ".png')" }
    },
    elevationShow: function () {
      return this.terrain.type !== 'barren' && this.topoView;
    },
    elevationSrc: function () {
      return 'img/elevation' + this.terrain.elevation + '.png';
    }
  },
  methods: {
    itemsOfType: function (type) {
      return this.items.filter( i => i.itemType === type);
    }
  },
  components: {
    'ground-icon': GroundIcon
  }
};

var Highlight = {
  template: `
    <transition name='fade'>
      <svg class='space highlight' :style='cursorStyle' width='32' height='32'>
        <image x='-32' y='-32' width='64' height='64' :xlink:href='highlightHref'>
          <animateTransform attributeName="transform" attributeType="XML" type="translate"
                            from="0 0" to="32 32" :dur="animationSpeed" repeatCount="indefinite"/>
        </image>
      </svg>
    </transition>
  `,
  props: ['space'],
  computed: {
    highlightHref: function () {
      var color;
      if (this.space.path) { color = 'blue' }
      else if (this.space.distance) {
        if (this.space.unit && this.space.unit.friendly !== Game.active.unit.friendly) { color = 'solidred' }
        else { color = 'red' }
      }
      else if (this.space.goal) { color = 'yellow' }
      return 'img/highlight-' + color + '.png';
    },
    cursorStyle: function () {
      if (this.space.path && Game.active.unit.control === 'player') {
        return { cursor: 'pointer' }
      } else {
        return { cursor: 'initial' }
      }
    },
    animationSpeed: function () {
      if (this.space.path || this.space.distance) { return '1.5s' }
      else if (this.space.goal) { return '3s' }
    }
  }
};

var Unit = {
  template: `
    <transition :name='dynamicTransition' @after-enter='moveHandler'>
      <svg :id='unit.id' class='space unit' :title='unit.name' width='32' height='32'>
          <image :xlink:href='unit.sprites' width='96' height='178' :y='imageY'></image>
      </svg>
    </transition>
  `,
  props: ['unit'],
  computed: {
    dynamicTransition: function () {
      if (this.unit.moving) {
        switch (this.unit.moving) {
          case 'east': return 'moveEast';
          case 'south': return 'moveSouth';
          case 'west': return 'moveWest';
          case 'north': return 'moveNorth';
        }
      } else if (this.unit.condition === 'Defeated') {
        return 'sayGoodbye';
      }
    },
    imageY: function () {
      var y = -96;
      if (this.unit.facing === 'west') { y -= 32 }
      return String(y);
    }
  },
  methods: {
    moveHandler: function () {
      var unit = this.unit;
      if (unit.path) {
        Game.moveUnit(unit.posY, unit.posX);
      }
      else {
        Game.map[unit.posY][unit.posX].unit.moving = null;
        if (Game.action === 'moving') { Game.action = null }
      }
    }
  }
};

var Space = {
  template: `
    <div class='space' @click='clickHandler'>
      <terrain :terrain='space.terrain' :items='space.items' :topo-view='status.topoView'></terrain>
      <highlight v-if='space.highlight' :space='space'></highlight>
      <unit v-if='space.unit'  :unit='space.unit'></unit>
      <unit v-if='space.unit2' :unit='space.unit2'></unit>
      <transition name='fade'>
        <div v-if='isActive' class='space active'></div>
      </transition>
    </div>
  `,
  props: ['space', 'status'],
  computed: {
    isActive: function () {
      return this.space.posY === this.status.activeY && this.space.posX === this.status.activeX;
    }
  },
  methods: {
    clickHandler: function () {
      var y = this.space.posY,
          x = this.space.posX,
          unit = this.space.unit,
          path = this.space.path;
      if (Game.action === 'waiting') { Game.advanceDialog() }
      else if (Game.control === 'player') {
        switch (Game.action) {
          case 'moving':
            if (path) { Game.moveUnit(Game.active.posY, Game.active.posX, path) }
            else {
              this.selectSpace(y, x);
            }
            break;
          case 'attacking':
            if (this.space.distance && unit && !unit.friendly) {
              if (!Game.target || unit !== Game.target.unit) {
                Game.hideAttackRange();
                Game.targetUnit(y, x);
              } else {
                $( '#btn-confatk' ).trigger( 'click' );
              }
            }
            else {
              this.selectSpace(y, x);
            }
            break;
          default:
            this.selectSpace(y, x);
            break;
        }
      }
    },
    selectSpace: function (y, x) {
      $( '#btn-cancel' ).trigger( 'click' );
      Game.active = Game.map[y][x];
      Game.target = null;
    }
  },
  components: {
    'terrain': Terrain,
    'highlight': Highlight,
    'unit': Unit
  }
};

var Row = {
  template: `
    <div class='row'>
      <space v-for='(space, index) in row' :key='index' :space='space' :status='status'></space>
    </div>
  `,
  props: ['row', 'status'],
  components: {
    'space': Space
  }
};

var ItemInfo = {
  template: `
    <div class='item-info'>
      <p>
        <b>{{ item.name }}</b>
        <template v-if="type === 'weapon'">
          <span>{{ capitalize(item.type) }}</span>
          <span>Power: <b>{{ item.power }}</b></span>
          <span v-if="item.type !== 'melee'">Range: <b>{{ range }}</b></span>
        </template>
        <template v-if="type === 'clothing'">
          <span v-if='item.armor > 0'>Armor: <b>{{ item.armor }}</b></span>
        </template>
        <span v-for='effect in effects'>{{ effect }}</span>
      </p>
      <p>{{ item.descrip }}</p>
    </div>
  `,
  props: ['type', 'item'],
  computed: {
    effects: function () {
      if (this.item && this.item.effects) {
        var sign, effects = [];
        for (var [attribute, effect] of Object.entries(this.item.effects)) {
          if (attribute === 'restoreHealth') { effects.push('Restore HP'); }
          else {
            if (effect > 0) { sign = '+' } else { sign = '-' }
            effects.push(capitalize(attribute) + ' ' + sign + effect);
          }
        }
        return effects;
      }
    },
    range: function () {
      if (this.item.type === 'throwing') {
        if (this.item.range[1] === 1) { return 'Str' }
        else { return 'Str/' + this.item.range[1] }
      }
      else { return this.item.range[1] }
    }
  },
  methods: {
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
};

var GroundItem = {
  template: `
    <div class='ground-item'>
      <img :id="item.id" class='item ground' :class='[item.itemType, item.id]' :src='item.sprite' :title='item.name'>
      <item-info :type='item.itemType' :item='item'></item-info>
    </div>
  `,
  props: ['item'],
  components: {
    'item-info': ItemInfo
  }
};

var GroundPanel = {
  template: `
    <transition name='fade'>
      <div v-if='items.length > 0' id='ground-panel'>
        <ground-item v-for='item in items' :item='item' :key='item.id'></ground-item>
      </div>
    </transition>
  `,
  props: ['items'],
  components: {
    'ground-item': GroundItem
  }
};

var TerrainInfo = {
  template: `
    <div class='ui terrain-info'>
      <p class='heading'><img class='icon' :src='iconSrc'>{{ terrain.name }}</p>
      <div class='flex'>
        <div class='columns'>
          <p v-if='terrain.cost < 99'>Move cost: <b>{{ terrain.cost }}</b></p><p v-else>Impassable</p>
          <p v-if='terrain.elevation !== 0'>Elevation: <b>{{ terrain.elevation }}</b></p>
        </div>
        <div class='columns'>
          <p v-if='terrain.cover > 0'>Cover: <b>{{ terrain.cover }}</b></p>
          <p v-if='terrain.facing'>Facing: <b>{{ terrain.facing }}</b></p>
        </div>
      </div>
    </div>
  `,
  props: ['terrain'],
  computed: {
    iconSrc: function () {
      return 'img/' + this.terrain.type.replace(/\s/g, '') + '.png';
    }
  }
};

var GroundInfo = {
  template: `
    <div class='ui ground-info'>
      <p class='heading'><img class='icon' src='img/equipment-icon.png'>Items</p>
      <p v-for='item in items' :key='item.id'>
        <img class='icon' :src='item.icon'>{{ item.name }}
      </p>
    </div>
  `,
  props: ['items']
};

var Modifier = {
  template: `
    <transition name='fade'>
      <b v-if='mod !== 0' :style='modColor'><span v-if='mod > 0'>+</span>{{ mod }}</b>
    </transition>
  `,
  props: ['mod'],
  computed: {
    modColor: function () {
      if (this.mod > 0) { return { color: '#00aaff' } } else
      if (this.mod < 0) { return { color: '#aa00ff' } }
    }
  }
};

var UnitInfo = {
  template: `
    <div class='ui unit-info'>
      <p class='heading'><img class='icon sprite' :src='unit.sprites'>{{ unit.name }}</p>
      <p>Condition: <b :class='unit.condition.toLowerCase()'>{{ unit.condition }}</b></p>
      <div class='flex'>
        <div class='col60'>
          <p>Strength: <b>{{ unit.strength }}</b> <modifier :mod='unit.strMod'></modifier></p>
          <p>Skill <img class='icon tiny' :src='skillIcon'>: <b>{{ unit.skill }}</b> <modifier :mod='unit.sklMod'></modifier></p>
          <p>Agility: <b>{{ unit.agility }}</b> <modifier :mod='unit.agiMod'></modifier></p>
          <p>Toughness: <b>{{ unit.toughness }}</b> <modifier :mod='unit.tghMod'></modifier></p>
          <p>Movement: <b>{{ unit.movement }}</b> <modifier :mod='unit.movMod'></modifier></p>
        </div>
        <div class='col40'>
          <p>Equipped:
            <img v-if="unit.equipped.id !== 'unarmed'" class='icon' :src='unit.equipped.icon'>
            <b>{{ unit.equipped.name }}</b>
          </p>
        </div>
      </div>
    </div>
  `,
  props: ['unit'],
  computed: {
    skillIcon: function () {
      return 'img/skill-' + this.unit.equipped.type + '.png';
    }
  },
  components: {
    'modifier': Modifier
  }
};

var ActionButton = {
  template: `
    <div class='btn-holder' :style='holderStyle'>
      <img v-if='enabled' :id='buttonId' class='button' :src='buttonSrc' :title='title' @click='onclick'>
    </div>
  `,
  props: ['type', 'title', 'onclick', 'enabled'],
  computed: {
    holderStyle: function () {
      return { backgroundImage: "url('img/btn-" + this.type + "-disabled.png')" }
    },
    buttonId: function () {
      return 'btn-' + this.type;
    },
    buttonSrc: function () {
      return 'img/btn-' + this.type + '.png';
    }
  }
};

var UnitActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='img/actions-icon.png'>Actions</p>
      <div id='action-buttons'>
        <template v-if="unit.control === 'player'">
          <action-button type='move' title='Move (M)' :onclick='beginMove' :enabled="action !== 'moving' && unit.movesLeft > 0"></action-button>
          <action-button type='attack' title='Attack (A)' :onclick='beginAttack' :enabled="action !== 'attacking' && unit.attacksLeft > 0"></action-button>
          <action-button type='equip' title='Equip (E)' :onclick='beginEquip' :enabled="action !== 'equipping'"></action-button>
          <action-button type='cancel' title='Cancel (C)' :onclick='cancelAction' :enabled='action'></action-button>
        </template>
        <template v-else>
          <action-button type='checkranges' title='Check Range (M or A)' :onclick='checkRanges' :enabled="action !== 'checking'"></action-button>
          <action-button type='equip' title='Check Equipment (E)' :onclick='checkEquip' :enabled="action !== 'equipping'"></action-button>
          <action-button type='cancel' title='Cancel (C)' :onclick='cancelAction' :enabled='action'></action-button>
        </template>
      </div>
    </div>
  `,
  props: ['action', 'unit'],
  methods: {
    beginMove: function () { Game.beginMove() },
    beginAttack: function () { Game.beginAttack() },
    beginEquip: function () { Game.beginEquip() },
    checkRanges: function () { Game.checkRanges() },
    checkEquip: function () { Game.checkEquip() },
    cancelAction: function () { Game.cancelAction() }
  },
  components: {
    'action-button': ActionButton
  }
};

var TargetActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='img/actions-icon.png'>Actions</p>
      <div id='confatk-holder' class='btn-holder'>
        <img v-if='btnEnabled' id='btn-confatk' class='button' src='img/btn-confatk.png' title='Confirm Attack (A)' @click='confirmAttack'>
      </div>
    </div>
  `,
  data: function () {
    return { btnEnabled: true }
  },
  methods: {
    confirmAttack: function () {
      this.btnEnabled = false;
      Game.attackUnit();
    }
  }
};

var CombatInfo = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='img/combat-icon.png'>Combat</p>
      <div class='flex'>
        <div class='columns'>
          <template v-if="type === 'active'">
            <p>Attack: <b>{{ combat.activeAtk }}</b></p>
            <p v-if='combat.canCounter'>Defense: <b>{{ combat.activeDef }}</b></p>
          </template>
          <template v-else-if="type === 'target'">
            <p v-if='combat.canCounter'>Attack: <b>{{ combat.targetAtk }}</b></p>
            <p>Defense: <b>{{ combat.targetDef }}</b></p>
          </template>
        </div>
        <div class='columns flex'>
          <template v-if="type === 'active'"><p>Hit:</p><p class='bold' :style='gradient'><span class='big'>{{ combat.activeHit }}</span>%</p></template>
          <template v-else-if="type === 'target' && combat.canCounter"><p>Hit:</p><p class='bold':style='gradient'><span class='big'>{{ combat.targetHit }}</span>%</p></template>
        </div>
      </div>
    </div>
  `,
  props: ['type', 'combat'],
  computed: {
    gradient: function () {
      var hit;
      if      (this.type === 'active') { hit = this.combat.activeHit }
      else if (this.type === 'target') { hit = this.combat.targetHit }
      if (hit < 10) { return { color: '#bf0000' } }
      else if (hit < 20) { return { color: '#d01b00' } }
      else if (hit < 30) { return { color: '#e13600' } }
      else if (hit < 40) { return { color: '#f25100' } }
      else if (hit < 50) { return { color: '#ea6a00' } }
      else if (hit < 60) { return { color: '#e28300' } }
      else if (hit < 70) { return { color: '#da9c00' } }
      else if (hit < 80) { return { color: '#97a406' } }
      else if (hit < 90) { return { color: '#55ab0c' } }
      else { return { color: '#12b312' } }
    }
  }
};

var ItemSlot = {
  template: `
    <div :id='type + n' class='item-slot' :style='slotBackground' @click='showInfo($event)'>
      <img v-if='item' :id="item.id + '-' + n" class='item equip' :class='[type, item.id, { usable: item.usable }]' :src='itemSrc' :title='item.name'>
      <transition name='fade'>
        <div v-if="item && itemtip === type + n" id='item-tip'>
          <item-info :type='type' :item='item'></item-info>
        </div>
      </transition>
    </div>
  `,
  props: ['type', 'n', 'item', 'itemtip'],
  computed: {
    slotBackground: function () {
      return { backgroundImage: "url('img/" + this.type + "-slot.png')" }
    },
    itemSrc: function () {
      if (this.item) {
        return this.item.sprites[this.item.slots.indexOf(this.n)];
      }
    }
  },
  methods: {
    showInfo: function (event) {
      if (event.target.tagName !== 'DIV') {
        if (!this.itemtip) {
          Game.itemtip = this.type + this.n;
        } else {
          Game.itemtip = null;
        }
      }
    }
  },
  components: {
    'item-info': ItemInfo
  }
};

var ItemHolder = {
  template: `
    <div class='item-holder'>
      <img :src="'img/' + type + '-card.png'">
      <div class='slot-container' :style='borderColor'>
        <item-slot v-for='n in 6' :type='type' :n='n - 1' :item='itemData[n - 1]' :itemtip='itemtip' :key='n - 1'></item-slot>
      </div>
    </div>
  `,
  props: ['type', 'items', 'itemtip'],
  computed: {
    borderColor: function () {
      switch (this.type) {
        case 'weapon': return { border: '1px solid #800000' }
        case 'clothing': return { border: '1px solid #000099' }
        case 'accessory': return { border: '1px solid #005900' }
      }
    },
    itemData: function () {
      var itemData = [null, null, null, null, null, null];
      for (item of this.items) {
        for (slot of item.slots) {
          itemData[slot] = item;
        }
      }
      return itemData;
    }
  },
  components: {
    'item-slot': ItemSlot
  }
};

var UnitItems = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='img/equipment-icon.png'>Equipment</p>
      <div class='equipment'>
        <item-holder type='weapon' :items='unit.weapons' :itemtip='itemtip'></item-holder>
        <item-holder type='clothing' :items='unit.clothing' :itemtip='itemtip'></item-holder>
        <item-holder type='accessory' :items='unit.accessories' :itemtip='itemtip'></item-holder>
      </div>
    </div>
  `,
  props: ['unit', 'itemtip'],
  components: {
    'item-holder': ItemHolder
  }
};

var SidePanel = {
  template: `
    <div>
      <transition name='fade'>
        <div v-if='space && space.terrain'>
          <terrain-info :terrain='space.terrain'></terrain-info>
          <ground-info v-if='space.items.length && !space.unit' :items='space.items'></ground-info>
        </div>
      </transition>
      <transition :name='dynamicTransition'>
        <div v-if='space && space.unit'>
          <unit-info :unit='space.unit'></unit-info>
          <unit-items v-if="side === 'left' && action === 'equipping'" :unit='space.unit' :itemtip='itemtip'></unit-items>
          <template v-if="side === 'left'">
            <combat-info v-if="combat && action === 'attacking'" type='active' :combat='combat'></combat-info>
            <unit-actions v-if="control === 'player'" :action='action' :unit='space.unit'></unit-actions>
          </template>
          <template v-else-if="side === 'right' && action === 'attacking'">
            <combat-info v-if='combat' type='target' :combat='combat'></combat-info>
            <target-actions v-if="control === 'player' && space"></target-actions>
          </template>
        </div>
      </transition>
    </div>
  `,
  props: ['side', 'space', 'action', 'combat', 'itemtip', 'control'],
  computed: {
    dynamicTransition: function () {
      if (this.space && this.space.unit && this.space.unit.condition === 'Defeated') { return 'sayGoodbye' }
      else { return 'fade' }
    }
  },
  components: {
    'terrain-info': TerrainInfo,
    'ground-info': GroundInfo,
    'unit-info': UnitInfo,
    'combat-info': CombatInfo,
    'unit-actions': UnitActions,
    'target-actions': TargetActions,
    'unit-items': UnitItems
  }
};

var EventDialog = {
  template: `
    <transition name='fade-slow'>
      <div class='event dialog'>
        <div class='content' :class='alignment'>
          <img v-if='event.portrait && event.alignLeft' class='portrait' :src='event.portrait' :title='event.subject'>
          <div :class='messageClass' :style='messageColor'>{{ event.message }}</div>
          <img v-if='event.portrait && !event.alignLeft' class='portrait flip' :src='event.portrait' :title='event.subject'>
        </div>
      </div>
    </transition>
  `,
  props: ['event'],
  computed: {
    alignment: function () {
      if (this.event.alignLeft) { return 'align-left' } else { return 'align-right' }
    },
    messageClass: function () {
      if (this.event.subject) { return 'message' } else { return 'tutorial' }
    },
    messageColor: function () {
      switch (this.event.faction) {
        case 'Player': return { background: '#ffe28c' };
        case 'Enemy': return { background: '#54c48c' };
      }
    }
  }
}

var EventAction = {
  template: `
    <transition name='fade-slow'>
      <div class='event action'>
        <div class='content' :style='contentStyle'>
          <img class='icon sprite' :src='event.subjectIcon'>
          <span class='bold sa'>{{ event.subject }}</span>
          <img v-if='event.verbIcon' class='icon' :src='event.verbIcon'>
          <span class='sa'>{{ event.verb }}</span>
          <img v-if='event.objectIcon' :class='objectIconClass' :src='event.objectIcon'>
          <span class='bold' :class='objectClass'>{{ event.object }}</span><span class='sa'>.</span>
          <span v-if='event.result' :class='resultClass'>{{ event.result }}</span>
        </div>
      </div>
    </transition>
  `,
  props: ['event'],
  computed: {
    contentStyle: function () {
      switch (this.event.activeTurn) {
        case 'Player': return { background: '#ffefbf' };
        case 'Enemy': return { background: '#a1e6c3' };
      }
    },
    objectIconClass: function () {
      return {
        icon: true,
        sprite: this.event.eventType === 'combat'
      }
    },
    objectClass: function () {
      var type = this.event.eventType,
          cond = this.event.object;
      return {
        healthy: type === 'condition' && cond === 'healthy',
        wounded: type === 'condition' && cond === 'wounded',
        critical: type === 'condition' && cond === 'critical',
        defeated: type === 'condition' && cond === 'defeated',
      }
    },
    resultClass: function () {
      var type = this.event.eventType,
          result = this.event.result;
      return {
        red: type === 'combat' && result === 'Critical hit!',
        debuff: type === 'condition'
      }
    }
  }
}

var EventSwitcher = {
  template: `
    <component :is='eventType' :event='event'></component>
  `,
  props: ['event'],
  computed: {
    eventType: function () {
      if (this.event.eventType === 'dialog') { return 'dialog-event' }
      else { return 'action-event' }
    }
  },
  components: {
    'dialog-event': EventDialog,
    'action-event': EventAction
  }
};

var EventLog = {
  template:`
    <div id='event-log'>
      <event-switcher v-for='(event, index) in events' :event='event' :key='index'></event-switcher>
    </div>
  `,
  props: ['events'],
  components: {
    'event-switcher': EventSwitcher
  }
};

var TopoControl = {
  template: `
    <div class='ui flex center'>
      <img class='icon' src='img/elevation-icon.png'>
      <span class='bold sa'>Elevation View</span>
      <div id='tgl-topoview' class='tgl-switch' :title='title' @click='toggleTopoView'>
        <div class='tgl-holder' :class='tglOn' :title='title'>
          <div class='tgl-slider' :class='tglOn' :title='title'>
            <span class='tgl-text' :class='tglOn' :title='title'>On</span>
            <div class='tgl-handle' :title='title'></div>
            <span class='tgl-text' :class='tglOn' :title='title'>Off</span>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['topoView'],
  data: function () {
    return {
      title: 'Toggle Elevation View (V)'
    }
  },
  computed: {
    tglOn: function () {
      return { 'tgl-on': this.topoView }
    }
  },
  methods: {
    toggleTopoView: function () {
      Game.topoView = !Game.topoView;
    }
  }
};

var StatusPanel = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='img/status-icon.png'>Status</p>
      <p>Turn: <b>{{ turn }}</b></p>
      <p>Faction: <b>{{ faction }}</b></p>
      <p>Units: <b>{{ units }}</b></p>
      <div v-if="control === 'player'" id='end-holder'>
        <img v-if='!action' id='btn-end' class='button' src='img/btn-end.png' title='End Turn' @click='endTurn'>
      </div>
    </div>
  `,
  props: ['turn', 'faction', 'control', 'units', 'action'],
  methods: {
    endTurn: function () {
      Game.endTurn();
    }
  }
};

var TurnBanner = {
  template: `
    <transition name='banner' @after-enter='bannerIn' @after-leave='bannerOut'>
      <div id='banner-back' class='banner' :style='bannerBack'>
        <div id='banner-fore' class='banner' :style='bannerFore'>
          <div id='banner-text' class='banner'>{{ faction.toUpperCase() }} TURN</div>
        </div>
      </div>
    </transition>
  `,
  props: ['faction'],
  computed: {
    bannerBack: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 191; g = 120; b = 19; break;
        case 'Enemy':  r = 0;   g = 63;  b = 31; break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    },
    bannerFore: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 230; g = 153; b = 0;  break;
        case 'Enemy':  r = 32;  g = 128; b = 80; break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    }
  },
  methods: {
    bannerIn: function () {
      Game.banner = false;
    },
    bannerOut: function () {
      Game.action = null;
    }
  }
};

var OutcomeBanner = {
  template:`
    <transition name='outcome'>
      <div class='screen'>
        <div class='outcome-holder'>
          <img class='outcome' :src="'img/' + outcome + '.png'">
          <img v-if="outcome === 'victory'" class='scene' src='img/victory.gif'>
        </div>
      </div>
    </transition>
  `,
  props: ['outcome']
};

// ========================================================================
//                               Vue Instance
// ========================================================================

var Game = new Vue ({
  el:'#game',
  data: {
    title: true,
    menu: 0,
    tutorial: true,
    mapImage: mapImage,
    map: loadLevel(),
    factions: loadFactions(),
    turn: 1,
    factionIndex: 0,
    unitIndex: 0,
    banner: false,
    action: 'waiting',
    active: null,
    target: null,
    shadows: null,
    itemtip: null,
    itemActions: {
      canEquip: false,
      canUse: false,
      canDrop: false
    },
    events: [],
    dialog: null,
    scrolled: false,
    scripts: null,
    checkpoint: 0,
    outcome: null,
    topoView: false,
    factorials: []
  },
  computed: {
    faction: function () {
      return this.factions[this.factionIndex];
    },
    control: function () {
      return unitPlan.filter( f => f.faction === this.faction )[0].control;
    },
    units: function () {
      return shuffle(this.getUnits(this.faction));
    },
    distance: function () {
      if (this.target) {
        return Math.abs(this.active.posY - this.target.posY) + Math.abs(this.active.posX - this.target.posX);
      }
    },
    combat: function () {
      if (this.active && this.target && this.active.unit && this.target.unit) {
        return {
          activeAtk: this.calculateAttack(this.active),
          activeDef: this.calculateDefense(this.active, this.target),
          targetAtk: this.calculateAttack(this.target),
          targetDef: this.calculateDefense(this.target, this.active),
          get activeHit() { return Math.round(Game.calculateHitChance(this.activeAtk, this.targetDef) * 100) },
          get targetHit() { return Math.round(Game.calculateHitChance(this.targetAtk, this.activeDef) * 100) },
          get activeCrt() { return Game.active.unit.sklSum },
          get targetCrt() { return Game.target.unit.sklSum },
          canCounter: this.inRange(this.distance, this.target.unit.range)
        }
      }
    },
    status: function () {
      return {
        activeY: this.active ? this.active.posY : null,
        activeX: this.active ? this.active.posX : null,
        topoView: this.topoView
      };
    }
  },
  watch: {
    events: function () {
      Vue.nextTick(function(){
        Game.scrollEventLog();
        Game.moveTriangle(true);
      });
    }
  },
  methods: {
    
// ---------------------------{  Title Screen  }---------------------------

    menuNav: function (forward) {
      var options = $( '.option' ).length;
      if (forward) {
        if (this.menu === options - 1) { this.menu = 0 }
        else { this.menu += 1 }
      } else {
        if (this.menu === 0 ) { this.menu = options - 1 }
        else { this.menu -= 1 }
      }
    },
    turnOffHints: function (scripts) {
      for (var script of scripts) {
        if (script.dialog) {
          script.dialog = script.dialog.filter( el => typeof(el) === 'function' || el.unit );
        }
      }
      scripts[0].dialog.splice(4, 1);
      scripts[6].dialog.splice(0, 1);
      this.scripts = scripts;
    },

// ----------------------------{  Executive  }-----------------------------
    
    beginMove: function () {
      if (this.action) { this.cancelAction() }
      var unit = this.active.unit;
      this.target = null;
      this.action = 'moving';
      Vue.nextTick(function(){
        Game.showMoveRange(unit.posY, unit.posX, unit.movesLeft, '');
        Game.preventCollision();
      });
    },
    beginAttack: function () {
      if (this.action) { this.cancelAction() }
      var unit = this.active.unit;
      this.target = null;
      this.action = 'attacking';
      Vue.nextTick(function(){
        Game.showAttackRange(unit.posY, unit.posX, unit.range);
      });
    },
    beginEquip: function () {
      if (this.action) { this.cancelAction() }
      this.action = 'equipping';
      Vue.nextTick(function(){
        Game.makeEquipItemsDraggable('.equip');
        Game.makeGroundItemsDraggable('.ground');
      });
    },
    checkRanges: function (unit) {
      if (this.action) { this.cancelAction() }
      if (!unit) { unit = this.active.unit }
      this.action = 'checking';
      this.showMoveRange(unit.posY, unit.posX, unit.movesLeft, '');
      this.preventCollision();
      this.findSpacesInMoveRange(unit).forEach( function (s) {
        Game.showAttackRange(s.posY, s.posX, s.range);
      });
      this.map[unit.posY][unit.posX].distance = null;
    },
    checkEquip: function () {
      if (this.action) { this.cancelAction() }
      this.action = 'equipping';
    },
    cancelAction: function () {
      switch (this.action) {
        case 'moving': this.cancelMove(); break;
        case 'attacking': this.cancelAttack(); break;
        case 'equipping': this.cancelEquip(); break;
        case 'checking': this.cancelCheck(); break;
      }
    },
    cancelMove: function () {
      this.hideMoveRange();
      this.action = null;
    },
    cancelAttack: function () {
      this.hideAttackRange();
      this.action = null;
      this.target = null;
      this.shadows = null;
    },
    cancelEquip: function () {
      this.action = null;
      this.itemtip = null;
    },
    cancelCheck: function () {
      this.hideEverything();
      this.action = null;
      this.shadows = null;
    },
    
// -----------------------------{  Movement  }-----------------------------
    
    showMoveRange: function (y, x, moves, path) {
      var origin = this.map[y][x],
          east = this.map[y][Math.min(x + 1, 15)], eastMoves = moves - east.terrain.cost, eastPath = path + 'e',
          sout = this.map[Math.min(y + 1, 15)][x], soutMoves = moves - sout.terrain.cost, soutPath = path + 's',
          west = this.map[y][Math.max(x - 1, 0)],  westMoves = moves - west.terrain.cost, westPath = path + 'w',
          nort = this.map[Math.max(y - 1, 0)][x],  nortMoves = moves - nort.terrain.cost, nortPath = path + 'n',
          explore = [],
          goEast = function () { Game.showMoveRange(y, Math.min(x + 1, 15), eastMoves, eastPath) },
          goSout = function () { Game.showMoveRange(Math.min(y + 1, 15), x, soutMoves, soutPath) },
          goWest = function () { Game.showMoveRange(y, Math.max(x - 1, 0),  westMoves, westPath) },
          goNort = function () { Game.showMoveRange(Math.max(y - 1, 0), x,  nortMoves, nortPath) };
      if (!origin.moves) { origin.moves = moves }
      if (this.canMove(origin, east, moves)) { east.moves = eastMoves; east.path = eastPath; explore.push(goEast) }
      if (this.canMove(origin, sout, moves)) { sout.moves = soutMoves; sout.path = soutPath; explore.push(goSout) }
      if (this.canMove(origin, west, moves)) { west.moves = westMoves; west.path = westPath; explore.push(goWest) }
      if (this.canMove(origin, nort, moves)) { nort.moves = nortMoves; nort.path = nortPath; explore.push(goNort) }
      shuffle(explore).forEach( function (f) { f(); } );
    },
    canMove: function (from, to, moves) {
      return Math.abs(from.terrain.elevation - to.terrain.elevation) <= 1
          && to.terrain.cost <= moves
          && (!to.moves || moves - to.terrain.cost > to.moves)
          && (to.unit === null || to.unit.friendly)
    },
    preventCollision: function () {
      for (u of this.getUnits(this.faction)) {
        this.map[u.posY][u.posX].moves = null;
        this.map[u.posY][u.posX].path = null;
      }
    },
    hideMoveRange: function () {
      var y, x,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          moves = this.active.unit.movesLeft;
      for (y = Math.max(posY - moves, 0); y <= Math.min(posY + moves, 15); y++) {
        for (x = Math.max(posX - moves, 0); x <= Math.min(posX + moves, 15); x++) {
          this.map[y][x].moves = null;
          this.map[y][x].path = null;
        }
      }
    },
    moveUnit: function (y, x, path) {
      var from = this.map[y][x], unit,
          moveData = { y: y, x: x, moving: null, changePos: null },
          active = this.active ? true : false,
          to, unitData;
      if (path) {
        if (active) { this.hideMoveRange() }
        this.map[y][x].unit.path = path;
      }
      if (from.unit2) { unit = from.unit2 } else { unit = from.unit }
      switch (unit.path[0]) {
        case 'e':
          moveData.x = x + 1;
          moveData.moving = 'east';
          moveData.changePos = function () { unitData.posX += 1 };
          break;
        case 's':
          moveData.y = y + 1;
          moveData.moving = 'south';
          moveData.changePos = function () { unitData.posY += 1 };
          break;
        case 'w':
          moveData.x = x - 1;
          moveData.moving = 'west';
          moveData.changePos = function () { unitData.posX -= 1 };
          break;
        case 'n':
          moveData.y = y - 1;
          moveData.moving = 'north';
          moveData.changePos = function () { unitData.posY -= 1 };
          break;
      }
      to = this.map[moveData.y][moveData.x];
      if (from.unit2) { unitData = from.unit2; from.unit2 = null; }
      else { unitData = from.unit; from.unit = null; }
      unitData.path = unitData.path.substr(1);
      unitData.moving = moveData.moving;
      if (unitData.moving === 'east' || unitData.moving === 'west') { unitData.facing = unitData.moving }
      if (active) { unitData.movesUsed += to.terrain.cost }
      moveData.changePos();
      if (!to.unit) { to.unit = unitData } else { to.unit2 = unitData }
      if (active) { this.active = to }
    },
    
// ------------------------------{  Combat  }------------------------------
    
    showAttackRange: function (posY, posX, range) {
      var inRange = this.findSpacesInAttackRange(posY, posX, range);
      this.shadows = [new Shadow(0, -Math.PI, Math.PI, -0.75, 0.5)];
      for (var r = 1; r <= range[1]; r++) {
        inRange.filter( s => s.dist === r ).forEach( function (s) {
          var y = s.posY, x = s.posX, d = s.dist,
              space = Game.map[y][x], terrain = space.terrain;
          Game.castSquareShadow(posY, posX, y, x, d, terrain.elevation / 2);
          if (terrain.height > 0) {
            switch (terrain.shape) {
              case 'square': Game.castSquareShadow(posY, posX, y, x, d, space.posZ); break;
              case 'circle': Game.castCircularShadow(posY, posX, y, x, d, space.posZ); break;
            }
          }
          Game.findLineOfSight(posY, posX, y, x, d);
        });
      }
    },
    findSpacesInAttackRange: function (posY, posX, range) {
      var y, x, distance, inRange = [];
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          distance = Math.abs(y - posY) + Math.abs(x - posX);
          if (distance > 0 && distance <= range[1]) { inRange.push({ posY: y, posX: x, dist: distance}) }
        }
      }
      return inRange;
    },
    castSquareShadow: function (aY, aX, y, x, d, z) {
      var yDist = y - aY, xDist = x - aX,
          edges = this.findSquareShadowEdges(aY, aX, y, x),
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          vDist = z - (this.active.terrain.elevation / 2 + 0.75),
          hAng1, hAng2;
      if      (vDist > 0) { hDist -= 0.5; d -= 1 }
      else if (vDist < 0) { hDist += 0.5 }
      hAng1 = Math.atan2(edges[1].Y - aY, edges[1].X - aX);
      hAng2 = Math.atan2(edges[2].Y - aY, edges[2].X - aX);
      this.shadows.push(new Shadow(d, hAng1, hAng2, vDist, hDist));
    },
    findSquareShadowEdges: function (aY, aX, y, x) {
      var e1, e2,
          a = { Y: y - 0.5, X: x - 0.5 }, // top left corner
          b = { Y: y - 0.5, X: x + 0.5 }, // top right corner
          c = { Y: y + 0.5, X: x - 0.5 }, // bottom left corner
          d = { Y: y + 0.5, X: x + 0.5 }; // bottom right corner
      if (y < aY) {
        if (x < aX)      { e1 = c; e2 = b; }
        else if (x > aX) { e1 = a; e2 = d; }
        else             { e1 = c; e2 = d; }
      }
      else if (y > aY) {
        if (x < aX)      { e1 = d; e2 = a; }
        else if (x > aX) { e1 = b; e2 = c; }
        else             { e1 = b; e2 = a; }
      }
      else {
        if (x < aX) { e1 = d; e2 = b; }
        else        { e1 = a; e2 = c; }
      }
      return { 1: e1, 2: e2 };
    },
    castCircularShadow: function (aY, aX, y, x, d, z) {
      var yDist = y - aY, xDist = x - aX,
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          hAng = Math.atan2(yDist, xDist),
          hWidth = Math.asin(0.5 / hDist),
          vDist = z - (this.active.terrain.elevation / 2 + 0.75),
          hAng1, hAng2;
      if      (vDist > 0) { hDist -= 0.5; d -= 1 }
      else if (vDist < 0) { hDist += 0.5 }
      hAng1 = hAng - hWidth; if (hAng1 < -Math.PI) { hAng1 += Math.PI * 2 }
      hAng2 = hAng + hWidth; if (hAng2 > Math.PI) { hAng2 -= Math.PI * 2 }
      this.shadows.push(new Shadow(d, hAng1, hAng2, vDist, hDist));
    },
    findLineOfSight: function (aY, aX, y, x, d) {
      var from = this.map[aY][aX], to = this.map[y][x],
          range = this.action === 'checking' ? this.active.unit.maxRange : this.active.unit.range,
          yDist = y - aY, xDist = x - aX,
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          vDist = to.terrain.elevation / 2 - from.terrain.elevation / 2,
          hAng = Math.atan2(yDist, xDist),
          vAng = Math.atan2(vDist, hDist),
          hAngDiff = Math.atan2(1, 2) - Math.atan2(0.5, 1.5),
          hAngCheck, vAngCheck,
          shadows = this.shadows.filter( function (s) {
            if (s.hAng1 < 0 || s.hAng2 > 0) { hAngCheck = hAng > s.hAng1 && hAng < s.hAng2 }
            else                            { hAngCheck = hAng > s.hAng1 || hAng < s.hAng2 }
            if (Math.abs(hAng - s.hAng1) > hAngDiff && Math.abs(hAng - s.hAng2) > hAngDiff)
                 { vAngCheck = vAng < s.vAng }
            else { vAngCheck = vAng < s.vAngAdj }
            return s.dist < d && hAngCheck && vAngCheck;
          });
      if (shadows.length === 0 && this.canAttack(from, to, range)) {
        this.map[y][x].distance = Math.abs(yDist) + Math.abs(xDist);
      }
    },
    canAttack: function (from, to, range) {
      var hDiff = Math.abs(to.posY - from.posY) + Math.abs(to.posX - from.posX),
          vDiff = to.terrain.elevation / 2 - from.terrain.elevation / 2;
      if (range[1] <= 1) {
        return hDiff >= range[0] && hDiff <= range[1] && Math.abs(vDiff) <= range[1];
      } else {
        return hDiff >= range[0] && hDiff <= range[1] && vDiff <= range[1];
      }
    },
    hideAttackRange: function (targetY, targetX) {
      var y, x,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          this.map[y][x].distance = null;
        }
      }
    },
    targetUnit: function (y, x) {
      var active = this.active.unit,
          target = this.map[y][x];
      if (!target.distance) {
        target.distance = Math.abs(y - active.posY) + Math.abs(x - active.posX);
      }
      if (!this.inRange(target.distance, target.unit.range)) {
        for (var weapon of target.unit.weapons) {
          if (this.inRange(target.distance, target.unit.findWeaponRange(weapon.id))) {
            this.map[y][x].unit.equipWeapon(weapon.id);
            break;
          }
        }
      }
      this.target = this.map[y][x];
    },
    inRange: function (distance, range) {
      if (distance >= range[0] && distance <= range[1]) { return true }
      else { return false }
    },
    calculateAttack: function (atkSpace) {
      // attack = strength + skill + power - distance
      var attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          attack = 0;
      if (attackType === 'melee' || attackType === 'throwing') { attack += attacker.strSum }
      attack += attacker.sklSum + attacker.equipped.power - (this.distance - 1);
      return attack;
    },
    calculateDefense: function (defSpace, atkSpace) {
      // defense = agility + toughness + armor + cover + elevation
      var defender = defSpace.unit,
          attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          cover = defSpace.terrain.cover,
          facing = defSpace.terrain.facing,
          defense = 0;
      if (attackType === 'melee' || attackType === 'throwing') { defense += defender.agiSum }
      defense += defender.tghSum + defender.armor;
      if (!facing) { defense += cover }
      else {
        switch (facing) {
          case 'East':  if (attacker.posX > defender.posX) { defense += cover } break;
          case 'South': if (attacker.posY > defender.posY) { defense += cover } break;
          case 'West':  if (attacker.posX < defender.posX) { defense += cover } break;
          case 'North': if (attacker.posY < defender.posY) { defense += cover } break;
        }
      }
      defense += Math.max(defSpace.terrain.elevation - atkSpace.terrain.elevation, 0);
      return defense;
    },
    factorial: function (n) {
      if (typeof(this.factorials[n]) !== 'undefined') { return this.factorials[n] }
      var ans = 1;
      for (var i = 2; i <= n; i++) {
        ans *= i;
      }
      return this.factorials[n] = ans;
    },
    calculateHitChance: function (atk, def) {
      if (atk <= 0) { return 0 }
      if (def < 0) { def = 0 }
      let x = 0, sum = 0,
          headsInFlips = (x, n) => this.factorial(n) / ( Math.pow(2,n) * this.factorial(x) * this.factorial(n - x) ),
          successRate = function (x, atk) {
            let sum = 0;
            while (x + 1 <= atk) {
              sum += headsInFlips(x + 1, atk);
              x++;
            }
            return sum;
          };
      while (x <= def) {
        sum += headsInFlips(x, def) * successRate(x, atk);
        x++;
      }
      return sum;
    },
    attackUnit: function (counter) {
      var attacker, defender, hitChance, crtChance, damage = 0;
      if (!counter) {
        this.map[this.target.posY][this.target.posX].distance = null;
        attacker = this.active.unit;
        defender = this.target.unit;
        hitChance = this.combat.activeHit;
        crtChance = this.combat.activeCrt;
      } else {
        attacker = this.target.unit;
        defender = this.active.unit;
        hitChance = this.combat.targetHit;
        crtChance = this.combat.targetCrt;
      }
      if (Math.random()*100 <= hitChance) {
        damage += 1;
        if (Math.random()*100 <= crtChance) {
          damage += 1;
        }
      }
      this.animateCombat(attacker, defender, damage);
      window.setTimeout(function(){
        Game.events.push(new CombatEvent(attacker, defender, damage, Game.faction, counter));
        if (damage > 0) {
          Game.dealDamage(defender.posY, defender.posX, damage);
          Game.events.push(new ConditionEvent(defender, Game.faction));
        }
      }, 250);
      window.setTimeout(function(){
        if (!counter && Game.combat.canCounter && defender.hp > 0) {
          Game.attackUnit(true);
        } else {
          Game.endAttack();
        }
      }, 500);
    },
    animateCombat: function (attacker, defender, damage) {
      var spacesY, spacesX, attackerFacing, defenderFacing, pixelsY, pixelsX, evadeSprite, attack, hit, defenderElement;
      spacesY = defender.posY - attacker.posY;
      spacesX = defender.posX - attacker.posX;
      switch (Math.sign(spacesX)) {
        case 1:  attackerFacing = 'east'; defenderFacing = 'west'; break;
        case -1: attackerFacing = 'west'; defenderFacing = 'east'; break;
      }
      this.map[attacker.posY][attacker.posX].unit.facing = attackerFacing;
      this.map[defender.posY][defender.posX].unit.facing = defenderFacing;
      pixelsY = Math.round(16 * Math.sin(Math.atan2(spacesY, spacesX)));
      pixelsX = Math.round(16 * Math.cos(Math.atan2(spacesY, spacesX)));
      evadeSprite = "url('img/" + defender.id.replace(/\d/, '') + "-evade.png')";
      attack = {
        keyframes: {
          zIndex: [ 70, 70 ],
          top: [0, (pixelsY + 'px'), 0 ],
          left: [0, (pixelsX + 'px'), 0 ]
        },
        options: {
          duration: 500,
          easing: 'ease-in-out'
        }
      };
      hit = {
        keyframes: {
          top: [0, (pixelsY / 3 + 'px'), 0 ],
          left: [0, (pixelsX / 3 + 'px'), 0 ]
        },
        options: {
          duration: 250,
          easing: 'ease-in-out'
        }
      };
      document.getElementById(attacker.id).animate(attack.keyframes, attack.options);
      defenderElement = document.getElementById(defender.id);
      if (damage > 0) {
        window.setTimeout(function(){
          defenderElement.animate(hit.keyframes, hit.options);
          defenderElement.firstElementChild.animate({ x: ['-64', '-64'] }, 250);
        }, 250);
      } else {
        window.setTimeout(function(){
          defenderElement.firstElementChild.animate({ x: ['-32', '-32'] }, 350);
        }, 150);
      }
    },
    dealDamage: function (y, x, damage) {
      this.map[y][x].unit.sustainDamage(damage);
      Vue.nextTick(function(){
        if (Game.map[y][x].unit.hp === 0) {
          window.setTimeout(function(){
            Game.dialog = Game.map[y][x].unit.goodbye;
            Game.advanceDialog();
          }, 500);
        }
      });
    },
    terminateUnit: function (y, x) {
      var space = this.map[y][x], item;
      space.unit.unequipWeapon();
      while (space.unit.items.length) {
        item = space.unit.items.shift();
        space.items.push(item);
        this.events.push(new ItemEvent(space.unit, 'dropped', item, Game.faction));
      }
      space.items.sort(this.compareItems);
      this.map[y][x].unit = null;
      this.action = null;
    },
    endAttack: function () {
      var unit = this.active.unit;
      if (unit) { this.map[unit.posY][unit.posX].unit.attacksUsed += 1 }
      this.action = null;
      this.shadows = null;
    },
    
// ----------------------------{  Equipment  }-----------------------------
    
    makeEquipItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        var itemSrc = item.src.match(/img\/.*\.png/)[0],
            cursorOffset = Game.findCursorOffset(itemSrc),
            helperSrc = itemSrc.replace(/\d/, ''),
            helperImg = $( '<img>', { src: helperSrc } ),
            helperDiv = $( '<div id="helper"></div>' ),
            itemClass = '.' + item.classList[3];
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: cursorOffset,
          helper: function(){ return helperDiv.append(helperImg) },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            $( itemClass ).hide();
            var slotId = event.target.parentNode.id;
            Game.findDroppableSlots(item.classList[1], slotId.slice(0, -1), event.target.id.slice(0, -2), Number(slotId.slice(-1)));
            Game.makePanelsDroppable();
          },
          stop: function (event, ui) {
            $( itemClass ).show();
            $( '.ui-droppable' ).droppable( 'destroy' );
          }
        });
      });
    },
    findCursorOffset: function (src) {
      if (src.match(/\d/)) {
        switch (Number(src.match(/\d/)[0])) {
          case 0: return { top: 16, left: 16 }
          case 1: return { top: 16, left: 48 }
          case 2: return { top: 48, left: 16 }
          case 3: return { top: 48, left: 48 }
          case 4: return { top: 80, left: 16 }
          case 5: return { top: 80, left: 48 }
        }
      } else { return { top: 16, left: 16 } }
    },
    makePanelsDroppable: function () {
      var dragover = function (src, style, id) {
            $( '#helper' ).prepend($( '<img>', { src: src, style: style } ));
            $( '#helper' ).css( 'cursor', 'none' );
            var cursorAt = $( '#' + id ).draggable( 'option', 'cursorAt' ),
                helperAt = {
                  top: Math.round(Number($( '#helper' ).css( 'height' ).slice(0, -2))) / 2,
                  left: Math.round(Number($( '#helper' ).css( 'width' ).slice(0, -2))) / 2
                },
                y = cursorAt.top - helperAt.top,
                x = cursorAt.left - helperAt.left;
            $( '#helper *' ).css({ 'top': y + 'px', 'left': x + 'px' });
          },
          dragout = function () {
            $( '#helper img:first-child' ).remove();
            $( '#helper' ).css( 'cursor', '' );
            $( '#helper *' ).css({ 'top': '', 'left': '' });
          }
      $( '.unit-info' ).droppable({
        accept: '.weapon, .usable',
        classes: {
          'ui-droppable-active': 'drop-zone',
          'ui-droppable-hover': 'drop-hover'
        },
        tolerance: 'pointer',
        over: function (event, ui) {
          var itemType = ui.draggable[0].classList[2],
              src, style = 'margin-right: 5px';
          if (itemType === 'weapon') { src = 'img/equip-button.png' }
          else if (itemType === 'accessory') { src = 'img/use-button.png' }
          Vue.nextTick(function(){ dragover(src, style, ui.draggable[0].id) });
        },
        out: function (event, ui) { dragout() },
        drop: function (event, ui) {
          dragout();
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemType = ui.draggable[0].classList[2],
              itemId = ui.draggable[0].id.slice(0, -2);
          if (itemType === 'weapon') {
            Game.map[y][x].unit.equipWeapon(itemId);
          }
          else if (itemType === 'accessory') {
            var unit = Game.active.unit, oldHp = unit.hp,
                item = unit.items.filter( i => i.id === itemId )[0];
            Game.map[y][x].unit.useItem(itemId);
            Game.events.push(new ItemEvent(unit, 'used', item, Game.faction));
            if (unit.hp !== oldHp) { Game.events.push(new ConditionEvent(unit, Game.faction)) }
          }
        }
      });
      $( '#top-center' ).droppable({
        tolerance: 'pointer',
        over: function (event, ui) { dragover('img/drop-button.png', 'margin-right: 5px', ui.draggable[0].id) },
        out: function (event, ui) { dragout() },
        drop: function (event, ui) {
          dragout();
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemList = Game.map[y][x].unit.items,
              itemId = ui.draggable[0].id.slice(0, -2),
              itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
              item = Game.map[y][x].unit.items.splice(itemIndex, 1)[0];
          item.slots = null;
          Game.map[y][x].items.push(item);
          Game.map[y][x].items.sort(Game.compareItems);
          Game.events.push(new ItemEvent(Game.active.unit, 'dropped', item, Game.faction));
          Vue.nextTick(function(){ Game.makeGroundItemsDraggable('#' + itemId) });
        }
      });
    },
    compareItems: function (a, b) {
      if (a.index < b.index) { return -1 }
      if (a.index > b.index) { return 1 }
      if (a.index === b.index) {
        if (a.id < b.id) { return -1 }
        if (a.id > b.id) { return 1 }
      }
      return 0;
    },
    makeGroundItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: { top: 16, left: 16 },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            Game.findDroppableSlots(item.classList[1], item.classList[2], item.id);
            $( '#top-center' ).css( 'overflow', 'visible' );
          },
          stop: function (event, ui) {
            $( '.ui-droppable' ).droppable( 'destroy' );
            $( '#top-center' ).css( 'overflow', 'hidden' );
          }
        });
      });
    },
    findDroppableSlots: function (itemStatus, itemType, itemId, slotNum) {
      var itemList = this.active.unit[this.convertItemType(itemType)],
          itemMap = [null, null, null, null, null, null],
          itemFootprint, itemIndex,
          slots = [0, 1, 2, 3, 4, 5],
          cinderella, // does the foot (item) fit the shoe (slot)?
          droppables = [];
      for (item of itemList) {
        for (slot of item.slots) {
          itemMap[slot] = item.id;
        }
      }
      if (itemStatus === 'equip') {
        itemFootprint = [];
        slots.filter(s => s !== slotNum);
        itemMap.forEach( function (slot, index) {
          if (slot === itemId) {
            itemFootprint.push(index - slotNum);
            itemMap[index] = null;
          }
        });
      } else if (itemStatus === 'ground') {
        itemIndex = this.active.items.indexOf(this.active.items.filter( i => i.id === itemId )[0]);
        itemFootprint = this.active.items[itemIndex].footprint;
      }
      for (slot of slots) {
        cinderella = true;
        for (toe of itemFootprint) {
          if (itemMap[slot + toe] !== null) { cinderella = false; }
        }
        if (cinderella) { droppables.push(itemType + slot) }
      }
      droppables = droppables.map( s => '#' + s ).join(',');
      this.makeSlotsDroppable(itemStatus, droppables);
    },
    convertItemType: function (itemType) {
      switch (itemType) {
        case 'weapon': return 'weapons';
        case 'clothing': return 'clothing';
        case 'accessory': return 'accessories';
      }
    },
    makeSlotsDroppable: function (draggable, droppables) {
      if (draggable === 'equip') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemList = Game.map[y][x].unit.items,
                itemId = ui.draggable[0].id.slice(0, -2),
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                itemSlots = itemList[itemIndex].slots,
                translation = Number(event.target.id.slice(-1)) - Number(ui.draggable[0].id.slice(-1)),
                itemString = itemSlots.map( s => '#' + itemId + '-' + (s + translation) ).join(',');
            Game.map[y][x].unit.items[itemIndex].slots = [];
            Vue.nextTick(function(){
              Game.map[y][x].unit.items[itemIndex].slots = itemSlots.map( s => s + translation );
              Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
            });
          }
        });
      } else if (draggable === 'ground') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemList = Game.active.items,
                itemId = ui.draggable[0].id,
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                item = Game.map[y][x].items.splice(itemIndex, 1)[0],
                itemString;
            item.slots = item.footprint.map( toe => toe + Number(event.target.id.slice(-1)));
            itemString = item.slots.map( s => '#' + itemId + '-' + s ).join(',');
            Game.map[y][x].unit.items.push(item);
            Game.map[y][x].unit.items.sort(Game.compareItems);
            Game.events.push(new ItemEvent(Game.active.unit, 'picked up', item, Game.faction));
            Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
          }
        });
      }
    },
    
// --------------------------{  Range Checking  }--------------------------
    
    findSpacesInMoveRange: function (unit) {
      var y, x,
          posY = unit.posY,
          posX = unit.posX,
          moves = unit.movesLeft,
          range = unit.maxRange,
          inRange = [{ posY: posY, posX: posX, range: range }];
      for (y = Math.max(posY - moves, 0); y <= Math.min(posY + moves, 15); y++) {
        for (x = Math.max(posX - moves, 0); x <= Math.min(posX + moves, 15); x++) {
          if (this.map[y][x].path) { inRange.push({ posY: y, posX: x, range: range }) }
        }
      }
      return inRange;
    },
    hideEverything: function () {
      for (var row of this.map) {
        for (var space of row) {
          space.hideEverything();
        }
      }
    },
    
// ---------------------{  Artificial Intelligence  }----------------------
    
    getUnits: function (faction) {
      var units = [];
      for (var row of this.map) {
        for (var space of row) {
          if (space.unit && space.unit.faction === faction) { units.push(space.unit) }
        }
      }
      return units;
    },
    getUnit: function (id) {
      for (var row of this.map) {
        for (var space of row) {
          if (space.unit && space.unit.id === id) { return space.unit }
        }
      }
      return null;
    },
    runScripts: function () {
      this.scripts.forEach( function (script) {
        if (script.trigger()) {
          script.effect();
          script.runsLeft -= 1;
        }
      });
      this.scripts = this.scripts.filter( s => s.runsLeft > 0 );
      if (this.dialog && this.dialog.length > 0) { this.advanceDialog() }
      else { this.beginTurn() }
    },
    beginTurn: function () {
      if (this.units.length) {
        for (unit of this.units) {
          this.applyTerrainEffects(unit);
          unit.resetActionPoints();
        }
        this.banner = true;
        this.action = 'waiting';
        if (this.control === 'ai') {
          window.setTimeout(function(){ Game.aiFaction() }, 2000);
        }
      }
      else { this.endTurn() }
    },
    applyTerrainEffects: function (u) {
      var space = this.map[u.posY][u.posX],
          effects = space.terrain.effects,
          unit = space.unit,
          oldHp = unit.hp;
      if (effects) {
        for (var effect in effects) {
          unit[effect](effects[effect]);
        }
      }
      if (unit.hp !== oldHp) { Game.events.push(new ConditionEvent(unit, Game.faction)) }
    },
    aiFaction: function () {
      var unitFunc;
      if (this.unitIndex < this.units.length) {
        switch (this.units[this.unitIndex].behavior) {
          case 'dumb': unitFunc = this.aiUnitDumb; break;
          case 'sentry': unitFunc = this.aiUnitSentry; break;
        }
        window.setTimeout(function(){ unitFunc() }, 500);
      } else {
        this.unitIndex = 0;
        this.endTurn();
      }
    },
    aiUnitDumb: function () {
      window.setTimeout(function(){ Game.aiPassControl() }, 500);
    },
    aiUnitSentry: function () {
      var unit = this.units[this.unitIndex];
      this.active = this.map[unit.posY][unit.posX];
      window.setTimeout(function(){ Game.aiChooseTarget(unit.posY, unit.posX) }, 500);
      window.setTimeout(function(){
        if (Game.target) {
          Game.action = 'attacking';
          Game.attackUnit();
          window.setTimeout(function(){
            var delay;
            if (Game.active.unit && Game.target.unit && Game.active.unit.hp !== 0 && Game.target.unit.hp !== 0) { delay = 500 }
            else { delay = 2000 }
            window.setTimeout(function(){ Game.aiPassControl() }, delay);
          }, 1000);
        } else {
          Game.aiPassControl();
        }
      }, 1000);
    },
    aiChooseTarget: function (posY, posX) {
      var y, x, range, targets = [],
          unit = this.map[posY][posX].unit,
          equipped = unit.equipped.id;
      for (var weapon of unit.weapons) {
        unit.equipWeapon(weapon.id);
        range = unit.range;
        this.showAttackRange(posY, posX, range);
        for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
          for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
            space = this.map[y][x];
            if (space.distance && space.unit && space.unit.friendly !== this.active.unit.friendly) {
              this.targetUnit(y, x);
              targets.push({ weapon: weapon.id, posY: y, posX: x, hit: this.combat.activeHit });
            }
          }
        }
        this.hideAttackRange();
      }
      if (targets.length) {
        target = targets.reduce(function(a, b){ if (b.hit > a.hit) { return b } else { return a } });
        unit.equipWeapon(target.weapon);
        this.targetUnit(target.posY, target.posX);
      } else {
        unit.equipWeapon(equipped);
        this.cancelAttack();
      }
    },
    aiPassControl: function () {
      this.unitIndex += 1;
      this.aiFaction();
    },
    endTurn: function () {
      if (this.factionIndex < this.factions.length - 1) {
        this.factionIndex += 1;
      } else {
        this.turn += 1;
        this.factionIndex = 0;
      }
      this.action = null;
      this.active = null;
      this.target = null;
      this.runScripts();
    },
    spawnUnit: function (unit, y, x, moving, prevent) {
      unit.posY = y;
      unit.posX = x;
      unit.moving = moving;
      if (moving === 'east' || moving === 'west') { unit.facing = moving }
      this.map[y][x].unit = unit;
      if (!prevent) { window.setTimeout(function(){ Game.advanceDialog() }, 1000) }
    },
    setGoal: function (y, x, prevent) {
      this.map[y][x].goal = !this.map[y][x].goal;
      if (!prevent) { window.setTimeout(function(){ Game.advanceDialog() }, 1000) }
    },
    
// ----------------------------{  Event Log  }-----------------------------
    
    advanceDialog: function () {
      var prev, next, alignLeft;
      if (this.dialog && this.dialog.length > 0) {
        next = this.dialog.shift();
        if (typeof(next) === 'object') {
          if (this.events.length === 0 || !next.unit) { alignLeft = true }
          else if (typeof next.alignLeft !== 'undefined') { alignLeft = next.alignLeft }
          else {
            prev = this.events[this.events.length - 1];
            if (prev.eventType === 'dialog') {
              if (next.unit.name === prev.subject) { alignLeft = prev.alignLeft }
              else { alignLeft = !prev.alignLeft }
            }
            else { alignLeft = true }
          }
          this.events.push(new DialogEvent(next.unit, next.message, alignLeft));
          this.action = 'waiting';
        } else
        if (typeof(next) === 'function') {
          this.moveTriangle();
          window.setTimeout(function(){ next() }, 500);
        }
      }
    },
    scrollEventLog: function () {
      var events = this.events, index, scrollTo, posY;
      if (events[events.length - 1].eventType === 'dialog') {
        if (events.length === 1) { index = 0 }
        else if (events[events.length - 2].eventType !== 'dialog') { index = events.length - 1 }
        else { index = events.length - 2 }
      } else {
        var i = 1;
        while (events[events.length - (i + 1)].eventType !== 'dialog' && i < 8) {
          i++;
        }
        index = events.length - i;
      }
      scrollTo = document.getElementsByClassName('event')[index];
      switch (scrollTo.classList[1]) {
        case 'dialog': posY = scrollTo.offsetTop - 18; break;
        case 'action': posY = scrollTo.offsetTop - 5; break;
      }
      document.getElementById('bottom-center').scrollTop = posY;
      window.setTimeout(function(){
        Game.scrolled = false;
        Game.addFadeClasses(1);
      }, 1);
    },
    addFadeClasses: function (i) {
      var event = $( '.event:nth-last-child(' + i + ')' );
      if (i <= 9 && event.hasClass( 'action' )) {
        this.removeFadeClasses(event);
        event.addClass( 'fade' + i );
        this.addFadeClasses(i + 1);
      }
    },
    removeFadeClasses: function ( selector ) {
      $( selector ).removeClass( 'fade1 fade2 fade3 fade4 fade5 fade6 fade7 fade8 fade9' );
    },
    moveTriangle: function (replace) {
      var triangle, events = this.events;
      if ($( '#triangle' ).length) {
        triangle = $( '#triangle' ).detach();
      } else {
        triangle = $( '<img>', { id: 'triangle', src: 'img/advance-dialog.gif' } );
      }
      if (events.length && events[events.length - 1].eventType === 'dialog' && replace) {
        $( '.event' ).filter( ':last' ).find( '.message,.tutorial' ).append( triangle );
      }
    },
    scrollHandler: function () {
      if (!this.scrolled) {
        this.removeFadeClasses('.event');
        this.scrolled = true;
      }
    }
  },
  components: {
    'title-screen': TitleScreen,
    'row': Row,
    'side-panel': SidePanel,
    'ground-panel': GroundPanel,
    'event-log': EventLog,
    'topo-control': TopoControl,
    'status-panel': StatusPanel,
    'turn-banner': TurnBanner,
    'outcome-banner': OutcomeBanner
  }
});

// ------------------------{  Dialog & Scripting  }------------------------

class Script {
  constructor(trigger, dialog, effect, runsLeft) {
    this.trigger = trigger;
    this.dialog = dialog;
    if (this.dialog) {
      this.effect = function(){ Game.dialog = this.dialog };
    } else {
      this.effect = effect;
    }
    if (runsLeft) { this.runsLeft = runsLeft }
    else { this.runsLeft = 1 }
  }
}

// Player Turn 1

var script0 = new Script(
      function(){ return Game.turn === 1 && Game.faction === 'Player' },
      [
        function(){ Game.spawnUnit(player0, 15, 2, 'north') },
        {
          unit: player0,
          message: "Sun's getting low. Time to start looking for somewhere to spend the night."
        },
        {
          unit: player0,
          message: "Oooh, that smell... Someone's got a stew on. I wonder where it's coming from."
        },
        {
          unit: player0,
          message: "Is that a house through those trees? Maybe I could rent a room."
        },
        function(){ Game.setGoal(14, 15) },
        {
          unit: null,
          message: "Help Lizzie reach the highlighted space. To move: select a unit, press M, then click where you want to go. Once you've moved all your units, end your turn by clicking End Turn."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Enemy Turn 1

var script1 = new Script(
      function(){ return Game.turn === 1 && Game.faction === 'Enemy' },
      [
        function(){ Game.spawnUnit(enemy1, 14, 15, 'west') },
        {
          unit: enemy1,
          message: "*knock* *knock*",
          alignLeft: false
        },
        {
          unit: enemy1,
          message: "Oi. What you got cookin' in there?"
        },
        {
          unit: player1,
          message: "Who's asking?"
        },
        {
          unit: enemy1,
          message: "Just a weary, hungry traveler. Nicest fella you ever met. Come on, open this door."
        },
        {
          unit: player1,
          message: "Actual nice fellas don't need to convince anyone. Take your schtick somewhere else."
        },
        {
          unit: enemy1,
          message: "Fine, smart guy. I aren't that nice. But I am comin' in. So you best stand back or you're gonna get hurt."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Player Turn 2

var script2 = new Script(
      function(){ return Game.turn === 2 && Game.faction === 'Player' },
      [
        {
          unit: enemy1,
          message: "*BANG* *BANG*",
          alignLeft: false
        },
        {
          unit: player0,
          message: "Someone's trying to break into that house! I have to stop him. There’s gotta be something around here I can use as a weapon..."
        },
        {
          unit: null,
          message: "You can carry three types of items: weapons, clothing, and accessories. To pick up an item: walk over to it, press E, then drag the item into the appropriate section of your inventory."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Lizzie has picked up Heavy Stick but it's not equipped

var script3 = new Script(
      function(){
        var unit = Game.getUnit('lizzie');
        return unit && unit.hasItem('stick1') && unit.equipped.id !== 'stick1' && Game.faction === 'Player';
      },
      [
        {
          unit: null,
          message: "Weapons must be equipped before they can be used in combat. Equip the Heavy Stick: press E to open the Equipment panel, then drag the Heavy Stick upward to the indicated area."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Lizzie has equipped the Heavy Stick and the Ruffian is within striking distance

var script4 = new Script(
      function(){
        var unit = Game.getUnit('lizzie'), distance;
        if (unit) { distance = Math.abs(unit.posY - 14) + Math.abs(unit.posX - 15) }
        else { return false }
        return unit.equipped.id === 'stick1' && distance <= 4 && Game.faction === 'Player';
      },
      [
        {
          unit: player0,
          message: "Hey! What do you think you're doing?",
          alignLeft: true
        },
        {
          unit: enemy1,
          message: "Aww, did I ruin your door? Bring it on, girlie!"
        },
        {
          unit: null,
          message: "Time to show this fool what you’re made of. Move adjacent to the enemy, press A, then select the Ruffian. Press Enter to confirm the attack."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Lizzie's condition is Critical and she has a Salve

var script5 = new Script(
      function(){
        var unit = Game.getUnit('lizzie');
        return unit && unit.hp === 1 && unit.hasItem('salve1') && Game.faction === 'Player';
      },
      [
        {
          unit: player0,
          message: "Ow, he got me. I should have a salve in my pack.",
          alignLeft: true
        },
        {
          unit: null,
          message: "Salves are used to treat wounds in the heat of battle. To use Lizzie’s Salve, open the Equipment panel, then drag the Salve upward."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Lizzie is at space 14, 15

var script6 = new Script(
      function(){
        var unit = Game.getUnit('lizzie');
        return unit && unit.posY === 14 && unit.posX === 15 && Game.faction === 'Player';
      },
      [
        function(){ Game.setGoal(14, 15) },
        {
          unit: player0,
          message: "Is anyone there?",
          alignLeft: true
        },
        {
          unit: player1,
          message: "Um, hi, I'm Corbin."
        },
        {
          unit: player0,
          message: "I'm Lizzie. Nice to meet you."
        },
        {
          unit: player1,
          message: "I saw what you did... why are you helping me?"
        },
        {
          unit: player0,
          message: "I was just walking by. It seemed like the right thing to do."
        },
        {
          unit: player1,
          message: "Well... thanks. I could have taken him, by the way."
        },
        {
          unit: player0,
          message: "You might get another chance. He said something funny before he left. I think he's coming back."
        },
        {
          unit: player1,
          message: "Is that so? In that case... here, take this. It's not much, but it's better than a stick."
        },
        {
          unit: player0,
          message: "Much better. Thanks! What will you do?"
        },
        {
          unit: player1,
          message: "Help you fight. It's me he was after anyway. I'm alright with a bow. Just don't let 'em get too close."
        },
        function(){ Game.spawnUnit(player1, 13, 14, 'west') },
        {
          unit: null,
          message: "You can drop items by dragging them to the right and dropping them onto the map. Have Corbin drop the weapon he's carrying for Lizzie. Then move him out of the way so she can pick it up."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Corbin is in the game and it's the enemy's turn

var script7 = new Script(
      function(){ return Game.getUnit('corbin') && Game.faction === 'Enemy' },
      [
        function(){
          enemy1.restoreHealth(2);
          enemy1.items.push(club1);
          enemy1.goodbye = [function(){
            var unit = Game.getUnit('ruffian1');
            Game.terminateUnit(unit.posY, unit.posX);
          }];
          Game.spawnUnit(enemy0, 0, 14, 'south', true);
          Game.spawnUnit(enemy1, 1, 15, 'west');
        },
        {
          unit: enemy0,
          message: "Are we close?",
          alignLeft: true
        },
        {
          unit: enemy1,
          message: "Just over this ridge."
        },
        {
          unit: enemy0,
          message: "How many of 'em are there?"
        },
        {
          unit: enemy1,
          message: "Two, I think. Watch out for the lass—she knows her way around a fight."
        },
        {
          unit: enemy0,
          message: "You heard him, boys. Rough 'em up if you need to, but try not to kill 'em, okay? They're worth a lot more when they're alive. Alright, let's finish this while it's still light out."
        },
        function(){
          Game.moveUnit(0, 14, 's');
          Game.moveUnit(1, 15, 'wwwwwww');
          window.setTimeout(function(){
            Game.spawnUnit(enemy2, 0, 14, 'south');
            Game.spawnUnit(enemy3, 1, 15, 'west');
            Game.moveUnit(0, 14, 'wwwwwwwwswswsw');
            Game.moveUnit(1, 15, 'wwswwswwwswwwswswsws');
          }, 500);
          Game.checkpoint += 1;
          window.setTimeout(function(){ Game.beginTurn() }, 5000);
        }
      ]
    );

// Corbin is in the game and it's the player's turn

var script8 = new Script(
      function(){ return Game.getUnit('corbin') && Game.faction === 'Player' },
      [
        {
          unit: null,
          message: "Sun Tzu said that the key to victory is knowing your enemy. Select an enemy, then press A to see where it can attack, or press E to see what it's carrying. Click an item to learn more. Try it now!"
        },
        {
          unit: null,
          message: "Defeat all enemy units to win. Good luck!"
        },
        function(){ Game.beginTurn() }
      ]
    );

// Corbin's condition is Critical and he has a Salve

var script9 = new Script(
      function(){
        var unit = Game.getUnit('corbin');
        return unit && unit.hp === 1 && unit.hasItem('salve2') && Game.faction === 'Player';
      },
      [
        {
          unit: player1,
          message: "Huh? Oh, I'm bleeding.",
          alignLeft: true
        },
        {
          unit: null,
          message: "To use Corbin’s Salve, open the Equipment panel, then drag the Salve upward."
        },
        function(){ Game.beginTurn() }
      ]
    );

// Only one enemy unit remains

var script10 = new Script(
      function(){ return Game.checkpoint > 0 && Game.getUnits('Enemy').length === 1 },
      null,
      function(){
        var unit = Game.getUnits('Enemy')[0];
        Game.map[unit.posY][unit.posX].unit.goodbye = [
          {
            unit: unit,
            message: "We bit off... more than we could chew..."
          },
          function(){
            var u = Game.getUnit(unit.id);
            Game.terminateUnit(u.posY, u.posX);
          }
        ];
      }
    );

var script11 = new Script(
      function(){ return Game.checkpoint > 0 && Game.getUnits('Enemy').length === 0 },
      [
        {
          unit: player1,
          message: "Whew. I think that's the last of them. Are you okay?"
        },
        {
          unit: player0,
          message: "Doing better than these guys. Who were they, anyway?"
        },
        {
          unit: player1,
          message: "They're part of a group known as the Brazza. They abduct villagers and hold them for ransom. The ones they can't ransom they send away to be sold as slaves."
        },
        {
          unit: player0,
          message: "That's terrible."
        },
        {
          unit: player1,
          message: "We... did a good thing today."
        },
        {
          unit: player1,
          message: "I dunno about you, but I'm famished. Would you care to stay for dinner? It's the least I could do to repay you."
        },
        {
          unit: player0,
          message: "Thanks, I'd like that!"
        },
        function(){
          Game.outcome = 'victory';
          window.setTimeout(function(){
            Game.events.push(new DialogEvent(null, "THE END. Thanks for playing!"));
            window.setTimeout(function(){ $( '#triangle' ).remove() }, 1);
          }, 3000);
        }
      ]
    );

var script12 = new Script(
      function(){ return Game.checkpoint > 0 && Game.getUnits('Player').length === 0 },
      null,
      function(){
        Game.outcome = 'defeat';
        window.setTimeout(function(){
          Game.events.push(new DialogEvent(null, "You have been defeated. Reload this page to try again."));
          window.setTimeout(function(){ $( '#triangle' ).remove() }, 1);
        }, 3000);
      }
    );

Game.scripts = [ script0, script1, script2, script3, script4, script5, script6, script7, script8, script9, script10, script11, script12 ];

// Defeat Quotes

player0.goodbye = [
  {
    unit: player0,
    message: "Beaten by a bunch of ruffians..."
  },
  function(){
    var u = Game.getUnit('lizzie');
    Game.terminateUnit(u.posY, u.posX);
  }
];

player1.goodbye = [
  {
    unit: player1,
    message: "...."
  },
  function(){
    var u = Game.getUnit('corbin');
    Game.terminateUnit(u.posY, u.posX);
  }
];

enemy1.goodbye = [
  {
    unit: enemy1,
    message: "You... won't win... this easily..."
  },
  function(){
    var u = Game.getUnit('ruffian1');
    document.getElementById('ruffian1').animate({ left: [0, '32px'] }, { duration: 200, fill: 'forwards' });
    Game.map[u.posY][u.posX].unit.items = [];
    window.setTimeout(function(){ Game.terminateUnit(u.posY, u.posX) }, 200);
  }
];

// These units won't have defeat quotes

[enemy0, enemy2, enemy3].forEach(function(unit){
  unit.goodbye = [function(){
    var u = Game.getUnit(unit.id);
    Game.terminateUnit(u.posY, u.posX);
  }];
});

// ----------------------------{  Interface  }-----------------------------

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Game.title) {
    switch (event.keyCode) {
      case 13: // enter
        $( '#menu-' + Game.menu ).trigger( 'click' );
        break;
      case 32: // space
        $( '#menu-' + Game.menu ).trigger( 'click' );
        break;
      case 37: // left
        Game.menuNav(false);
        break;
      case 38: // up
        Game.menuNav(false);
        break;
      case 39: // right
        Game.menuNav(true);
        break;
      case 40: // down
        Game.menuNav(true);
        break;
    }
  }
  else { // if !Game.title
    if (Game.action === 'waiting') { Game.advanceDialog() }
    if (Game.control === 'player' && Game.active && Game.active.unit) {
      switch (event.keyCode) {
        case 13: // enter
          $( '#btn-confatk' ).trigger( 'click' );
          break;
        case 27: //escape
          $( '#btn-cancel' ).trigger( 'click' );
          break;
        case 65: // a
          if (Game.active.unit.control === 'player') {
            if (Game.action !== 'attacking') { $( '#btn-attack' ).trigger( 'click' ); }
            else {
              if (Game.target) { $( '#btn-confatk' ).trigger( 'click' ); }
              else { $( '#btn-cancel' ).trigger( 'click' ); }
            }
          } else {
            if (Game.action !== 'checking') { $( '#btn-checkranges' ).trigger( 'click' ); }
            else { $( '#btn-cancel' ).trigger( 'click' ); }
          }
          break;
        case 67: // c
          $( '#btn-cancel' ).trigger( 'click' );
          break;
        case 69: // e
          if (Game.action !== 'equipping') {
            $( '#btn-equip' ).trigger( 'click' );
            $( '#btn-checkequip' ).trigger( 'click' );
          }
          else { $( '#btn-cancel' ).trigger( 'click' ); }
          break;
        case 77: // m
          if (Game.active.unit.control === 'player') {
            if (Game.action !== 'moving') { $( '#btn-move' ).trigger( 'click' ); }
            else { $( '#btn-cancel' ).trigger( 'click' ); }
          } else {
            if (Game.action !== 'checking') { $( '#btn-checkranges' ).trigger( 'click' ); }
            else { $( '#btn-cancel' ).trigger( 'click' ); }
          }
          break;
      }
    }
    if (event.keyCode === 86) { // v
      $( '#tgl-topoview' ).trigger( 'click' );
    }
  }
}

$( document ).keyup( keyHandler );

});