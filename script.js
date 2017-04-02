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
    y = unitPlan[u].startY;
    x = unitPlan[u].startX;
    unit = unitPlan[u].unit;
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
  template: "<div v-show='pathTo || inRange' class='highlight space'></div>",
  props: ['pathTo', 'inRange']
};

var Unit = {
  template: "<img v-if='unit' class='unit space' :src='unit.sprite'></img>",
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
      Leftpanel.terrSelected = true;
    },
    selectUnit: function (unit) {
      Leftpanel.unit = unit;
      Leftpanel.unitSelected = true;
    },
    deselectUnit: function () {
      Leftpanel.unit = null;
      Leftpanel.unitSelected = false;
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
    
  },
  components: {
    'row': Row
  }
});

var Leftpanel = new Vue ({
  el: '#leftpanel',
  data: {
    terrain: null,
    terrSelected: false,
    unit: null,
    unitSelected: false
  },
  methods: {
    
  }
});

});