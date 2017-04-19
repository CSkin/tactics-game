var mapImage = { backgroundImage: "url('maps/level0.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - b b g g b g g g - - - - ',
  ' - - - - b s s s s b s g - - - - ',
  ' - - - - g s b s s s s b - - - - ',
  ' - - - - g g g b g g b b - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

function Terrain(type, cost) {
  this.type = type;
  var name = type.split('');
  name[0] = name[0].toUpperCase();
  this.name = name.join('');
  this.cost = cost;
}

var waste = new Terrain('waste', 99),
    grass = new Terrain('grass', 1),
    street = new Terrain('street', 1),
    brush = new Terrain('brush', 2);

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