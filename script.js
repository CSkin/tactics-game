function generateMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      if (string[x] === '-') { row.push(new Terrain('Waste', 99)) }
      if (string[x] === 'g') { row.push(new Terrain('Grass', 1)) }
      if (string[x] === 'r') { row.push(new Terrain('Road', 1)) }
    }
    mapData.push(row);
  }
  return mapData;
}

function drawGrid () {
  var y, x, row, divs = '';
  for (y = 0; y < 16; y++) {
    row = "<div class='row'>";
    for (x = 0; x < 16; x++) {
      row += "<div class='space' @click='selectTerrain'></div>";
    }
    row += "</div>";
    divs += row;
  }
  $(divs).appendTo('#grid');
}

function drawUnits (units) {
  var f, u, img, space, faction,
      factions = [units.player, units.enemy];
  for (f = 0; f < factions.length; f++) {
    faction = factions[f];
    for (u = 0; u < faction.length; u++) {
      img = $( "<img id='" + faction[u].id + "' src='" + faction[u].sprite + "' @click='selectUnit'>" );
      space = $( '#grid :nth-child(' + faction[u].posY + ') :nth-child(' + faction[u].posX + ')' );
      $(img).appendTo(space);
    }
  }
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

drawGrid();

drawUnits(units);

var leftpanel = new Vue ({
  el: '#leftpanel',
  data: {
    terrain: undefined,
    showTerrInfo: false,
    unit: undefined,
    showUnitInfo: false
  },
  methods: {
    
    moveInit: function (unit) {
      map.calculateMoveRange(unit.posY - 1, unit.posX - 1, unit.moves, '');
    }
    
  }
});

var map = new Vue ({
  el:'#map',
  data: {
    terrain: generateMap(mapPlan),
    units: units
  },
  methods: {
    
    selectTerrain: function (event) {
      var y = $(event.currentTarget).parent().index(),
          x = $(event.currentTarget).index();
      leftpanel.terrain = this.terrain[y][x];
      leftpanel.showTerrInfo = true;
      console.log(this.terrain[y][x].pathTo); //Developer mode!
    },
    
    selectUnit: function (event) {
      var id = event.target.id,
          index = Number(id.slice(-1));
      if (id[0] === 'p')      { leftpanel.unit = this.units.player[index]; }
      else if (id[0] === 'e') { leftpanel.unit = this.units.enemy[index]; }
      leftpanel.showUnitInfo = true;
    },
    
    deselectUnit: function (event) {
      if ($(event.target).is('div')) { leftpanel.showUnitInfo = false; }
    },
    
    calculateMoveRange: function (y, x, moves, path) {
      var origin = this.terrain[y][x],
          east   = this.terrain[y][x + 1],
          south  = this.terrain[y + 1][x],
          west   = this.terrain[y][x - 1],
          north  = this.terrain[y - 1][x],
          explore = [],
          goEast  = function () { map.calculateMoveRange(y, x + 1, moves - east.moveCost,  path + 'e') },
          goSouth = function () { map.calculateMoveRange(y + 1, x, moves - south.moveCost, path + 's') },
          goWest  = function () { map.calculateMoveRange(y, x - 1, moves - west.moveCost,  path + 'w') },
          goNorth = function () { map.calculateMoveRange(y - 1, x, moves - north.moveCost, path + 'n') };
      if (!origin.pathTo) { origin.pathTo = 'o' }
      if (east.moveCost  <= moves && (!east.pathTo  || path.length + 1 < east.pathTo.length))  { east.pathTo  = path + 'e'; explore.push(goEast) }
      if (south.moveCost <= moves && (!south.pathTo || path.length + 1 < south.pathTo.length)) { south.pathTo = path + 's'; explore.push(goSouth) }
      if (west.moveCost  <= moves && (!west.pathTo  || path.length + 1 < west.pathTo.length))  { west.pathTo  = path + 'w'; explore.push(goWest) }
      if (north.moveCost <= moves && (!north.pathTo || path.length + 1 < north.pathTo.length)) { north.pathTo = path + 'n'; explore.push(goNorth) }
      shuffle(explore);
      console.log('Currently at ' + y + ',' + x + ' and exploring ' + explore.length + ' nearby spaces.');
      explore.forEach( function (go) { go(); });
    }
    
  }
});

});