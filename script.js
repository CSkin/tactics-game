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
    <div v-show='pathTo || inRange' class='highlight space' :class='movable'></div>
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
  template: "<img v-if='unit' class='unit space' :src='unit.sprite' tabindex=0></img>",
  props: ['unit']
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
          unit = this.space.unit;
      this.selectTerrain(terrain);
      if (unit) { this.selectUnit(unit) } else { this.deselectUnit() }
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
          goWest  = function () { Map.showMoveRange(y, Math.max(x - 1, 0), moves - west.terrain.moveCost,  path + 'w') },
          goNorth = function () { Map.showMoveRange(Math.max(y - 1, 0), x, moves - north.terrain.moveCost, path + 'n') };
      if (!origin.pathTo) { origin.pathTo = 'o' }
      if (east.terrain.moveCost  <= moves && (!east.pathTo  || path.length + 1 < east.pathTo.length))  { east.pathTo  = path + 'e'; explore.push(goEast) }
      if (south.terrain.moveCost <= moves && (!south.pathTo || path.length + 1 < south.pathTo.length)) { south.pathTo = path + 's'; explore.push(goSouth) }
      if (west.terrain.moveCost  <= moves && (!west.pathTo  || path.length + 1 < west.pathTo.length))  { west.pathTo  = path + 'w'; explore.push(goWest) }
      if (north.terrain.moveCost <= moves && (!north.pathTo || path.length + 1 < north.pathTo.length)) { north.pathTo = path + 'n'; explore.push(goNorth) }
      shuffle(explore);
      explore.forEach( function (go) { go(); });
    },
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
    moveUnit: function () {
      Map.showMoveRange(this.unit.posY, this.unit.posX, this.unit.moves, '');
      this.moving = true;
    },
    cancelMove: function () {
      this.hideMoveRange();
      this.moving = false;
    },
    hideMoveRange: function () {
      var y, x;
      for (y = 0; y < 16; y++) {
        for (x = 0; x < 16; x++) {
          Map.gameData[y][x].pathTo = null;
        }
      }
    }
  }
});

function keyHandler () {
  console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Leftpanel.unit && Leftpanel.unit.faction === 'Player') {
    switch (event.keyCode) {
      case 77:
        $( '#btn-move' ).trigger( 'click' );
      break;
    }
  }
}

$( document ).keyup( keyHandler );

});