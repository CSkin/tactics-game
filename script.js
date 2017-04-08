function loadMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      if (string[x] === '-') { row.push(new Space(y, x, waste)) }
      if (string[x] === 'g') { row.push(new Space(y, x, grass)) }
      if (string[x] === 's') { row.push(new Space(y, x, street)) }
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
    <div v-if='pathTo || inRange' class='highlight space' :class='movable'></div>
  </transition>
  `,
  props: ['pathTo', 'inRange'],
  computed: {
    movable: function () {
      return { movable: this.pathTo && this.pathTo !== 'o' };
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
      <highlight :pathTo='space.pathTo' :inRange='space.inRange'></highlight>
      <unit :unit='space.unit'></unit>
    </div>
  `,
  props: ['space'],
  methods: {
    clickHandler: function () {
      var terrain = this.space.terrain,
          unit = this.space.unit,
          pathTo = this.space.pathTo;
      this.selectTerrain(terrain);
      if (!Leftpanel.moving) {
        if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
      }
      else {
        if (pathTo && pathTo !== 'o') { Map.moveUnit(pathTo) }
        else {
          $( '#btn-unmove' ).trigger( 'click' );
          if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
        }
      }
    },
    selectTerrain: function (terrain) {
      Leftpanel.terrain = terrain;
      console.log(this.space.pathTo); // Developer mode
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
          east   = this.gameData[y][Math.min(x + 1, 15)],
          south  = this.gameData[Math.min(y + 1, 15)][x],
          west   = this.gameData[y][Math.max(x - 1, 0)],
          north  = this.gameData[Math.max(y - 1, 0)][x],
          explore = [],
          goEast  = function () { Map.showMoveRange(y, Math.min(x + 1, 15), moves - east.terrain.moveCost,  path + 'e') },
          goSouth = function () { Map.showMoveRange(Math.min(y + 1, 15), x, moves - south.terrain.moveCost, path + 's') },
          goWest  = function () { Map.showMoveRange(y, Math.max(x - 1, 0),  moves - west.terrain.moveCost,  path + 'w') },
          goNorth = function () { Map.showMoveRange(Math.max(y - 1, 0), x,  moves - north.terrain.moveCost, path + 'n') };
      if (!origin.pathTo) { origin.pathTo = 'o' }
      if (east.terrain.moveCost  <= moves && (!east.pathTo  || path.length + 1 < east.pathTo.length))  { east.pathTo  = path + 'e'; explore.push(goEast) }
      if (south.terrain.moveCost <= moves && (!south.pathTo || path.length + 1 < south.pathTo.length)) { south.pathTo = path + 's'; explore.push(goSouth) }
      if (west.terrain.moveCost  <= moves && (!west.pathTo  || path.length + 1 < west.pathTo.length))  { west.pathTo  = path + 'w'; explore.push(goWest) }
      if (north.terrain.moveCost <= moves && (!north.pathTo || path.length + 1 < north.pathTo.length)) { north.pathTo = path + 'n'; explore.push(goNorth) }
      shuffle(explore);
      explore.forEach( function (go) { go(); });
    },
    hideMoveRange: function () {
      var y, x;
      for (y = 0; y < 16; y++) {
        for (x = 0; x < 16; x++) {
          this.gameData[y][x].pathTo = null;
        }
      }
    },
    moveUnit: function (pathTo) {
      var y = Leftpanel.unit.posY,
          x = Leftpanel.unit.posX;
      if (pathTo) {
        this.hideMoveRange();
        this.gameData[y][x].unit.path = pathTo;
      }
      switch (this.gameData[y][x].unit.path[0]) {
        case 'e': this.moveEast(y, x); break;
        case 's': this.moveSouth(y, x); break;
        case 'w': this.moveWest(y, x); break;
        case 'n': this.moveNorth(y, x); break;
      }
    },
    moveEast: function (y, x) {
      var spaceFrom = this.gameData[y][x];
          spaceTo = this.gameData[y][x + 1];
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.moveCost;
      unitData.moving = 'east';
      unitData.path = unitData.path.substr(1);
      unitData.posX += 1;
      spaceTo.unit = unitData;
    },
    moveSouth: function (y, x) {
      var spaceFrom = this.gameData[y][x];
          spaceTo = this.gameData[y + 1][x];
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.moveCost;
      unitData.moving = 'south';
      unitData.path = unitData.path.substr(1);
      unitData.posY += 1;
      spaceTo.unit = unitData;
    },
    moveWest: function (y, x) {
      var spaceFrom = this.gameData[y][x];
          spaceTo = this.gameData[y][x - 1];
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.moveCost;
      unitData.moving = 'west';
      unitData.path = unitData.path.substr(1);
      unitData.posX -= 1;
      spaceTo.unit = unitData;
    },
    moveNorth: function (y, x) {
      var spaceFrom = this.gameData[y][x];
          spaceTo = this.gameData[y - 1][x];
          unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.moveCost;
      unitData.moving = 'north';
      unitData.path = unitData.path.substr(1);
      unitData.posY -= 1;
      spaceTo.unit = unitData;
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
    moving: false
  },
  methods: {
    beginMove: function () {
      Map.showMoveRange(this.unit.posY, this.unit.posX, this.unit.moves, '');
      this.moving = true;
    },
    cancelMove: function () {
      Map.hideMoveRange();
      this.moving = false;
    }
  }
});

function keyHandler () {
  console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Leftpanel.unit && Leftpanel.unit.faction === 'Player') {
    switch (event.keyCode) {
      case 77:
        if (!Leftpanel.moving) { $( '#btn-move' ).trigger( 'click' ); } else { $( '#btn-unmove' ).trigger( 'click' ); }
      break;
    }
  }
}

$( document ).keyup( keyHandler );

});