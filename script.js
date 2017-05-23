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
        if      (mapData[y][x + 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'East' }
        else if (mapData[y + 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'South' }
        else if (mapData[y][x - 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'West' }
        else if (mapData[y - 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'North' }
      }
    }
  }
  return mapData;
}

function loadUnits (mapData, unitPlan) {
  var f, u, y, x, unit;
  for (f = 0; f < unitPlan.length; f++) {
    for (u = 0; u < unitPlan[f].units.length; u++) {
      y = unitPlan[f].units[u].posY;
      x = unitPlan[f].units[u].posX;
      mapData[y][x].unit = unitPlan[f].units[u];
    }
  }
  return mapData;
}

function loadLevel () {
  return loadUnits(directionalCover(loadMap(mapPlan)), unitPlan);
}

function loadFactions () {
  var obj, factions = [];
  for (obj of unitPlan) {
    factions.push(obj.faction);
  }
  return factions;
}

function shuffle (array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
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
        attackable: distance && (!unit || unit.friendly === Game.active.unit.friendly),
        targeted: distance && unit && unit.friendly !== Game.active.unit.friendly
      };
    }
  }
};

var Unit = {
  template: `
    <transition :name='dynamicTransition' @after-enter='moveHandler'>
      <img v-if='unit' :id='unit.id' class='unit space' :src='unit.sprite' :title='unit.name'></img>
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
      if (Game.control === 'player') {
        switch (Game.action) {
          case 'beginning':
            break;
          case 'moving':
            if (path) { Game.moveUnit(Game.active.posY, Game.active.posX, path) }
            else {
              $( '#btn-cancel' ).trigger( 'click' );
              this.selectSpace(y, x);
            }
            break;
          case 'attacking':
            if (this.space.distance && unit && !unit.friendly) {
              Game.hideAttackRange(y, x);
              Game.targetUnit(y, x);
            }
            else {
              $( '#btn-cancel' ).trigger( 'click' );
              this.selectSpace(y, x);
            }
            break;
          case 'equipping':
            $( '#btn-cancel' ).trigger( 'click' );
            this.selectSpace(y, x);
            break;
          default:
            this.selectSpace(y, x);
            break;
        }
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
      <p v-if='terrain.cost < 99'>Move cost: <b>{{ terrain.cost }}</b></p><p v-else>Impassable</p>
      <p v-if='terrain.cover > 0'>Cover: <b>{{ terrain.cover }}</b></p>
      <p v-if='terrain.facing'>Facing: <b>{{ terrain.facing }}</b></p>
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
      <p>Defense: <b>{{ unit.defense }}</b> <b class='buff' v-if='unit.defBonus > 0'>+{{ unit.defBonus }}</b></p>
      <p>Range: <b>{{ unit.range }}</b></p>
      <p>Movement: <b>{{ unit.moves }} / {{ unit.movement }}</b></p>
    </div>
  `,
  props: ['unit']
};

var UnitActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
      <div id='action-buttons'>
        <div id='move-holder' class='btn-holder'>
          <img v-if="action !== 'moving' && unit.moves > 0" id='btn-move' class='button' src='sprites/btn-move.png' title='Move (M)' @click='beginMove'>
        </div>
        <div id='attack-holder' class='btn-holder'>
          <img v-if="action !== 'attacking' && unit.attacks > 0" id='btn-attack' class='button' src='sprites/btn-attack.png' title='Attack (A)' @click='beginAttack'>
        </div>
        <div id='equip-holder' class='btn-holder'>
          <img v-if="action !== 'equipping'" id='btn-equip' class='button' src='sprites/btn-equip.png' title='Equip (E)' @click='beginEquip'>
        </div>
        <div id='cancel-holder' class='btn-holder'>
          <img v-if='action' id='btn-cancel' class='button' src='sprites/btn-cancel.png' title='Cancel (C)' @click='cancelAction'>
        </div>
      </div>
    </div>
  `,
  props: ['action', 'unit'],
  methods: {
    beginMove: function () {
      if (this.action) { this.cancelAction() }
      var unit = Game.active.unit;
      Game.target = null;
      Game.action = 'moving';
      Game.showMoveRange(unit.posY, unit.posX, unit.moves, '');
    },
    beginAttack: function () {
      if (this.action) { this.cancelAction() }
      Game.target = null;
      Game.action = 'attacking';
      Game.showAttackRange();
    },
    beginEquip: function () {
      if (this.action) { this.cancelAction() }
      Game.action = 'equipping';
      this.$nextTick(function(){ Game.makeItemsDraggable() });
    },
    cancelAction: function () {
      switch (this.action) {
        case 'moving': Game.cancelMove(); break;
        case 'attacking': Game.cancelAttack(); break;
        case 'equipping': Game.cancelEquip(); break;
      }
    }
  }
};

var TargetActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
      <div id='confatk-holder' class='btn-holder'>
        <img v-if='btnEnabled' id='btn-confatk' class='button' src='sprites/btn-confatk.png' title='Confirm Attack (A)' @click='confirmAttack'>
      </div>
    </div>
  `,
  props: ['hit'],
  data: function () {
    return { btnEnabled: true }
  },
  methods: {
    confirmAttack: function () {
      this.btnEnabled = false;
      Game.attackUnit();
    }
  }
};

var UnitCombat = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/combat-icon.png'>Combat</p>
      <p>{{ type }} hit chance: <b :style='gradient'>{{ hit }}%</b></p>
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

var ItemSlot = {
  template: `
    <div :id='type + n' class='item-slot' :style='slotBackground'>
      <img v-if='item' :id="item.id + '-' + n" class='item' :src='item.sprite' :title='item.name'>
    </div>
  `,
  props: ['type', 'n', 'item'],
  computed: {
    slotBackground: function () {
      var imgUrl = "url('sprites/" + this.type + "-slot.png')";
      return { backgroundImage: imgUrl }
    }
  }
}

var ItemHolder = {
  template: `
    <div class='item-holder'>
      <img :src="'sprites/' + type + '-card.png'">
      <div class='slot-container' :style='borderColor'>
        <item-slot v-for='n in 6' :type='type' :n='n - 1' :item='itemData[n - 1]' :key='n - 1'></item-slot>
      </div>
    </div>
  `,
  props: ['type', 'items'],
  computed: {
    borderColor: function () {
      switch (this.type) {
        case 'weapon': return { border: '1px solid #800000' }
        case 'clothing': return { border: '1px solid #000099' }
        case 'accessory': return { border: '1px solid #005900' }
      }
    },
    itemData: function () {
      var itemData = [null, null, null, null, null, null];
      this.items.forEach( function (item) {
        item.slots.forEach( function (slot, index) {
          itemData[slot] = { id: item.id, name: item.name, sprite: item.sprites[index] };
        });
      });
      return itemData;
    }
  },
  components: {
    'item-slot': ItemSlot
  }
}

var UnitItems = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/equipment-icon.png'>Equipment</p>
      <div class='equipment'>
        <item-holder type='weapon' :items='items.weapons'></item-holder>
        <item-holder type='clothing' :items='items.clothing'></item-holder>
        <item-holder type='accessory' :items='items.accessories'></item-holder>
      </div>
    </div>
  `,
  props: ['items'],
  components: {
    'item-holder': ItemHolder
  }
}

var SidePanel = {
  template: `
    <div>
      <transition name='fade'>
        <div v-if='space && space.terrain'>
          <terrain-info :terrain='space.terrain'></terrain-info>
        </div>
      </transition>
      <transition :name='dynamicTransition'>
        <div v-if='space && space.unit'>
          <unit-info :unit='space.unit'></unit-info>
          <template v-if="side === 'left'">
            <unit-actions v-if="control === 'player' && space.unit.control === 'player'" :action='action' :unit='space.unit'></unit-actions>
            <unit-combat v-if='attack' type='Attack' :hit='attack'></unit-combat>
          </template>
          <template v-else-if="side === 'right'">
            <target-actions v-if="control === 'player' && (counter || counter === 0)" :hit='counter'></target-actions>
            <unit-combat v-if='counter' type='Counter' :hit='counter'></unit-combat>
          </template>
          <unit-items v-if="action === 'equipping'" :items='space.unit.items'></unit-items>
        </div>
      </transition>
    </div>
  `,
  props: ['side', 'space', 'action', 'attack', 'counter', 'control'],
  computed: {
    dynamicTransition: function () {
      if (this.space && this.space.unit && this.space.unit.condition === 'Defeated') { return 'sayGoodbye' }
      else { return 'fade' }
    }
  },
  components: {
    'terrain-info': TerrainInfo,
    'unit-info': UnitInfo,
    'unit-combat': UnitCombat,
    'unit-actions': UnitActions,
    'target-actions': TargetActions,
    'unit-items': UnitItems
  }
};

var StatusPanel = {
  template: `
    <div class='ui'>
      <p>Turn: <b>{{ turn }}</b></p>
      <p>Faction: <b>{{ faction }}</b></p>
      <p>Units: <b>{{ units }}</b></p>
      <div v-if="control === 'player'" id='end-holder'>
        <img v-if='!action' id='btn-end' class='button' src='sprites/btn-end.png' title='End Turn' @click='endTurn'>
      </div>
    </div>
  `,
  props: ['turn', 'faction', 'control', 'units', 'action'],
  methods: {
    endTurn: function () {
      Game.endTurn();
    }
  }
}

var TurnBanner = {
  template: `
    <transition name='banner' @after-enter='bannerIn' @after-leave='bannerOut'>
      <div id='banner-back' class='banner' :style='bannerBack'>
        <div id='banner-fore' class='banner' :style='bannerFore'>
          <div id='banner-text' class='banner'>{{ faction.toUpperCase() }} TURN</div>
        </div>
      </div>
    </transition>
  `,
  props: ['faction'],
  computed: {
    bannerBack: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 140; g = 104; b = 21;  break;
        case 'Enemy':  r = 0;   g = 63;  b = 31;  break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    },
    bannerFore: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 218; g = 165; b = 32;  break;
        case 'Enemy':  r = 0;   g = 140; b = 70;  break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    }
  },
  methods: {
    bannerIn: function () {
      Game.banner = false;
    },
    bannerOut: function () {
      Game.action = null;
    }
  }
};

var Game = new Vue ({
  el:'#game',
  data: {
    mapImage: mapImage,
    map: loadLevel(),
    factions: loadFactions(),
    turn: 1,
    factionIndex: 0,
    unitIndex: 0,
    banner: false,        // controls turn animation
    action: 'beginning',  // 'beginning' / 'moving' / 'attacking' / 'equipping'
    active: null,         // Space object
    target: null,         // Space object
    attack: null,         // attack hit chance
    counter: null         // counterattack hit chance
  },
  computed: {
    faction: function () {
      return this.factions[this.factionIndex];
    },
    control: function () {
      return unitPlan.filter( f => f.faction === this.faction )[0].control;
    },
    units: function () {
      return shuffle(this.getUnits(this.faction));
    }
  },
  watch: {
    active: function () {
      if (this.active && this.active.unit) {
        this.map[this.active.unit.posY][this.active.unit.posX].unit.defBonus = this.defenseBonus(this.active, this.target);
      }
    },
    target: function () {
      if (this.active && this.active.unit && this.target) {
        this.map[this.active.unit.posY][this.active.unit.posX].unit.defBonus = this.defenseBonus(this.active, this.target);
        this.map[this.target.unit.posY][this.target.unit.posX].unit.defBonus = this.defenseBonus(this.target, this.active);
      }
    }
  },
  methods: {
    showMoveRange: function (y, x, moves, path) {
      var origin = this.map[y][x],
          east = this.map[y][Math.min(x + 1, 15)],
          sout = this.map[Math.min(y + 1, 15)][x],
          west = this.map[y][Math.max(x - 1, 0)],
          nort = this.map[Math.max(y - 1, 0)][x],
          explore = [],
          goEast = function () { Game.showMoveRange(y, Math.min(x + 1, 15), moves - east.terrain.cost, path + 'e') },
          goSout = function () { Game.showMoveRange(Math.min(y + 1, 15), x, moves - sout.terrain.cost, path + 's') },
          goWest = function () { Game.showMoveRange(y, Math.max(x - 1, 0),  moves - west.terrain.cost, path + 'w') },
          goNort = function () { Game.showMoveRange(Math.max(y - 1, 0), x,  moves - nort.terrain.cost, path + 'n') };
      if (!origin.moves) { origin.moves = moves }
      if (east.terrain.cost <= moves && (!east.moves || moves - east.terrain.cost > east.moves) && east.unit === null)
        { east.moves = moves - east.terrain.cost; east.path = path + 'e'; explore.push(goEast) }
      if (sout.terrain.cost <= moves && (!sout.moves || moves - sout.terrain.cost > sout.moves) && sout.unit === null)
        { sout.moves = moves - sout.terrain.cost; sout.path = path + 's'; explore.push(goSout) }
      if (west.terrain.cost <= moves && (!west.moves || moves - west.terrain.cost > west.moves) && west.unit === null)
        { west.moves = moves - west.terrain.cost; west.path = path + 'w'; explore.push(goWest) }
      if (nort.terrain.cost <= moves && (!nort.moves || moves - nort.terrain.cost > nort.moves) && nort.unit === null)
        { nort.moves = moves - nort.terrain.cost; nort.path = path + 'n'; explore.push(goNort) }
      shuffle(explore).forEach( function (f) { f(); } );
    },
    cancelMove: function () {
      this.hideMoveRange();
      this.action = null;
    },
    hideMoveRange: function () {
      var y, x,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          moves = this.active.unit.moves;
      for (y = Math.max(posY - moves, 0); y <= Math.min(posY + moves, 15); y++) {
        for (x = Math.max(posX - moves, 0); x <= Math.min(posX + moves, 15); x++) {
          this.map[y][x].moves = null;
          this.map[y][x].path = null;
        }
      }
    },
    moveUnit: function (y, x, path) {
      var moveObj = { y: y, x: x, moving: null, changePos: null },
          spaceFrom, spaceTo, unitData;
      if (path) {
        this.hideMoveRange();
        this.map[y][x].unit.path = path;
      }
      switch (this.map[y][x].unit.path[0]) {
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
      spaceFrom = this.map[y][x],
      spaceTo = this.map[moveObj.y][moveObj.x],
      unitData = spaceFrom.unit;
      spaceFrom.unit = null;
      unitData.moves -= spaceTo.terrain.cost;
      unitData.moving = moveObj.moving;
      unitData.path = unitData.path.substr(1);
      moveObj.changePos();
      spaceTo.unit = unitData;
      this.active = spaceTo;
    },
    showAttackRange: function () {
      var f, y, x, s, distance, angle, width, shadows = [], inLineOfSight,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range,
          findShadows = function (y, x) {
            if (!Game.map[y][x].terrain.seeThru) {
              distance = Math.abs(posY - y) + Math.abs(posX - x);
              angle = Math.atan2(y - posY, x - posX);
              width = Math.PI / (4 * distance);
              shadows.push({ distance: distance, angle: angle, width: width });
            }
          },
          findAttackRange = function (y, x) {
            distance = Math.abs(posY - y) + Math.abs(posX - x);
            if (distance <= range && Game.map[y][x].terrain.seeThru) {
              inLineOfSight = true;
              angle = Math.atan2(y - posY, x - posX);
              for (s = 0; s < shadows.length; s++) {
                if (Math.abs(shadows[s].angle - angle) < shadows[s].width && distance > shadows[s].distance) {
                  inLineOfSight = false;
                  break;
                }
              }
              if (inLineOfSight) { Game.map[y][x].distance = distance }
            }
          },
          functions = [findShadows, findAttackRange];
      for (f = 0; f < 2; f++) {
        for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
          for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
            functions[f](y, x);
          }
        }
      }
    },
    cancelAttack: function () {
      this.hideAttackRange();
      this.action = null;
      this.target = null;
      this.attack = null;
      this.counter = null;
    },
    hideAttackRange: function (targetY, targetX) {
      var y, x, distance, targetDistance,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      if (targetY && targetX) { targetDistance = this.map[targetY][targetX].distance }
      for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
        for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
          this.map[y][x].distance = null;
        }
      }
      if (targetY && targetX) { this.map[targetY][targetX].distance = targetDistance }
    },
    targetUnit: function (y, x) {
      this.target = this.map[y][x];
      var attacker = this.active.unit,
          defender = this.target.unit,
          attackTotal, attack, counterTotal, counter;
      attackTotal = attacker.offense + defender.defense + this.defenseBonus(this.target, this.active);
      attack = attacker.offense / attackTotal;
      this.attack = Math.round(attack * 100);
      if (defender.range >= this.target.distance) {
        counterTotal = defender.offense + attacker.defense + this.defenseBonus(this.active, this.target);
        counter = defender.offense / counterTotal;
        this.counter = Math.round(counter * 100);
      } else {
        this.counter = 0;
      }
    },
    defenseBonus: function (defender, attacker) {
      var defBonus = 0,
          cover = defender.terrain.cover,
          facing = defender.terrain.facing;
      if (!facing) { defBonus += cover }
      if (attacker) {
        if (facing) {
          switch (facing) {
            case 'East': if (attacker.posX > defender.posX) { defBonus += cover } break;
            case 'South': if (attacker.posY > defender.posY) { defBonus += cover } break;
            case 'West': if (attacker.posX < defender.posX) { defBonus += cover } break;
            case 'North': if (attacker.posY < defender.posY) { defBonus += cover } break;
          }
        }
        defBonus += Math.abs(defender.posY - attacker.posY) + Math.abs(defender.posX - attacker.posX) - 1;
      }
      return defBonus;
    },
    attackUnit: function (counter) {
      var attacker, defender, hitChance, spacesY, spacesX, pixelsY, pixelsX, evadeSprite, attack, hit, miss;
      if (!counter) {
        this.map[this.target.posY][this.target.posX].distance = null;
        attacker = this.active.unit;
        defender = this.target.unit;
        hitChance = this.attack;
      } else {
        attacker = this.target.unit;
        defender = this.active.unit;
        hitChance = this.counter;
      }
      spacesY = defender.posY - attacker.posY;
      spacesX = defender.posX - attacker.posX;
      pixelsY = Math.round(16 * Math.sin(Math.atan2(spacesY, spacesX)));
      pixelsX = Math.round(16 * Math.cos(Math.atan2(spacesY, spacesX)));
      evadeSprite = "url('" + defender.sprite.slice(0, -4) + "-evade.png')";
      attack = {
        zIndex: [ 99, 99 ],
        top: [0, (pixelsY + 'px'), 0 ],
        left: [0, (pixelsX + 'px'), 0 ],
        easing: 'ease-in-out'
      };
      hit = {
        top: [0, (pixelsY / 3 + 'px'), 0 ],
        left: [0, (pixelsX / 3 + 'px'), 0 ],
        boxSizing: ['border-box', 'border-box'],
        backgroundImage: ["url('sprites/attack-hit.png')", "url('sprites/attack-hit.png')"],
        paddingLeft: ['32px', '32px'],
        easing: 'ease-in-out'
      };
      miss = {
        boxSizing: ['border-box', 'border-box'],
        backgroundImage: [evadeSprite, evadeSprite],
        paddingLeft: ['32px', '32px'],
        easing: 'ease-in-out'
      };
      document.getElementById(attacker.id).animate(attack, 500);
      if (Math.random()*100 <= hitChance) {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(hit, 250) }, 250);
        window.setTimeout(function(){ Game.dealDamage(defender.posY, defender.posX) }, 250);
      } else {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(miss, 350) }, 150);
      }
      window.setTimeout(function(){
        if (!counter && Game.counter > 0 && defender.condition !== 'Defeated') {
          Game.attackUnit('counter');
        } else {
          Game.endAttack();
        }
      }, 500);
    },
    dealDamage: function (y, x) {
      var unit = this.map[y][x].unit;
      switch (unit.condition) {
        case 'Healthy': unit.condition = 'Injured'; break;
        case 'Injured': unit.condition = 'Critical'; break;
        case 'Critical': unit.condition = 'Defeated'; break;
      }
      if (unit.condition === 'Defeated') {
        window.setTimeout(function(){ Game.map[y][x].unit = null }, 500)
      }
    },
    endAttack: function () {
      var unit = this.active.unit;
      if (unit) { this.map[unit.posY][unit.posX].unit.attacks -= 1 }
      this.action = null;
      this.attack = null;
      this.counter = null;
    },
    makeItemsDraggable: function () {
      console.log('Making items draggable.');
      $( '.item' ).draggable({
        revert: 'invalid',
        snap: '.ui-droppable',
        snapMode: 'inner',
        snapTolerance: 8,
        stack: '.item',
        start: function(event, ui){
          console.log('Starting drag.');
          $(this).css('cursor', '-webkit-grabbing');
          var slotId = event.target.parentNode.id;
          Game.findDroppableSlots(slotId.slice(0, -1), Number(slotId.slice(-1)), event.target.id.slice(0, -2));
        },
        stop: function(event, ui){
          console.log('Stopping drag.');
          $(this).css('cursor', '-webkit-grab');
          $( '.ui-droppable' ).droppable( 'destroy' );
        }
      });
    },
    cancelEquip: function () {
      this.action = null;
    },
    findDroppableSlots: function (itemType, slotNum, itemId) {
      console.log('Finding droppable slots.');
      console.log(itemType + ', ' + slotNum + ', ' + itemId);
      var itemList = this.active.unit.items[this.convertItemType(itemType)],
          itemMap = [null, null, null, null, null, null],
          itemFootprint = [],
          slots = [0, 1, 2, 3, 4, 5].filter(s => s !== slotNum),
          droppable = [],
          cinderella; // does the foot (item) fit the shoe (slot)?
      itemList.forEach( function (item) {
        item.slots.forEach( function (slot) {
          itemMap[slot] = item.id;
        });
      });
      console.log(itemMap);
      itemMap.forEach( function (slot, index) {
        if (slot === itemId) {
          itemFootprint.push(index - slotNum);
          itemMap[index] = null;
        }
      });
      console.log(itemMap);
      console.log(itemFootprint);
      console.log(slots);
      slots.forEach( function (slot) {
        cinderella = true;
        itemFootprint.forEach( function (toe) {
          if (itemMap[slot + toe] !== null) { cinderella = false; }
        });
        if (cinderella) { droppable.push(itemType + slot) }
      });
      console.log(droppable);
      droppable = droppable.map( s => '#' + s ).join(',');
      this.makeSlotsDroppable(droppable);
    },
    convertItemType: function (itemType) {
      switch (itemType) {
        case 'weapon': return 'weapons';
        case 'clothing': return 'clothing';
        case 'accessory': return 'accessories';
      }
    },
    makeSlotsDroppable: function (droppable) {
      console.log('Making slots droppable.');
      $( droppable ).droppable({
        drop: function (event, ui) {
          console.log('Dropping item.');
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemType = Game.convertItemType(event.target.id.slice(0, -1)),
              itemList = Game.map[y][x].unit.items[itemType],
              itemId = ui.draggable[0].id.slice(0, -2),
              itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
              itemSlots = itemList[itemIndex].slots,
              translation = Number(event.target.id.slice(-1)) - Number(ui.draggable[0].id.slice(-1));
          Game.map[y][x].unit.items[itemType][itemIndex].slots = [];
          Vue.nextTick(function(){
            Game.map[y][x].unit.items[itemType][itemIndex].slots = itemSlots.map( s => s + translation );
            Vue.nextTick(function(){ Game.makeItemsDraggable() });
          });
        }
      });
    },
    beginTurn: function () {
      var u, unit, units = this.units;
      if (units.length > 0) {
        for (u = 0; u < units.length; u++) {
          unit = this.map[units[u].posY][units[u].posX].unit;
          unit.moves = unit.movement;
          unit.attacks = unit.attacksperturn;
        }
        this.banner = true;
        this.action = 'beginning';
        if (this.control === 'ai') {
          window.setTimeout(function(){ Game.aiFaction() }, 2000);
        }
      } else {
        this.endTurn();
      }
    },
    getUnits: function (faction) {
      var y, x, space, units = [];
      for (y = 0; y < 16; y++) {
        for (x = 0; x < 16; x++) {
          space = this.map[y][x];
          if (space.unit && space.unit.faction === faction) { units.push(space.unit) }
        }
      }
      return units;
    },
    aiFaction: function () {
      var unitFunc;
      if (this.unitIndex < this.units.length) {
        switch (this.units[this.unitIndex].behavior) {
          case 'dumb': unitFunc = this.aiUnitDumb; break;
          case 'sentry': unitFunc = this.aiUnitSentry; break;
        }
        window.setTimeout(function(){ unitFunc() }, 500);
      } else {
        this.unitIndex = 0;
        this.endTurn();
      }
    },
    aiUnitDumb: function () {
      window.setTimeout(function(){ Game.aiPassControl() }, 500);
    },
    aiUnitSentry: function () {
      var unit = this.units[this.unitIndex];
      this.active = this.map[unit.posY][unit.posX];
      unit = this.active.unit;
      window.setTimeout(function(){
        Game.showAttackRange();
        Game.aiChooseTarget();
      }, 500);
      window.setTimeout(function(){
        if (Game.target) {
          Game.attackUnit();
          window.setTimeout(function(){
            if (Game.active.unit.condition !== 'Defeated' && Game.target.unit.condition !== 'Defeated') {
              window.setTimeout(function(){ Game.aiPassControl() }, 500);
            }
            else {
              window.setTimeout(function(){ Game.aiPassControl() }, 2000);
            }
          }, 1000);
        } else {
          Game.aiPassControl();
        }
      }, 1000);
    },
    aiChooseTarget: function () {
      var y, x, space, targets = [], bestAttack = 0,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      for (y = Math.max(posY - range, 0); y <= Math.min(posY + range, 15); y++) {
        for (x = Math.max(posX - range, 0); x <= Math.min(posX + range, 15); x++) {
          space = this.map[y][x];
          if (space.distance && space.unit && space.unit.friendly !== this.active.unit.friendly) {
            this.targetUnit(y, x);
            targets.push({ posY: y, posX: x, attack: this.attack });
          }
        }
      }
      if (targets.length > 0) {
        targets.forEach( function (target) { if (target.attack > bestAttack) { bestAttack = target.attack } });
        target = shuffle(targets.filter(target => target.attack === bestAttack))[0];
        this.hideAttackRange(target.posY, target.posX);
        this.targetUnit(target.posY, target.posX);
      } else {
        this.cancelAttack();
      }
    },
    aiPassControl: function () {
      this.unitIndex += 1;
      this.aiFaction();
    },
    endTurn: function () {
      if (this.factionIndex < this.factions.length - 1) {
        this.factionIndex += 1;
      } else {
        this.turn += 1;
        this.factionIndex = 0;
      }
      this.action = null;
      this.active = null;
      this.target = null;
      this.beginTurn();
    }
  },
  components: {
    'row': Row,
    'side-panel': SidePanel,
    'status-panel': StatusPanel,
    'turn-banner': TurnBanner
  }
});

function keyHandler () {
  console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Game.control === 'player' && Game.active && Game.active.unit && Game.active.unit.control === 'player') {
    switch (event.keyCode) {
      case 65: // a
        if (Game.action !== 'attacking') {
          $( '#btn-attack' ).trigger( 'click' );
        } else {
          $( '#btn-confatk' ).trigger( 'click' );
        }
        break;
      case 67: // c
        $( '#btn-cancel' ).trigger( 'click' );
        break;
      case 69: // e
        $( '#btn-equip' ).trigger( 'click' );
        break;
      case 77: // m
        $( '#btn-move' ).trigger( 'click' );
        break;
    }
  }
}

$( document ).keyup( keyHandler );

window.setTimeout(function(){ Game.beginTurn() }, 500);

});