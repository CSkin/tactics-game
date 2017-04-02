var mapImage = { 'background-image': "url('maps/level0.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - g g g g g g g g - - - - ',
  ' - - - - g s s s s s s g - - - - ',
  ' - - - - g s s s s s s g - - - - ',
  ' - - - - g g g g g g g g - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

function Terrain(type, moveCost) {
  this.type = type;
  var name = type.split('');
  name[0] = name[0].toUpperCase();
  this.name = name.join('');
  this.moveCost = moveCost;
}

var waste = new Terrain('waste', 99),
    grass = new Terrain('grass', 1),
    street = new Terrain('street', 1);

function Space(posY, posX, terrain) {
  this.posY = posY;
  this.posX = posX;
  this.terrain = terrain;
  this.unit = null;
  this.pathTo = '';
  this.inRange = null;
}

function Unit(id, sprite, faction, name, hp, damage, range, movement) {
  this.id = id;
  this.sprite = 'sprites/' + sprite;
  this.faction = faction;
  this.name = name;
  this.hp = hp;
  this.damage = damage;
  this.range = range;
  this.movement = movement;
  this.moves = movement;
}

var player0 = new Unit('player0', 'player.png', 'Player', 'Player Unit', 10, 1, 1, 5),
    enemy0  = new Unit('enemy0', 'enemy.png', 'Enemy', 'Enemy Unit', 10, 1, 1, 5);
    
var unitPlan = [
  { unit: player0, startY: 9, startX: 4 },
  { unit: enemy0, startY: 6, startX: 11 }
];

var unitList = {
  player: [player0],
  enemy: [enemy0]
};