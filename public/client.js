var Connection, Player, PlayerState, connection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty;

PlayerState = (function() {

  function PlayerState(wave, attack, decay, y, active) {
    this.wave = wave;
    this.attack = attack;
    this.decay = decay;
    this.active = active | false;
    this.y = y | 0;
  }

  PlayerState.prototype.equals = function(otherState) {
    return (otherState != null) && otherState.y === this.y && otherState.active === this.active;
  };

  PlayerState.prototype.setPosition = function(y) {
    return this.y = y;
  };

  PlayerState.prototype.getPosition = function() {
    return this.y;
  };

  PlayerState.prototype.setActive = function(active) {
    return this.active = active;
  };

  PlayerState.prototype.copy = function() {
    return new PlayerState(this.wave, this.attack, this.decay, this.y, this.active);
  };

  PlayerState.prototype.values = function() {
    return {
      y: this.y,
      active: this.active,
      wave: this.wave,
      attack: this.attack,
      decay: this.decay
    };
  };

  return PlayerState;

})();

Player = (function() {

  Player.timeout = 50;

  function Player(id, changedCallback, wave, attack, decay) {
    this.id = id;
    this.changedCallback = changedCallback;
    this.state = new PlayerState(wave, attack, decay);
  }

  Player.prototype.sendUpdate = function() {
    if (!this.state.equals(this.lastState)) {
      this.changedCallback(this.state.values());
    }
    return this.lastState = this.state.copy();
  };

  Player.prototype.startUpdating = function() {
    var _this = this;
    this.sendUpdate();
    return window.setTimeout(function() {
      return _this.startUpdating();
    }, Player.timeout);
  };

  Player.prototype.getState = function() {
    return this.state;
  };

  Player.prototype.setPosition = function(y) {
    return this.state.setPosition(y);
  };

  Player.prototype.getPosition = function() {
    return this.state.getPosition();
  };

  Player.prototype.setActive = function(active) {
    return this.state.setActive(active);
  };

  Player.prototype.enqueueStates = function(states) {
    states[this.id] = this.getState();
    return this.lastStates = states;
  };

  Player.prototype.popStates = function() {
    return this.lastStates;
  };

  return Player;

})();

Connection = (function() {

  function Connection() {
    this.getSoundsAndDraw = __bind(this.getSoundsAndDraw, this);
    this.onReceivingStates = __bind(this.onReceivingStates, this);
    this.onChangedState = __bind(this.onChangedState, this);
    this.onReady = __bind(this.onReady, this);
    var _this = this;
    this.sounds = {};
    this.context = new webkitAudioContext();
    this.loader = new WaveTableLoader(this.context);
    this.loader.load(function() {
      _this.compressor = _this.context.createDynamicsCompressor();
      _this.melody = _this.context.createGainNode();
      _this.melody.gain.value = 0.5;
      _this.compressor.connect(_this.melody);
      _this.melody.connect(_this.context.destination);
      console.log("Tables loaded");
      _this.socket = io.connect('/');
      _this.socket.on('ready', _this.onReady);
      return _this.socket.on('receivingStates', _this.onReceivingStates);
    });
  }

  Connection.prototype.getPlayer = function() {
    return this.player;
  };

  Connection.prototype.onReady = function(data) {
    console.log("Welcome, player " + data.playerId);
    this.player = new Player(data.playerId, this.onChangedState, data.wave, data.attack, data.decay);
    this.player.enqueueStates({});
    this.player.startUpdating();
    return this.startPlaying();
  };

  Connection.prototype.onChangedState = function(state) {
    return this.socket.emit('changedState', state);
  };

  Connection.prototype.onReceivingStates = function(states) {
    return this.player.enqueueStates(states);
  };

  Connection.prototype.startPlaying = function() {
    var _this = this;
    return this.sequencer = new Sequencer(this.context, this.compressor, this.getSoundsAndDraw, 120.0, function() {
      console.log("loaded sequencer. call seq.start()");
      return _this.sequencer.start();
    });
  };

  Connection.prototype.getSoundsAndDraw = function(cb) {
    var playerId, sounds, state, states;
    states = this.player.popStates();
    sounds = [];
    for (playerId in states) {
      if (!__hasProp.call(states, playerId)) continue;
      state = states[playerId];
      if (state.active) {
        if (!(this.sounds[playerId] != null)) {
          this.sounds[playerId] = new Sound(this.context, this.compressor, this.loader.getTable(state.wave), state.attack, state.decay);
        }
        console.log(this.sounds);
        sounds.push({
          sound: this.sounds[playerId],
          note: Math.round((500 - state.y) / 10)
        });
      }
    }
    cb(sounds);
    return this.drawMixer(states);
  };

  Connection.prototype.drawMixer = function(states) {
    var canvas, context, el, element, playerId, state, updated,
      _this = this;
    updated = [];
    for (playerId in states) {
      if (!__hasProp.call(states, playerId)) continue;
      state = states[playerId];
      updated.push(playerId);
      element = "player_" + playerId;
      if ($("#" + element).length === 0) {
        $("#players").append(this.createCanvas(element));
        if (playerId === this.player.id) {
          el = $("#" + element);
          el.addClass('self');
          el.mousemove(function(e) {
            return _this.player.setPosition(e.offsetY);
          });
          $(document.body).mousedown(function(e) {
            return _this.player.setActive(true);
          });
          $(document.body).mouseup(function(e) {
            return _this.player.setActive(false);
          });
        }
      }
      canvas = document.getElementById(element);
      context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (state.active) {
        context.fillStyle = "orange";
      } else {
        context.fillStyle = "black";
      }
      context.fillRect(0, state.y - 10, 50, 10);
    }
    $('[id^="player_"]').each(function() {
      var tmp;
      element = $(this);
      tmp = element.attr('id').split('_');
      if ($.inArray(tmp[1], updated) === -1) return element.remove();
    });
    return $('#info').html('States: ' + JSON.stringify(states));
  };

  Connection.prototype.createCanvas = function(id) {
    return "<canvas width=\"50\" height=\"500\" id=\"" + id + "\"></canvas>";
  };

  return Connection;

})();

connection = new Connection();

$(function() {});
