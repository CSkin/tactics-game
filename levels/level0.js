function Terrain(name, moveCost) {
  this.name = name;
  this.moveCost = moveCost;
  this.pathTo = undefined;
}

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

function Unit(id, sprite, faction, name, hp, damage, range, movement, posY, posX) {
  this.id = id;
  this.sprite = 'sprites/' + sprite;
  this.faction = faction;
  this.name = name;
  this.hp = hp;
  this.damage = damage;
  this.range = range;
  this.movement = movement;
  this.moves = movement;
  this.posY = posY;
  this.posX = posX;
}

var player0 = new Unit('player0', 'player.png', 'Player', 'Player Unit', 10, 1, 1, 5, 10, 5),
    enemy0 = new Unit('enemy0', 'enemy.png', 'Enemy', 'Enemy Unit', 10, 1, 1, 5, 7, 12);
    
var units = {
  player: [player0],
  enemy: [enemy0]
};