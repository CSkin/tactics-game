var mapImage = { backgroundImage: 'maps/level0.png' };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - g g g g g g g g - - - - ',
  ' - - - - g r r r r r r g - - - - ',
  ' - - - - g r r r r r r g - - - - ',
  ' - - - - g g g g g g g g - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

function Terrain(name, moveCost, sprite) {
  this.name = name;
  this.moveCost = moveCost;
  this.sprite = sprite ? 'sprites/' + sprite : null;
}

var waste = new Terrain('Waste', 99),
    grass = new Terrain('Grass', 1),
    road  = new Terrain('Road', 1);

function Space(posY, posX, terrain) {
  this.posY = posY;
  this.posX = posX;
  this.terrain = terrain;
  this.unit = null;
  this.pathTo = '';
  this.attackable = null;
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