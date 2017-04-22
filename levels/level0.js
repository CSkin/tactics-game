var mapImage = { backgroundImage: "url('maps/level0.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - b b s s b s s s - - - - ',
  ' - - - - b g g g g b g s - - - - ',
  ' - - - - s g b g g g g b - - - - ',
  ' - - - - s s s b s s b b - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

function Terrain(type, name, cost, defense, elevation) {
  this.type = type;
  this.name = name;
  this.cost = cost;
  this.defense = defense;
  this.elevation = elevation;
}

var barren = new Terrain('barren', 'Barren', 99, 0, 0),
    ground = new Terrain('ground', 'Ground', 1, 0, 0),
    grass = new Terrain('grass', 'Grass', 1, 0, 0),
    brush = new Terrain('brush', 'Brush', 2, 1, 0);

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
    enemy0  = new Unit('enemy0', 'enemy.png', 'Enemy', 'Enemy Unit', 2, 1, 1, 5, 6, 11);

var unitPlan = [ player0, enemy0 ];