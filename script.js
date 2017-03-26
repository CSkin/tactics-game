function generateMap(mapPlan) {
  var y, x, row, string,
      mapData = [];
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

function drawGrid() {
  var y, x, row, divs = '';
  for (y = 0; y < 16; y++) {
    row = "<div class='row'>";
    for (x = 0; x < 16; x++) {
      row += "<div class='space' @click='selectTerrain'></div>";
    }
    row += "</div>";
    divs += row;
  }
  $('#grid').append(divs);
}

function drawUnits(units) {
  var id, src, y, x, img, space;
  for (var p = 0; p < units.player.length; p++) {
    img = $( "<img id='" + units.player[p].id + "' src='" + units.player[p].sprite + "' @click='selectUnit'>" );
    space = $( '#grid :nth-child(' + units.player[p].posY + ') :nth-child(' + units.player[p].posX + ')' );
    $(img).appendTo(space);
  }
  for (var e = 0; e < units.enemy.length; e++) {
    img = $( "<img id='" + units.enemy[e].id + "' src='" + units.enemy[e].sprite + "' @click='selectUnit'>" );
    space = $( '#grid :nth-child(' + units.enemy[e].posY + ') :nth-child(' + units.enemy[e].posX + ')' );
    $(img).appendTo(space);
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
    
    moveInit: function(unit) {
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
    },
    
    selectUnit: function (event) {
      var id = event.target.id,
          index = Number(id.slice(-1));
      if (id.charAt(0) === 'p') {
        leftpanel.unit = this.units.player[index];
      }
      else if (id.charAt(0) === 'e') {
        leftpanel.unit = this.units.enemy[index];
      }
      leftpanel.showUnitInfo = true;
    },
    
    deselectUnit: function (event) {
      if ($(event.target).is('div')) {
        leftpanel.showUnitInfo = false;
      }
    },
    
    calculateMoveRange: function (y, x, moves, path) {
      var east = this.terrain[y][x+1];
      if (east.moveCost <= moves) {
        path += 'e';
        east.pathTo = path;
        console.log(east);
        moves -= east.moveCost;
        this.calculateMoveRange(y, x+1, moves, path);
      }
      console.log('Movement range calculated.');
    }
    
  }
});

});