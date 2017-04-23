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

function Terrain(type, name, cost, defense, defenseDirection, elevation, seeThru) {
  this.type = type;
  this.name = name;
  this.cost = cost;
  this.defense = defense;
  this.defenseDirection = defenseDirection;
  this.elevation = elevation;
  this.seeThru = seeThru;
}

var barren = new Terrain('barren', 'Barren', 99, 0, null, 0, true),
    ground = new Terrain('ground', 'Ground', 1, 0, null, 0, true),
    sand = new Terrain('sand', 'Sand', 2, 0, null, 0, true),
    grass = new Terrain('grass', 'Grass', 1, 0, null, 0, true),
    brush = new Terrain('brush', 'Brush', 2, 1, null, 0, true),
    boulder = new Terrain('boulder', 'Boulder', 99, 0, null, 0, false),
    log = new Terrain('log', 'Log', 1, 2, null, 0, true);

function Space(posY, posX, terrain) {
  this.posY = posY;
  this.posX = posX;
  this.terrain = terrain;
  this.unit = null;
  this.moves = null;
  this.path = null;
  this.distance = null;
}

function Unit(id, sprite, faction, name, offense, defense, range, movement, posY, posX) {
  this.id = id;
  this.sprite = 'sprites/' + sprite;
  this.faction = faction;
  this.name = name;
  this.condition = 'Healthy';
  this.offense = offense;
  this.defense = defense;
  this.range = range;
  this.movement = movement;
  this.moves = this.movement;
  this.moving = null;
  this.path = null;
  this.attacksperturn = 5;
  this.attacks = this.attacksperturn;
  this.posY = posY;
  this.posX = posX;
}

var player0 = new Unit('player0', 'player.png', 'Player', 'Player Unit', 2, 2, 3, 10, 9, 4),
    enemy0  = new Unit('enemy0', 'enemy.png', 'Enemy', 'Enemy Unit', 2, 1, 3, 5, 6, 11);

var unitPlan = [ player0, enemy0 ];