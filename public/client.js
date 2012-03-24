var Connection, Player, PlayerState, connection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty;

PlayerState = (function() {

  function PlayerState(x, y, active) {
    if (typeof x === "object") {
      this.active = x.active;
      this.x = x.x;
      this.y = x.y;
    } else {
      this.active = active | false;
      this.x = x | 0;
      this.y = y | 0;
    }
  }

  PlayerState.prototype.equals = function(otherState) {
    return (otherState != null) && otherState.x === this.x && otherState.y === this.y && otherState.active === this.active;
  };

  PlayerState.prototype.setPosition = function(x, y) {
    this.x = x;
    return this.y = y;
  };

  PlayerState.prototype.setActive = function(active) {
    return this.active = active;
  };

  PlayerState.prototype.copy = function() {
    return new PlayerState(this.x, this.y, this.active);
  };

  PlayerState.prototype.values = function() {
    return {
      x: this.x,
      y: this.y,
      active: this.active
    };
  };

  return PlayerState;

})();

Player = (function() {

  Player.timeout = 200;

  function Player(changedCallback) {
    this.changedCallback = changedCallback;
    this.queuedStates = [];
    this.state = new PlayerState();
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

  Player.prototype.setPosition = function(x, y) {
    return this.state.setPosition(x, y);
  };

  Player.prototype.setActive = function(active) {
    return this.state.setActive(active);
  };

  Player.prototype.enqueueStates = function(states) {
    return this.queuedStates.push(states);
  };

  Player.prototype.popStates = function() {
    var states;
    states = this.queuedStates.shift();
    if (!(states != null)) states = {};
    return states;
  };

  return Player;

})();

Connection = (function() {

  function Connection() {
    this.onReceivingStates = __bind(this.onReceivingStates, this);
    this.onChangedState = __bind(this.onChangedState, this);
    this.onReady = __bind(this.onReady, this);    this.player = new Player(this.onChangedState);
    this.socket = io.connect('/');
    this.socket.on('ready', this.onReady);
    this.socket.on('receivingStates', this.onReceivingStates);
  }

  Connection.prototype.getPlayer = function() {
    return this.player;
  };

  Connection.prototype.onReady = function(data) {
    var context, sequencer;
    console.log("Welcome, player " + data.playerId);
    this.player.startUpdating();
    this.play();
    context = new webkitAudioContext();
    return sequencer = new Sequencer(context, data.sound, function() {
      return sequencer.start();
    });
  };

  Connection.prototype.onChangedState = function(state) {
    return this.socket.emit('changedState', state);
  };

  Connection.prototype.onReceivingStates = function(states) {
    return this.player.enqueueStates(states);
  };

  Connection.prototype.play = function() {
    var canvas, context, playerId, state, states, worstRTT,
      _this = this;
    states = this.player.popStates();
    states['self'] = this.player.getState();
    canvas = document.getElementById('box');
    context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    worstRTT = 0;
    for (playerId in states) {
      if (!__hasProp.call(states, playerId)) continue;
      state = states[playerId];
      context.fillRect(state.x, state.y, 10, 10);
    }
    $('#info').html('States: ' + JSON.stringify(states));
    return window.setTimeout(function() {
      return _this.play();
    }, Player.timeout);
  };

  return Connection;

})();

connection = new Connection();

$(function() {
  $('#box').mousemove(function(e) {
    return connection.getPlayer().setPosition(e.offsetX, e.offsetY);
  });
  $('#box').mousedown(function(e) {
    return connection.getPlayer().setActive(true);
  });
  return $('#box').mouseup(function(e) {
    return connection.getPlayer().setActive(false);
  });
});
