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
  return loadUnits(directionalCover(loadMap(mapPlan)), unitPlan);
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
        inrange: distance && (!unit || unit.friendly),
        attackable: distance && unit && !unit.friendly
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
        Game.map[unit.posY][unit.posX].unit.moving = null;
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
          if (path) { Game.moveUnit(Game.active.posY, Game.active.posX, path) }
          else {
            $( '#btn-unmove' ).trigger( 'click' );
            this.selectSpace(y, x);
          }
          break;
        case 'attacking':
          if (this.space.distance && unit && !unit.friendly) { Game.targetUnit(y, x) }
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
      Game.active = Game.map[y][x];
      Game.target = null;
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

var TerrainInfo = {
  template: `
  <div class='ui'>
    <div class='heading'><div class='icon' :class='terrain.type'></div>{{ terrain.name }}</div>
    <p v-if='terrain.cost < 99'>Move cost: <b>{{ terrain.cost }}</b></p>
    <p v-else>Impassable</p>
    <p v-if='terrain.cover > 0'>Cover: <b>{{ terrain.cover }}</b>
      <span v-if='terrain.coverDirection' class='small'>vs attacks from <b>{{ terrain.coverDirection }}</b></span>
    </p>
    <p v-if='terrain.elevation > 0'>Elevation: <b>{{ terrain.elevation }}</b></p>
  </div>
  `,
  props: ['terrain']
};

var UnitInfo = {
  template: `
  <div class='ui'>
    <div class='heading'><div class='icon' :class='unit.faction'></div>{{ unit.name }}</div>
    <p>Condition: <b :class='unit.condition'>{{ unit.condition }}</b></p>
    <p>Offense: <b>{{ unit.offense }}</b></p>
    <p>Defense: <b>{{ unit.defense }}</b></p>
    <p>Range: <b>{{ unit.range }}</b></p>
    <p>Movement: <b>{{ unit.moves }} / {{ unit.movement }}</b></p>
  </div>
  `,
  props: ['unit']
};

var UnitCombat = {
  template: `
  <div class='ui' v-if='hit'>
    <p class='heading'><img class='icon' src='sprites/combat-icon.png'>Combat Info</p>
    <p>{{ type }} success chance: <b :style='gradient'>{{ hit }}%</b></p>
  </div>
  `,
  props: ['type', 'hit'],
  computed: {
    gradient: function () {
      if (this.hit < 10) { return { color: '#bf0000' } }
      else if (this.hit < 20) { return { color: '#d01b00' } }
      else if (this.hit < 30) { return { color: '#e13600' } }
      else if (this.hit < 40) { return { color: '#f25100' } }
      else if (this.hit < 50) { return { color: '#ea6a00' } }
      else if (this.hit < 60) { return { color: '#e28300' } }
      else if (this.hit < 70) { return { color: '#da9c00' } }
      else if (this.hit < 80) { return { color: '#97a406' } }
      else if (this.hit < 90) { return { color: '#55ab0c' } }
      else { return { color: '#12b312' } }
    }
  }
};

var UnitActions = {
  template: `
  <div class='ui' v-if='unit.controlled'>
    <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
    <p v-if="!action || action === 'moving'">
      <button id='btn-move' v-if='!action' :disabled='unit.moves === 0' @click='beginMove'>Move (M)</button>
      <button id='btn-unmove' v-else @click='cancelMove'>Cancel Move (M)</button>
    </p>
    <p v-if="!action || action === 'attacking'">
      <button id='btn-attack' v-if='!action' :disabled='unit.attacks === 0' @click='beginAttack'>Attack (A)</button>
      <button id='btn-unattack' v-else @click='cancelAttack'>Cancel Attack (A)</button>
    </p>
    <div v-if="!action || action === 'ending'">
      <p v-if='!action'><button id='btn-end' @click='beginEnd'>End Turn (E)</button></p>
      <p v-else>
        Really end turn?<br>
        <button id='btn-unend' @click='cancelEnd'>Cancel (E)</button>
        <button id='btn-confend' @click='endTurn'>Confirm (Return)</button>
      </p>
    </div>
  </div>
  `,
  props: ['action', 'unit'],
  methods: {
    beginMove: function () {
      Game.showMoveRange(Game.active.unit.posY, Game.active.unit.posX, Game.active.unit.moves, '');
      Game.target = null;
      Game.action = 'moving';
    },
    cancelMove: function () {
      Game.hideMoveRange();
      Game.action = null;
    },
    beginAttack: function () {
      Game.showAttackRange();
      Game.target = null;
      Game.action = 'attacking';
    },
    cancelAttack: function () {
      Game.hideAttackRange();
      Game.target = null;
      Game.action = null;
      Game.attack = null;
      Game.counter = null;
    },
    endAttack: function () {
      if (Game.active.unit) { Game.active.unit.attacks -= 1 }
      Game.action = null;
      Game.attack = null;
      Game.counter = null;
    },
    beginEnd: function () {
      Game.action = 'ending';
    },
    cancelEnd: function () {
      Game.action = null;
    },
    endTurn: function () {
      var unit = Game.active.unit;
      unit.moves = unit.movement;
      unit.attacks = unit.attacksperturn;
      Game.target = null;
      Game.action = null;
    }
  }
};

var TargetActions = {
  template: `
  <div class='ui' v-if='hit || hit === 0'>
    <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
    <p><button id='btn-confatk' @click='confirmAttack'>Confirm Attack (Return)</button></p>
  </div>
  `,
  props: ['hit'],
  methods: {
    confirmAttack: function () {
      Game.attackUnit();
    }
  }
};

var Game = new Vue ({
  el:'#game',
  data: {
    mapImage: mapImage,
    map: loadLevel(),
    active: null, // Space object
    target: null, // Space object
    action: null, // string
    attack: null, // number between 0 and 100
    counter: null // number between 0 and 100
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
    'terrain-info': TerrainInfo,
    'unit-info': UnitInfo,
    'unit-combat': UnitCombat,
    'unit-actions': UnitActions,
    'target-actions': TargetActions
  }
});

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Game.active && Game.active.unit && Game.active.unit.controlled) {
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