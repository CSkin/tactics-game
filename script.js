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
    <div v-if='path || distance' class='highlight space' :class='[movable, attackable]'></div>
  </transition>
  `,
  props: ['path', 'distance'],
  computed: {
    movable: function () {
      return { movable: this.path };
    },
    attackable: function () {
      return { attackable: this.distance };
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
      <highlight :path='space.path' :distance='space.distance'></highlight>
      <unit :unit='space.unit'></unit>
    </div>
  `,
  props: ['space'],
  methods: {
    clickHandler: function () {
      var terrain = this.space.terrain,
          unit = this.space.unit,
          path = this.space.path;
      this.selectTerrain(terrain);
      if (!Leftpanel.moving) {
        if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
      }
      else {
        if (path) { Map.moveUnit(path) }
        else {
          $( '#btn-unmove' ).trigger( 'click' );
          if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
        }
      }
    },
    selectTerrain: function (terrain) {
      Leftpanel.terrain = terrain;
      console.log(this.space.distance); // Developer mode
    },
    selectUnit: function (unit) {
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
      if (east.terrain.cost <= moves && (!east.moves || moves - east.terrain.cost > east.moves))
        { east.moves = moves - east.terrain.cost; east.path = path + 'e'; explore.push(goEast) }
      if (sout.terrain.cost <= moves && (!sout.moves || moves - sout.terrain.cost > sout.moves))
        { sout.moves = moves - sout.terrain.cost; sout.path = path + 's'; explore.push(goSout) }
      if (west.terrain.cost <= moves && (!west.moves || moves - west.terrain.cost > west.moves))
        { west.moves = moves - west.terrain.cost; west.path = path + 'w'; explore.push(goWest) }
      if (nort.terrain.cost <= moves && (!nort.moves || moves - nort.terrain.cost > nort.moves))
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
          x = Leftpanel.unit.posX;
      if (path) {
        this.hideMoveRange();
        this.gameData[y][x].unit.path = path;
      }
      switch (this.gameData[y][x].unit.path[0]) {
        case 'e': this.moveEast(y, x); break;
        case 's': this.moveSouth(y, x); break;
        case 'w': this.moveWest(y, x); break;
        case 'n': this.moveNorth(y, x); break;
      }
    },
    moveEast: function (y, x) {
      var spaceFrom = this.gameData[y][x],
          spaceTo = this.gameData[y][x + 1],
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = 'east';
      unitData.path = unitData.path.substr(1);
      unitData.posX += 1;
      spaceTo.unit = unitData;
    },
    moveSouth: function (y, x) {
      var spaceFrom = this.gameData[y][x],
          spaceTo = this.gameData[y + 1][x],
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = 'south';
      unitData.path = unitData.path.substr(1);
      unitData.posY += 1;
      spaceTo.unit = unitData;
    },
    moveWest: function (y, x) {
      var spaceFrom = this.gameData[y][x],
          spaceTo = this.gameData[y][x - 1],
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = 'west';
      unitData.path = unitData.path.substr(1);
      unitData.posX -= 1;
      spaceTo.unit = unitData;
    },
    moveNorth: function (y, x) {
      var spaceFrom = this.gameData[y][x],
          spaceTo = this.gameData[y - 1][x],
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = 'north';
      unitData.path = unitData.path.substr(1);
      unitData.posY -= 1;
      spaceTo.unit = unitData;
    },
    showAttackRange: function () {
      var y, x,
          posY = Leftpanel.unit.posY,
          posX = Leftpanel.unit.posX,
          range = Leftpanel.unit.range,
          distance;
      for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
        for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
          distance = Math.abs(posY - y) + Math.abs(posX - x);
          if (distance <= range) { this.gameData[y][x].distance = distance }
        }
      }
    },
    hideAttackRange: function () {
      var y, x,
          posY = Leftpanel.unit.posY,
          posX = Leftpanel.unit.posX,
          range = Leftpanel.unit.range;
      for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
        for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
          this.gameData[y][x].distance = null;
        }
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
    ending: false
  },
  methods: {
    beginMove: function () {
      Map.showMoveRange(this.unit.posY, this.unit.posX, this.unit.moves, '');
      this.moving = true;
    },
    cancelMove: function () {
      Map.hideMoveRange();
      this.moving = false;
    },
    beginAttack: function () {
      Map.showAttackRange();
      this.attacking = true;
    },
    cancelAttack: function () {
      Map.hideAttackRange();
      this.attacking = false;
    },
    endTurn: function() {
      var unit = Leftpanel.unit;
      unit.moves = unit.movement;
      unit.attacks = 1;
      this.ending = false;
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