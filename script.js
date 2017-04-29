function loadMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      switch (string[x]) {
        case '-': row.push(new Space(y, x, barren)); break;
        case 's': row.push(new Space(y, x, sand)); break;
        case 'a': row.push(new Space(y, x, grass)); break;
        case 'b': row.push(new Space(y, x, brush)); break;
        case 'B': row.push(new Space(y, x, boulder)); break;
        case 'l': row.push(new Space(y, x, new Terrain('log', 'Log', 1, 2, 0, true))); break;
      }
    }
    mapData.push(row);
  }
  return mapData;
}

function directionalCover (mapData) {
  var y, x;
  for (y = 0; y < 16; y++) {
    for (x = 0; x < 16; x++) {
      if (mapData[y][x].terrain.type === 'log') {
        if      (mapData[y][x + 1].terrain.type === 'log') { mapData[y][x].terrain.coverDirection = 'east' }
        else if (mapData[y + 1][x].terrain.type === 'log') { mapData[y][x].terrain.coverDirection = 'south' }
        else if (mapData[y][x - 1].terrain.type === 'log') { mapData[y][x].terrain.coverDirection = 'west' }
        else if (mapData[y - 1][x].terrain.type === 'log') { mapData[y][x].terrain.coverDirection = 'north' }
      }
    }
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
  var mapData = loadUnits(directionalCover(loadMap(mapPlan)), unitPlan);
  return mapData;
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
  <transition :name='dynamicTransition' @after-enter='moveHandler'>
    <img :id= 'unit.id' v-if='unit' class='unit space' :src='unit.sprite' tabindex=0></img>
  </transition>
  `,
  props: ['unit'],
  computed: {
    dynamicTransition: function () {
      if (this.unit) {
        if (this.unit.moving) {
          switch (this.unit.moving) {
            case 'east': return 'moveEast';
            case 'south': return 'moveSouth';
            case 'west': return 'moveWest';
            case 'north': return 'moveNorth';
          }
        } else if (this.unit.condition === 'Defeated') {
          return 'sayGoodbye';
        }
      }
    }
  },
  methods: {
    moveHandler: function () {
      var unit = this.unit;
      if (unit.path) {
        Game.moveUnit(unit.posY, unit.posX);
      }
      else {
        Game.mapData[unit.posY][unit.posX].unit.moving = null;
        Game.action = null;
      }
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
      var y = this.space.posY,
          x = this.space.posX,
          unit = this.space.unit,
          path = this.space.path;
      switch (Game.action) {
        case 'moving':
          if (path) { Game.moveUnit(Game.space1.posY, Game.space1.posX, path) }
          else {
            $( '#btn-unmove' ).trigger( 'click' );
            this.selectSpace(y, x);
          }
          break;
        case 'attacking':
          if (this.space.distance && unit && unit.faction === 'Enemy') { Game.targetUnit(y, x) }
          else {
            $( '#btn-unattack' ).trigger( 'click' );
            this.selectSpace(y, x);
          }
          break;
        case 'ending':
          $( '#btn-unend' ).trigger( 'click' );
          this.selectSpace(y, x);
          break;
        default:
          this.selectSpace(y, x);
          break;
      }
    },
    selectSpace: function (y, x) {
      Game.space1 = Game.mapData[y][x];
      Game.space2 = null;
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

var Sidepanel = {
  template: `
  
  `,
  props: ['space', 'hit']
};

var Game = new Vue ({
  el:'#game',
  data: {
    mapImage: mapImage,
    mapData: loadLevel(),
    space1: null,
    space2: null,
    action: null,
    attack: null,
    counter: null
  },
  methods: {
    showMoveRange: function (y, x, moves, path) {
      
    },
    hideMoveRange: function () {
      
    },
    moveUnit: function (y, x, path) {
      
    },
    showAttackRange: function () {
      
    },
    hideAttackRange: function (targetY, targetX) {
      
    },
    targetUnit: function (y, x) {
      
    },
    attackUnit: function (counter) {
      
    },
    dealDamage: function (y, x) {
      
    }
  },
  components: {
    'row': Row,
    'side-panel': Sidepanel
  }
});

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Game.space1 && Game.space1.unit && Game.space1.unit.faction === 'Player') {
    switch (event.keyCode) {
      case 13:
        if (Game.action === 'attacking') { $( '#btn-confatk' ).trigger( 'click' ); }
        else if (Game.action === 'ending') { $( '#btn-confend' ).trigger( 'click' ); }
        break;
      case 65:
        if (Game.action !== 'attacking') { $( '#btn-attack' ).trigger( 'click' ); }
        else { $( '#btn-unattack' ).trigger( 'click' ); }
        break;
      case 69:
        if (Game.action !== 'ending') { $( '#btn-end' ).trigger( 'click' ); }
        else { $( '#btn-unend' ).trigger( 'click' ); }
        break;
      case 77:
        if (Game.action !== 'moving') { $( '#btn-move' ).trigger( 'click' ); }
        else { $( '#btn-unmove' ).trigger( 'click' ); }
        break;
    }
  }
}

$( document ).keyup( keyHandler );

});