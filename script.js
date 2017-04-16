function loadMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      switch (string[x]) {
        case '-': row.push(new Space(y, x, waste)); break;
        case 'g': row.push(new Space(y, x, grass)); break;
        case 's': row.push(new Space(y, x, street)); break;
        case 'b': row.push(new Space(y, x, brush)); break;
      }
    }
    mapData.push(row);
  }
  return mapData;
}

function loadUnits (mapData, unitPlan) {
  var u, y, x, unit;
  for (u = 0; u < unitPlan.length; u++) {
    y = unitPlan[u].posY;
    x = unitPlan[u].posX;
    unit = unitPlan[u];
    mapData[y][x].unit = unit;
  }
  return mapData;
}

function loadLevel () {
  var mapData = loadMap(mapPlan),
      levelData = loadUnits(mapData, unitPlan);
  return levelData;
}

function shuffle (array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

$( document ).ready( function () {

var Terrain = {
  // To use terrain sprites instead of map image, set v-if to true.
  template: "<div v-if='false' class='terrain space' :class='terrain.type'></div>",
  props: ['terrain']
};

var Highlight = {
  template: `
  <transition name='fade'>
    <div v-if='space.path || space.distance' class='highlight space' :class='classes'></div>
  </transition>
  `,
  props: ['space'],
  computed: {
    classes: function () {
      var unit = this.space.unit,
          path = this.space.path,
          distance = this.space.distance;
      return {
        movable: path,
        inrange: distance && (!unit || unit.faction === 'Player'),
        attackable: distance && unit && unit.faction === 'Enemy'
      };
    }
  }
};

var Unit = {
  template: `
  <transition :name='moveDirection' @after-enter='moveHandler'>
    <img v-if='unit' class='unit space' :src='unit.sprite' tabindex=0></img>
  </transition>
  `,
  props: ['unit'],
  computed: {
    moveDirection: function () {
      if (this.unit && this.unit.moving) {
        switch (this.unit.moving) {
          case 'east': return 'moveEast';
          case 'south': return 'moveSouth';
          case 'west': return 'moveWest';
          case 'north': return 'moveNorth';
        }
      }
    }
  },
  methods: {
    moveHandler: function () {
      if (this.unit.path) { Map.moveUnit(); } else { Leftpanel.moving = false; }
    }
  }
};

var Space = {
  template: `
    <div class='space' @click='clickHandler'>
      <terrain :terrain='space.terrain'></terrain>
      <highlight :space='space'></highlight>
      <unit :unit='space.unit'></unit>
    </div>
  `,
  props: ['space'],
  methods: {
    clickHandler: function () {
      var space = this.space,
          unit = space.unit,
          path = space.path;
      this.selectTerrain(space.terrain);
      if (Leftpanel.moving) {
        if (path) { Map.moveUnit(path) }
        else {
          $( '#btn-unmove' ).trigger( 'click' );
          if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
        }
      }
      else if (Leftpanel.attacking) {
        if (space.distance && unit && unit.faction === 'Enemy') { Map.targetUnit(space) }
        else {
          $( '#btn-unattack' ).trigger( 'click' );
          if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
        }
      }
      else {
        if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
      }
    },
    selectTerrain: function (terrain) {
      Rightpanel.space = null;
      Leftpanel.terrain = terrain;
    },
    selectUnit: function (unit) {
      Rightpanel.space = null;
      Leftpanel.unit = unit;
    },
    deselectUnit: function () {
      Leftpanel.unit = null;
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
    <space v-for='space in row' :key='space' :space='space'></space>
  </div>
  `,
  props: ['row'],
  components: {
    'space': Space
  }
};

var Map = new Vue ({
  el:'#map',
  data: {
    mapImage: mapImage,
    gameData: loadLevel()
  },
  methods: {
    showMoveRange: function (y, x, moves, path) {
      var origin = this.gameData[y][x],
          east = this.gameData[y][Math.min(x + 1, 15)],
          sout = this.gameData[Math.min(y + 1, 15)][x],
          west = this.gameData[y][Math.max(x - 1, 0)],
          nort = this.gameData[Math.max(y - 1, 0)][x],
          explore = [],
          goEast = function () { Map.showMoveRange(y, Math.min(x + 1, 15), moves - east.terrain.cost, path + 'e') },
          goSout = function () { Map.showMoveRange(Math.min(y + 1, 15), x, moves - sout.terrain.cost, path + 's') },
          goWest = function () { Map.showMoveRange(y, Math.max(x - 1, 0),  moves - west.terrain.cost, path + 'w') },
          goNort = function () { Map.showMoveRange(Math.max(y - 1, 0), x,  moves - nort.terrain.cost, path + 'n') };
      if (!origin.moves) { origin.moves = moves }
      if (east.terrain.cost <= moves && (!east.moves || moves - east.terrain.cost > east.moves) && east.unit === null)
        { east.moves = moves - east.terrain.cost; east.path = path + 'e'; explore.push(goEast) }
      if (sout.terrain.cost <= moves && (!sout.moves || moves - sout.terrain.cost > sout.moves) && sout.unit === null)
        { sout.moves = moves - sout.terrain.cost; sout.path = path + 's'; explore.push(goSout) }
      if (west.terrain.cost <= moves && (!west.moves || moves - west.terrain.cost > west.moves) && west.unit === null)
        { west.moves = moves - west.terrain.cost; west.path = path + 'w'; explore.push(goWest) }
      if (nort.terrain.cost <= moves && (!nort.moves || moves - nort.terrain.cost > nort.moves) && nort.unit === null)
        { nort.moves = moves - nort.terrain.cost; nort.path = path + 'n'; explore.push(goNort) }
      shuffle(explore);
      explore.forEach( function (go) { go(); });
    },
    hideMoveRange: function () {
      var y, x,
          posY = Leftpanel.unit.posY,
          posX = Leftpanel.unit.posX,
          moves = Leftpanel.unit.moves;
      for (y = Math.max(posY - moves, 0); y <= Math.min(posY + moves, 15); y++) {
        for (x = Math.max(posX - moves, 0); x <= Math.min(posX + moves, 15); x++) {
          this.gameData[y][x].moves = null;
          this.gameData[y][x].path = null;
        }
      }
    },
    moveUnit: function (path) {
      var y = Leftpanel.unit.posY,
          x = Leftpanel.unit.posX,
          moveObj = { y: y, x: x, moving: null, changePos: null },
          spaceFrom, spaceTo, unitData;
      if (path) {
        this.hideMoveRange();
        this.gameData[y][x].unit.path = path;
      }
      switch (this.gameData[y][x].unit.path[0]) {
        case 'e':
          moveObj.x = x + 1;
          moveObj.moving = 'east';
          moveObj.changePos = function () { unitData.posX += 1 };
          break;
        case 's':
          moveObj.y = y + 1;
          moveObj.moving = 'south';
          moveObj.changePos = function () { unitData.posY += 1 };
          break;
        case 'w':
          moveObj.x = x - 1;
          moveObj.moving = 'west';
          moveObj.changePos = function () { unitData.posX -= 1 };
          break;
        case 'n':
          moveObj.y = y - 1;
          moveObj.moving = 'north';
          moveObj.changePos = function () { unitData.posY -= 1 };
          break;
      }
      spaceFrom = this.gameData[y][x],
      spaceTo = this.gameData[moveObj.y][moveObj.x],
      unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = moveObj.moving;
      unitData.path = unitData.path.substr(1);
      moveObj.changePos();
      spaceTo.unit = unitData;
    },
    toggleAttackRange: function (showOrHide) {
      var y, x, showOrHide, distance,
          posY = Leftpanel.unit.posY,
          posX = Leftpanel.unit.posX,
          range = Leftpanel.unit.range;
      if (showOrHide === 'show') {
        toggle = function (y, x) {
          distance = Math.abs(posY - y) + Math.abs(posX - x);
          if (distance <= range) { Map.gameData[y][x].distance = distance }
        }
      } else {
        toggle = function (y, x) { Map.gameData[y][x].distance = null; };
      }
      for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
        for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
          toggle(y, x);
        }
      }
    },
    targetUnit: function (space) {
      var attacker = Leftpanel.unit,
          defender = space.unit,
          distanceBonus = space.distance - 1,
          attackTotal = attacker.offense + defender.defense + distanceBonus,
          attack = attacker.offense / attackTotal,
          counterTotal = defender.offense + attacker.defense + distanceBonus,
          counter = defender.offense / counterTotal;
      Rightpanel.space = this.gameData[space.posY][space.posX];
      Leftpanel.attack = Math.round(attack * 100);
      Rightpanel.counter = Math.round(counter * 100);
    },
    attackUnit: function (counter) {
      var target, hitChance;
      if (!counter) {
        Map.toggleAttackRange('hide');
        target = Rightpanel.space.unit;
        hitChance = Leftpanel.attack;
      } else {
        target = Leftpanel.unit;
        hitChance = Rightpanel.counter;
      }
      if (Math.random()*100 <= hitChance) {
        this.dealDamage(target.posY, target.posX);
        if (!counter) {console.log('Attack hit!')} else {console.log('Counterattack hit!')}
      } else {
        if (!counter) {console.log('Attack missed!')} else {console.log('Counterattack missed!')}
      }
      if (!counter && target.condition !== 'Defeated') {
        this.attackUnit('counter');
      } else {
        Leftpanel.endAttack();
      }
    },
    dealDamage: function (y, x) {
      var unit = this.gameData[y][x].unit;
      switch (unit.condition) {
        case 'Healthy': unit.condition = 'Injured'; break;
        case 'Injured': unit.condition = 'Critical'; break;
        case 'Critical': unit.condition = 'Defeated'; break;
      }
      if (unit.condition === 'Defeated') {
        this.gameData[y][x].unit = null;
      }
    }
  },
  components: {
    'row': Row
  }
});

var Leftpanel = new Vue ({
  el: '#leftpanel',
  data: {
    terrain: null,
    unit: null,
    moving: false,
    attacking: false,
    ending: false,
    attack: null
  },
  computed: {
    gradient: function () {
      if (this.attack < 10) { return { color: '#bf0000' } }
      else if (this.attack < 20) { return { color: '#d01b00' } }
      else if (this.attack < 30) { return { color: '#e13600' } }
      else if (this.attack < 40) { return { color: '#f25100' } }
      else if (this.attack < 50) { return { color: '#ea6a00' } }
      else if (this.attack < 60) { return { color: '#e28300' } }
      else if (this.attack < 70) { return { color: '#da9c00' } }
      else if (this.attack < 80) { return { color: '#97a406' } }
      else if (this.attack < 90) { return { color: '#55ab0c' } }
      else { return { color: '#12b312' } }
    }
  },
  methods: {
    beginMove: function () {
      Rightpanel.space = null;
      Map.showMoveRange(this.unit.posY, this.unit.posX, this.unit.moves, '');
      this.moving = true;
    },
    cancelMove: function () {
      Map.hideMoveRange();
      this.moving = false;
    },
    beginAttack: function () {
      Rightpanel.space = null;
      Map.toggleAttackRange('show');
      this.attacking = true;
    },
    cancelAttack: function () {
      Map.toggleAttackRange('hide');
      this.attack = null;
      this.attacking = false;
      Rightpanel.space = null;
      Rightpanel.counter = null;
    },
    endAttack: function () {
      this.attack = null;
      this.attacks -= 1;
      this.attacking = false;
      Rightpanel.counter = null;
    },
    endTurn: function() {
      var unit = Leftpanel.unit;
      unit.moves = unit.movement;
      unit.attacks = 1;
      this.ending = false;
    }
  }
});

var Rightpanel = new Vue ({
  el: '#rightpanel',
  data: {
    space: null,
    counter: null
  },
  computed: {
    gradient: function () {
      if (this.counter <= 10) { return { color: '#12b312' } }
      else if (this.counter <= 20) { return { color: '#55ab0c' } }
      else if (this.counter <= 30) { return { color: '#97a406' } }
      else if (this.counter <= 40) { return { color: '#da9c00' } }
      else if (this.counter <= 50) { return { color: '#e28300' } }
      else if (this.counter <= 60) { return { color: '#ea6a00' } }
      else if (this.counter <= 70) { return { color: '#f25100' } }
      else if (this.counter <= 80) { return { color: '#e13600' } }
      else if (this.counter <= 90) { return { color: '#d01b00' } }
      else { return { color: '#bf0000' } }
    }
  },
  methods: {
    confirmAttack: function () {
      Map.attackUnit();
    }
  }
});

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Leftpanel.unit && Leftpanel.unit.faction === 'Player') {
    switch (event.keyCode) {
      case 13: if (Leftpanel.ending) { $( '#btn-confend' ).trigger( 'click' ); } break;
      case 65: if (!Leftpanel.attacking) { $( '#btn-attack' ).trigger( 'click' ); } else { $( '#btn-unattack' ).trigger( 'click' ); } break;
      case 69: if (!Leftpanel.ending) { $( '#btn-end' ).trigger( 'click' ); } else { $( '#btn-unend' ).trigger( 'click' ); } break;
      case 77: if (!Leftpanel.moving) { $( '#btn-move' ).trigger( 'click' ); } else { $( '#btn-unmove' ).trigger( 'click' ); } break;
    }
  }
}

$( document ).keyup( keyHandler );

});