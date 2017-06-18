var mapImage = { backgroundImage: "url('maps/level1.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - b b a a l l a a - - - - ',
  ' - - - - b s s B B s s a - - - - ',
  ' - - - - a s s B B s s b - - - - ',
  ' - - - - a a l l a a b b - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

class Terrain {
  constructor(type, name, cost, cover, elevation, seeThru) {
    this.type = type;
    this.name = name;
    this.cost = cost;
    this.cover = cover;
    this.facing = null;
    this.elevation = elevation;
    this.seeThru = seeThru;
  }
}

var barren = new Terrain('barren', 'Barren', 99, 0, 0, true),
    ground = new Terrain('ground', 'Ground', 1, 0, 0, true),
    sand = new Terrain('sand', 'Sand', 2, 0, 0, true),
    grass = new Terrain('grass', 'Grass', 1, 0, 0, true),
    brush = new Terrain('brush', 'Brush', 2, 1, 0, true),
    boulder = new Terrain('boulder', 'Boulder', 99, 0, 0, false),
    log = new Terrain('log', 'Log', 1, 2, 0, true);

class Space {
  constructor(posY, posX, terrain) {
    this.posY = posY;
    this.posX = posX;
    this.terrain = terrain;
    this.unit = null;
    this.moves = null;
    this.path = null;
    this.distance = null;
    this.items = [];
  }
}

class Item {
  constructor(index, id, name, descrip, effects, footprint, slot) {
    this.index = index;
    this.id = id;
    this.sprite = 'sprites/' + id.replace(/\d/, '') + '.png';
    this.name = name;
    this.descrip = descrip;
    this.effects = effects;
    this.footprint = footprint;
    if (footprint.length === 1) {
      this.sprites = [this.sprite];
    } else {
      var n, sprites = [];
      for (n = 0; n < footprint.length; n++) {
        sprites.push('sprites/' + id.replace(/\d/, '') + footprint[n] + '.png');
      }
      this.sprites = sprites;
    }
    if (!slot) { slot = 0 }
    this.slots = footprint.map( toe => toe + slot );
  }
}

class Weapon extends Item {
  constructor(index, id, name, descrip, type, power, range, effects, footprint, slot) {
    super(index, id, name, descrip, effects, footprint, slot);
    this.itemType = 'weapon';
    this.type = type;
    this.power = power;
    switch (type) {
      case 'melee': this.range = [1, 1]; break;
      case 'throwing': this.range = [1, range]; break;
      case 'ranged': this.range = [2, range]; break;
    }
    this.equipped = false;
  }
}

class Clothing extends Item {
  constructor(index, id, name, descrip, armor, effects, footprint, slot) {
    super(index, id, name, descrip, effects, footprint, slot);
    this.itemType = 'clothing';
    this.armor = armor;
  }
}

class Accessory extends Item {
  constructor(index, id, name, descrip, effects, footprint, slot) {
    super(index, id, name, descrip, effects, footprint, slot);
    this.itemType = 'accessory';
  }
}

var claws = new Weapon(1, 'claws', 'Claws', 'Built for digging but useful in a fight.', 'melee', 1, 1, null, [0]),
    stones1 = new Weapon(3, 'stones1', 'Stones', 'The original projectile weapon.', 'throwing', 1, 3, null, [0]),
    stones2 = new Weapon(3, 'stones2', 'Stones', 'The original projectile weapon.', 'throwing', 1, 3, null, [0]),
    stick1 = new Weapon(2, 'stick1', 'Heavy Stick', 'An unusually heavy stick.', 'melee', 2, 1, null, [0, 2]),
    stick2 = new Weapon(2, 'stick2', 'Heavy Stick', 'An unusually heavy stick.', 'melee', 2, 1, null, [0, 2]),
    tunic = new Clothing(4, 'tunic', 'Tunic', 'Comfy and easy to wear.', 1, null, [0]),
    boots = new Clothing(5, 'boots', 'Boots', "Made for walkin'.", 0, { movement: 1 }, [0]),
    salve1 = new Accessory(6, 'salve1', 'Salve', 'Heals most any wound.', { hp: 2 }, [0]),
    salve2 = new Accessory(6, 'salve2', 'Salve', 'Heals most any wound.', { hp: 2 }, [0]);

var itemPlan = [
  {
    posY: 8,
    posX: 6,
    items: [stones1, stick1, tunic, boots, salve1]
  }
];

class Unit {
  constructor(id, faction, sprite, name, strength, melee, throwing, ranged, agility, toughness, movement, weapons, clothing, accessories, posY, posX, friendly, control, behavior) {
    this.id = id;
    this.faction = faction;
    this.sprite = 'sprites/' + sprite;
    this.name = name;
    this.hp = 3;
    this.strength = strength;
    this.melee = melee;
    this.throwing = throwing;
    this.ranged = ranged;
    this.agility = agility;
    this.toughness = toughness;
    this.items = {
      weapons: weapons,
      clothing: clothing,
      accessories: accessories
    };
    if (this.items.weapons.length) {
      this.items.weapons[0].equipped = true;
    }
    // hidden properties
    this.movement = movement;
    this.moves = this.movement;
    this.posY = posY;
    this.posX = posX;
    this.moving = null;
    this.path = null;
    this.attacksperturn = 1;
    this.attacks = this.attacksperturn;
    this.friendly = friendly;
    this.control = control;
    if (behavior) { this.behavior = behavior }
  }
  // getters
  get condition() {
    switch (this.hp) {
      case 3: return 'Healthy';
      case 2: return 'Wounded';
      case 1: return 'Critical';
      case 0: return 'Defeated';
    }
  }
  get equipped() { return this.items.weapons.filter( weapon => weapon.equipped === true )[0] }
  get skill() { if (this.equipped) { return this[this.equipped.type] } else { return this.melee } }
  get range() { if (this.equipped) { return this.equipped.range } else { return [1, 1] } }
  get armor() { return this.items.clothing.reduce( (a, b) => a + b.armor , 0) }
}

var player0 = new Unit('player0', 'Player', 'player.png', 'Player Unit', 1, 1, 1, 1, 1, 2, 5, [claws], [], [], 9, 4, true, 'player'),
    enemy0  = new Unit('enemy0', 'Enemy', 'enemy.png', 'Enemy Unit', 2, 1, 1, 1, 1, 1, 5, [stones2], [], [], 6, 11, false, 'ai', 'sentry');

var unitPlan = [
  {
    faction: 'Player',
    control: 'player',
    units: [ player0 ]
  }, {
    faction: 'Enemy',
    control: 'ai',
    units: [ enemy0 ]
  }
];

class DialogEvent {
  constructor(unit, message) {
    this.eventType = 'dialog';
    this.portrait = 'sprites/' + unit.id.replace(/\d/, '') + '-portrait.png';
    this.message = message;
  }
}

class CombatEvent {
  constructor(unit, target, damage) {
    this.eventType = 'combat';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    this.verb = 'attacked';
    this.verbIcon = 'sprites/' + unit.equipped.type + '.png';
    this.object = target.name;
    this.objectIcon = 'sprites/' + target.id.replace(/\d/, '') + '-icon.png';
    switch (damage) {
      case 0: this.result = 'Attack missed.'; break;
      case 1: this.result = 'Attack hit.'; break;
      case 2: this.result = 'Critical hit!'; break;
    }
  }
}

class ConditionEvent {
  constructor(unit) {
    this.eventType = 'condition';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    if (unit.hp > 0) { this.verb = 'is' } else { this.verb = 'was' }
    this.object = unit.condition.toLowerCase();
  }
}

class ItemEvent {
  constructor(unit, verb, item) {
    this.eventType = 'item';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    this.verb = verb;
    this.object = item.name;
    this.objectIcon = 'sprites/' + item.id.replace(/\d/, '') + '-icon.png';
  }
}

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

function loadItems (mapData, itemPlan) {
  for (var space of itemPlan) {
    mapData[space.posY][space.posX].items = space.items;
  }
  return mapData;
}

function loadUnits (mapData, unitPlan) {
  var faction, unit;
  for (faction of unitPlan) {
    for (unit of faction.units) {
      mapData[unit.posY][unit.posX].unit = unit;
    }
  }
  return mapData;
}

function loadLevel () {
  return loadUnits(loadItems(directionalCover(loadMap(mapPlan)), itemPlan), unitPlan);
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
              if (!Game.target || unit !== Game.target.unit) {
                Game.hideAttackRange(y, x);
                Game.targetUnit(y, x);
              } else {
                $( '#btn-confatk' ).trigger( 'click' );
              }
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

var ItemInfo = {
  template: `
    <div class='item-info'>
      <p>
        <b>{{ item.name }}</b>
        <template v-if="type === 'weapon'">
          <span>{{ capitalize(item.type) }}</span>
          <span>Power: <b>{{ item.power }}</b></span>
          <span v-if="item.type !== 'melee'">Range: <b>{{ item.range[1] }}</b></span>
        </template>
        <template v-if="type === 'clothing'">
          <span v-if='item.armor > 0'>Armor: <b>{{ item.armor }}</b></span>
        </template>
        <span v-for='effect in effects'>{{ effect }}</span>
      </p>
      <p>{{ item.descrip }}</p>
    </div>
  `,
  props: ['type', 'item'],
  computed: {
    effects: function () {
      if (this.item && this.item.effects) {
        var sign, effects = [];
        for (var [attribute, effect] of Object.entries(this.item.effects)) {
          if (attribute === 'hp') { effects.push('Restore HP'); }
          else {
            if (effect > 0) { sign = '+' } else { sign = '-' }
            effects.push(this.capitalize(attribute) + ' ' + sign + effect);
          }
        }
        return effects;
      }
    }
  },
  methods: {
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
};

var GroundItem = {
  template: `
    <div class='ground-item'>
      <img :id="item.id" class='item ground' :class='[item.itemType, item.id]' :src='item.sprite' :title='item.name'>
      <item-info :type='item.itemType' :item='item'></item-info>
    </div>
  `,
  props: ['item'],
  components: {
    'item-info': ItemInfo
  }
};

var GroundPanel = {
  template: `
    <div v-if='items.length > 0' id='ground-panel'>
      <ground-item v-for='item in items' :item='item' :key='item.id'></ground-item>
    </div>
  `,
  props: ['items'],
  components: {
    'ground-item': GroundItem
  }
};

var TerrainInfo = {
  template: `
    <div class='ui flex'>
      <div class='columns'>
        <div class='heading'><div class='icon' :class='terrain.type'></div>{{ terrain.name }}</div>
        <p v-if='terrain.cost < 99'>Move cost: <b>{{ terrain.cost }}</b></p><p v-else>Impassable</p>
      </div>
      <div class='columns' style='padding-top: 3px'>
        <p v-if='terrain.cover > 0'>Cover: <b>{{ terrain.cover }}</b></p>
        <p v-if='terrain.facing'>Facing: <b>{{ terrain.facing }}</b></p>
      </div>
      <p v-if='terrain.elevation > 0'>Elevation: <b>{{ terrain.elevation }}</b></p>
    </div>
  `,
  props: ['terrain']
};

var UnitInfo = {
  template: `
    <div class='ui' id='unit-info'>
      <div class='heading'><div class='icon' :class='unit.faction'></div>{{ unit.name }}</div>
      <p>Condition: <b :class='unit.condition'>{{ unit.condition }}</b></p>
      <p>Strength: <b>{{ unit.strength }}</b></p>
      <p>Skill: <b>{{ unit.skill }}</b></p>
      <p>Agility: <b>{{ unit.agility }}</b></p>
      <p>Toughness: <b>{{ unit.toughness }}</b></p>
      <p v-if='unit.equipped'>Equipped: <b>{{ unit.equipped.name }}</b></p>
      <p v-else>Equipped: --</p>
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
      Vue.nextTick(function(){
        Game.makeEquipItemsDraggable('.equip');
        Game.makeGroundItemsDraggable('.ground');
      });
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

var CombatInfo = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/combat-icon.png'>Combat</p>
      <div class='flex'>
        <div class='columns'>
          <template v-if="type === 'active'">
            <p>Attack: <b>{{ combat.activeAtk }}</b></p>
            <p v-if='combat.canCounter'>Defense: <b>{{ combat.activeDef }}</b></p>
          </template>
          <template v-else-if="type === 'target'">
            <p v-if='combat.canCounter'>Attack: <b>{{ combat.targetAtk }}</b></p>
            <p>Defense: <b>{{ combat.targetDef }}</b></p>
          </template>
        </div>
        <div class='columns flex'>
          <template v-if="type === 'active'"><p>Hit:</p><p class='bold' :style='gradient'><span class='big'>{{ combat.activeHit }}</span>%</p></template>
          <template v-else-if="type === 'target' && combat.canCounter"><p>Hit:</p><p class='bold':style='gradient'><span class='big'>{{ combat.targetHit }}</span>%</p></template>
        </div>
      </div>
    </div>
  `,
  props: ['type', 'combat'],
  computed: {
    gradient: function () {
      var hit;
      if      (this.type === 'active') { hit = this.combat.activeHit }
      else if (this.type === 'target') { hit = this.combat.targetHit }
      if (hit < 10) { return { color: '#bf0000' } }
      else if (hit < 20) { return { color: '#d01b00' } }
      else if (hit < 30) { return { color: '#e13600' } }
      else if (hit < 40) { return { color: '#f25100' } }
      else if (hit < 50) { return { color: '#ea6a00' } }
      else if (hit < 60) { return { color: '#e28300' } }
      else if (hit < 70) { return { color: '#da9c00' } }
      else if (hit < 80) { return { color: '#97a406' } }
      else if (hit < 90) { return { color: '#55ab0c' } }
      else { return { color: '#12b312' } }
    }
  }
};

var ItemSlot = {
  template: `
    <div :id='type + n' class='item-slot' :style='slotBackground' @click='showInfo($event)'>
      <img v-if='item' :id="item.id + '-' + n" class='item equip' :class='[type, item.id]' :src='imgSrc' :title='item.name'>
      <div v-if="item && itemtip === type + n" id='item-tip'>
        <item-info :type='type' :item='item'></item-info>
      </div>
    </div>
  `,
  props: ['type', 'n', 'item', 'itemtip'],
  computed: {
    slotBackground: function () {
      var imgUrl = "url('sprites/" + this.type + "-slot.png')";
      return { backgroundImage: imgUrl }
    },
    imgSrc: function () {
      if (this.item) {
        return this.item.sprites[this.item.slots.indexOf(this.n)];
      }
    }
  },
  methods: {
    showInfo: function (event) {
      if (event.target.tagName !== 'DIV') {
        if (!this.itemtip) {
          Game.itemtip = this.type + this.n;
        } else {
          Game.itemtip = null;
        }
      }
    }
  },
  components: {
    'item-info': ItemInfo
  }
};

var ItemHolder = {
  template: `
    <div class='item-holder'>
      <img :src="'sprites/' + type + '-card.png'">
      <div class='slot-container' :style='borderColor'>
        <item-slot v-for='n in 6' :type='type' :n='n - 1' :item='itemData[n - 1]' :itemtip='itemtip' :key='n - 1'></item-slot>
      </div>
    </div>
  `,
  props: ['type', 'items', 'itemtip'],
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
        item.slots.forEach( function (slot) {
          itemData[slot] = item;
        });
      });
      return itemData;
    }
  },
  components: {
    'item-slot': ItemSlot
  }
};

var UnitItems = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/equipment-icon.png'>Equipment</p>
      <div class='equipment'>
        <item-holder type='weapon' :items='items.weapons' :itemtip='itemtip'></item-holder>
        <item-holder type='clothing' :items='items.clothing' :itemtip='itemtip'></item-holder>
        <item-holder type='accessory' :items='items.accessories' :itemtip='itemtip'></item-holder>
      </div>
    </div>
  `,
  props: ['items', 'itemtip'],
  components: {
    'item-holder': ItemHolder
  }
};

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
            <combat-info v-if="combat && action === 'attacking'" type='active' :combat='combat'></combat-info>
          </template>
          <template v-else-if="side === 'right' && action === 'attacking'">
            <target-actions v-if="control === 'player' && space"></target-actions>
            <combat-info v-if='combat' type='target' :combat='combat'></combat-info>
          </template>
          <unit-items v-if="side === 'left' && action === 'equipping'" :items='space.unit.items' :itemtip='itemtip'></unit-items>
        </div>
      </transition>
    </div>
  `,
  props: ['side', 'space', 'action', 'combat', 'itemtip', 'control'],
  computed: {
    dynamicTransition: function () {
      if (this.space && this.space.unit && this.space.unit.condition === 'Defeated') { return 'sayGoodbye' }
      else { return 'fade' }
    }
  },
  components: {
    'terrain-info': TerrainInfo,
    'unit-info': UnitInfo,
    'combat-info': CombatInfo,
    'unit-actions': UnitActions,
    'target-actions': TargetActions,
    'unit-items': UnitItems
  }
};

var Event = {
  template: `
    <div class='event'>
      <p>{{ event }}</p>
    </div>
  `,
  props: ['event']
};

var EventLog = {
  template:`
    <div class='ui' id='event-log'>
      <event v-for='event in events' :event='event' :key='event'></event>
    </div>
  `,
  props: ['events'],
  components: {
    'event': Event
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
};

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

// BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF BLUE STUFF

var Game = new Vue ({
  el:'#game',
  data: {
    mapImage: mapImage,
    map: loadLevel(),
    factions: loadFactions(),
    turn: 1,
    factionIndex: 0,
    unitIndex: 0,
    banner: false,
    action: 'beginning',
    active: null,
    target: null,
    itemtip: null,
    events: ['Dialog', 'Event']
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
    },
    distance: function () {
      if (this.target) {
        return Math.abs(this.active.posY - this.target.posY) + Math.abs(this.active.posX - this.target.posX);
      }
    },
    combat: function () {
      if (this.active && this.target && this.active.unit && this.target.unit) {
        return {
          activeAtk: this.calculateAttack(this.active),
          activeDef: this.calculateDefense(this.active, this.target),
          targetAtk: this.calculateAttack(this.target),
          targetDef: this.calculateDefense(this.target, this.active),
          get activeHit() { return Math.round(this.activeAtk / (this.activeAtk + this.targetDef) * 100) },
          get targetHit() { return Math.round(this.targetAtk / (this.targetAtk + this.activeDef) * 100) },
          get activeCrt() { return Game.active.unit.skill },
          get targetCrt() { return Game.target.unit.skill },
          canCounter: this.checkRange(this.distance, this.target.unit.range)
        }
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
            if (distance >= range[0] && distance <= range[1] && Game.map[y][x].terrain.seeThru) {
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
        for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
          for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
            functions[f](y, x);
          }
        }
      }
    },
    cancelAttack: function () {
      this.hideAttackRange();
      this.action = null;
      this.target = null;
    },
    hideAttackRange: function (targetY, targetX) {
      var y, x, distance, targetDistance,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      if (targetY && targetX) { targetDistance = this.map[targetY][targetX].distance }
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          this.map[y][x].distance = null;
        }
      }
      if (targetY && targetX) { this.map[targetY][targetX].distance = targetDistance }
    },
    targetUnit: function (y, x) {
      var target = this.map[y][x];
      if (!this.checkRange(target.distance, target.unit.range)) {
        var w, weapons = target.unit.items.weapons;
        for (w = 0; w < weapons.length; w++) {
          if (Game.checkRange(target.distance, weapons[w].range)) {
            Game.equipWeapon(y, x, w);
            break;
          }
        }
      }
      this.target = target;
    },
    calculateAttack: function (atkSpace) {
      // attack = strength + skill + power - distance
      var attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          attack = 0;
      if (attackType === 'melee' || attackType === 'throwing') { attack += attacker.strength }
      attack += attacker[attackType] + attacker.equipped.power - (this.distance - 1);
      return attack;
    },
    calculateDefense: function (defSpace, atkSpace) {
      // defense = agility + toughness + armor + cover + elevation
      var defender = defSpace.unit,
          attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          cover = defSpace.terrain.cover,
          facing = defSpace.terrain.facing,
          defense = 0;
      if (attackType === 'melee' || attackType === 'throwing') { defense += defender.agility }
      defense += defender.toughness + defender.armor;
      if (!facing) { defense += cover }
      else {
        switch (facing) {
          case 'East':  if (attacker.posX > defender.posX) { defense += cover } break;
          case 'South': if (attacker.posY > defender.posY) { defense += cover } break;
          case 'West':  if (attacker.posX < defender.posX) { defense += cover } break;
          case 'North': if (attacker.posY < defender.posY) { defense += cover } break;
        }
      }
      defense += defSpace.terrain.elevation - atkSpace.terrain.elevation;
      return defense;
    },
    checkRange: function (distance, range) {
      if (distance >= range[0] && distance <= range[1]) { return true }
    },
    equipWeapon: function (y, x, weaponIndex) {
      var unit = this.map[y][x].unit,
          weapons = unit.items.weapons,
          unequipId, unequipIndex;
      if (unit.equipped) {
        unequipId = unit.equipped.id,
        unequipIndex = weapons.indexOf(weapons.filter( i => i.id === unequipId )[0]);
        this.map[y][x].unit.items.weapons[unequipIndex].equipped = false;
      }
      this.map[y][x].unit.items.weapons[weaponIndex].equipped = true;
    },
    attackUnit: function (counter) {
      var attacker, defender, hitChance, crtChance, damage = 0;
      if (!counter) {
        this.map[this.target.posY][this.target.posX].distance = null;
        attacker = this.active.unit;
        defender = this.target.unit;
        hitChance = this.combat.activeHit;
        crtChance = this.combat.activeCrt;
      } else {
        attacker = this.target.unit;
        defender = this.active.unit;
        hitChance = this.combat.targetHit;
        crtChance = this.combat.targetCrt;
      }
      if (Math.random()*100 <= hitChance) {
        damage += 1;
        if (Math.random()*100 <= crtChance) {
          damage += 1;
          console.log('Critical hit!');
        }
      }
      this.animateCombat(attacker, defender, damage);
      window.setTimeout(function(){ Game.dealDamage(defender.posY, defender.posX, damage) }, 250);
      window.setTimeout(function(){
        if (!counter && Game.combat.canCounter && defender.condition !== 'Defeated') {
          Game.attackUnit('counter');
        } else {
          Game.endAttack();
        }
      }, 500);
    },
    animateCombat: function (attacker, defender, damage) {
      var spacesY, spacesX, pixelsY, pixelsX, evadeSprite, attack, hit, miss;
      spacesY = defender.posY - attacker.posY;
      spacesX = defender.posX - attacker.posX;
      pixelsY = Math.round(16 * Math.sin(Math.atan2(spacesY, spacesX)));
      pixelsX = Math.round(16 * Math.cos(Math.atan2(spacesY, spacesX)));
      evadeSprite = "url('" + defender.sprite.slice(0, -4) + "-evade.png')";
      attack = {
        zIndex: [ 70, 70 ],
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
      if (damage >= 1) {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(hit, 250) }, 250);
      } else {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(miss, 350) }, 150);
      }
    },
    dealDamage: function (y, x, damage) {
      this.map[y][x].unit.hp -= damage;
      if (this.map[y][x].unit.hp <= 0) {
        window.setTimeout(function(){ Game.map[y][x].unit = null }, 500)
      }
    },
    endAttack: function () {
      var unit = this.active.unit;
      if (unit) { this.map[unit.posY][unit.posX].unit.attacks -= 1 }
      this.action = null;
    },
    makeEquipItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        var itemSrc = item.src.match(/sprites\/.*\.png/)[0],
            cursorOffset = Game.findCursorOffset(itemSrc),
            helperSrc = itemSrc.replace(/\d/, ''),
            itemClass = '.' + item.classList[3];
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: cursorOffset,
          helper: function(){ return $( '<img>', { src: helperSrc } ) },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            $( itemClass ).hide();
            var slotId = event.target.parentNode.id;
            Game.findDroppableSlots(item.classList[1], slotId.slice(0, -1), event.target.id.slice(0, -2), Number(slotId.slice(-1)));
            Game.makePanelsDroppable();
          },
          stop: function (event, ui) {
            $( itemClass ).show();
            $( '.ui-droppable' ).droppable( 'destroy' );
          }
        });
      });
    },
    findCursorOffset: function (src) {
      if (src.match(/\d/)) {
        switch (Number(src.match(/\d/)[0])) {
          case 0: return { top: 16, left: 16 }
          case 1: return { top: 16, left: 48 }
          case 2: return { top: 48, left: 16 }
          case 3: return { top: 48, left: 48 }
          case 4: return { top: 80, left: 16 }
          case 5: return { top: 80, left: 48 }
        }
      } else { return { top: 16, left: 16 } }
    },
    makePanelsDroppable: function () {
      $( '#unit-info' ).droppable({
        accept: '.weapon',
        tolerance: 'pointer',
        drop: function (event, ui) {
          var weaponList = Game.active.unit.items.weapons,
              weaponId = ui.draggable[0].id.slice(0, -2),
              weaponIndex = weaponList.indexOf(weaponList.filter( w => w.id === weaponId )[0]);
          Game.equipWeapon(Game.active.unit.posY, Game.active.unit.posX, weaponIndex);
        }
      });
      $( '#top-center' ).droppable({
        tolerance: 'pointer',
        drop: function (event, ui) {
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemType = Game.convertItemType(ui.draggable[0].classList[2]),
              itemList = Game.map[y][x].unit.items[itemType],
              itemId = ui.draggable[0].id.slice(0, -2),
              itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
              item = Game.map[y][x].unit.items[itemType].splice(itemIndex, 1)[0];
          item.slots = null;
          Game.map[y][x].items.push(item);
          Game.map[y][x].items.sort(Game.compareItems);
          Vue.nextTick(function(){ Game.makeGroundItemsDraggable('#' + itemId) });
        }
      });
    },
    compareItems: function (a, b) {
      if (a.index < b.index) { return -1 }
      if (a.index > b.index) { return 1 }
      if (a.index === b.index) {
        if (a.id < b.id) { return -1 }
        if (a.id > b.id) { return 1 }
      }
      return 0;
    },
    makeGroundItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: { top: 16, left: 16 },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            Game.findDroppableSlots(item.classList[1], item.classList[2], item.id);
          },
          stop: function (event, ui) {
            $( '.ui-droppable' ).droppable( 'destroy' );
          }
        });
      });
    },
    cancelEquip: function () {
      this.action = null;
      this.itemtip = null;
    },
    findDroppableSlots: function (itemStatus, itemType, itemId, slotNum) {
      var itemList = this.active.unit.items[this.convertItemType(itemType)],
          itemMap = [null, null, null, null, null, null],
          itemFootprint, itemIndex,
          slots = [0, 1, 2, 3, 4, 5],
          cinderella, // does the foot (item) fit the shoe (slot)?
          droppables = [];
      for (item of itemList) {
        for (slot of item.slots) {
          itemMap[slot] = item.id;
        }
      }
      if (itemStatus === 'equip') {
        itemFootprint = [];
        slots.filter(s => s !== slotNum);
        itemMap.forEach( function (slot, index) {
          if (slot === itemId) {
            itemFootprint.push(index - slotNum);
            itemMap[index] = null;
          }
        });
      } else if (itemStatus === 'ground') {
        itemIndex = this.active.items.indexOf(this.active.items.filter( i => i.id === itemId )[0]);
        itemFootprint = this.active.items[itemIndex].footprint;
      }
      for (slot of slots) {
        cinderella = true;
        for (toe of itemFootprint) {
          if (itemMap[slot + toe] !== null) { cinderella = false; }
        }
        if (cinderella) { droppables.push(itemType + slot) }
      }
      droppables = droppables.map( s => '#' + s ).join(',');
      this.makeSlotsDroppable(itemStatus, droppables);
    },
    convertItemType: function (itemType) {
      switch (itemType) {
        case 'weapon': return 'weapons';
        case 'clothing': return 'clothing';
        case 'accessory': return 'accessories';
      }
    },
    makeSlotsDroppable: function (draggable, droppables) {
      if (draggable === 'equip') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemType = Game.convertItemType(ui.draggable[0].classList[2]),
                itemList = Game.map[y][x].unit.items[itemType],
                itemId = ui.draggable[0].id.slice(0, -2),
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                itemSlots = itemList[itemIndex].slots,
                translation = Number(event.target.id.slice(-1)) - Number(ui.draggable[0].id.slice(-1)),
                itemString = itemSlots.map( s => '#' + itemId + '-' + (s + translation) ).join(',');
            Game.map[y][x].unit.items[itemType][itemIndex].slots = [];
            Vue.nextTick(function(){
              Game.map[y][x].unit.items[itemType][itemIndex].slots = itemSlots.map( s => s + translation );
              Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
            });
          }
        });
      } else if (draggable === 'ground') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemType = Game.convertItemType(ui.draggable[0].classList[2]),
                itemList = Game.active.items,
                itemId = ui.draggable[0].id,
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                item = Game.map[y][x].items.splice(itemIndex, 1)[0],
                itemString;
            item.slots = item.footprint.map( toe => toe + Number(event.target.id.slice(-1)));
            itemString = item.slots.map( s => '#' + itemId + '-' + s ).join(',');
            Game.map[y][x].unit.items[itemType].push(item);
            Game.map[y][x].unit.items[itemType].sort(Game.compareItems);
            Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
          }
        });
      }
    },
    beginTurn: function () {
      var u, unit, units = this.units;
      if (units.length) {
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
        Game.action = 'attacking';
        Game.showAttackRange();
        Game.aiChooseTarget();
      }, 500);
      window.setTimeout(function(){
        if (Game.target) {
          Game.attackUnit();
          window.setTimeout(function(){
            if (Game.active.unit && Game.target.unit && Game.active.unit.hp !== 0 && Game.target.unit.hp !== 0) {
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
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          space = this.map[y][x];
          if (space.distance && space.unit && space.unit.friendly !== this.active.unit.friendly) {
            this.targetUnit(y, x);
            targets.push({ posY: y, posX: x, attack: this.combat.activeAtk });
          }
        }
      }
      if (targets.length) {
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
    'ground-panel': GroundPanel,
    'event-log': EventLog,
    'status-panel': StatusPanel,
    'turn-banner': TurnBanner
  }
});

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (Game.control === 'player' && Game.active && Game.active.unit && Game.active.unit.control === 'player') {
    switch (event.keyCode) {
      case 13: // enter
        $( '#btn-confatk' ).trigger( 'click' );
        break;
      case 27: //escape
        $( '#btn-cancel' ).trigger( 'click' );
        break;
      case 65: // a
        if (Game.action !== 'attacking') { $( '#btn-attack' ).trigger( 'click' ); }
        else {
          if (Game.target) { $( '#btn-confatk' ).trigger( 'click' ); }
          else { $( '#btn-cancel' ).trigger( 'click' ); }
        }
        break;
      case 67: // c
        $( '#btn-cancel' ).trigger( 'click' );
        break;
      case 69: // e
        if (Game.action !== 'equipping') { $( '#btn-equip' ).trigger( 'click' ); }
        else { $( '#btn-cancel' ).trigger( 'click' ); }
        break;
      case 77: // m
        if (Game.action !== 'moving') { $( '#btn-move' ).trigger( 'click' ); }
        else { $( '#btn-cancel' ).trigger( 'click' ); }
        break;
    }
  }
}

$( document ).keyup( keyHandler );

window.setTimeout(function(){ Game.beginTurn() }, 500);

});