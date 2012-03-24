var Connection, Player, connection, randomEvent,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty;

Player = (function() {

  Player.timeout = 100;

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

  Player.prototype.setPosition = function(x, y) {
    return this.state.setPosition(x, y);
  };

  Player.prototype.setActive = function(active) {
    return this.state.setActive(active);
  };

  Player.prototype.enqueueStates = function(states) {
    return this.queuedStates.push(state);
  };

  Player.prototype.popStates = function() {
    return this.queuedStates.shift();
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

  Connection.prototype.onReady = function(data) {
    var context, sequencer;
    console.log("Welcome, player " + data.playerId);
    this.player.startUpdating();
    context = new webkitAudioContext();
    return sequencer = new Sequencer(context, data.sound, function() {
      return sequencer.start();
    });
  };

  Connection.prototype.onChangedState = function(state) {
    return this.socket.emit('changedState', state);
  };

  Connection.prototype.onReceivingStates = function(states) {
    var playerId, playerX, state, _results;
    console.log(states);
    this.player.enqueueStates(states);
    $('#box').html('');
    _results = [];
    for (playerId in states) {
      if (!__hasProp.call(states, playerId)) continue;
      state = states[playerId];
      playerX = $('<div></div>');
      playerX.css({
        border: "1px solid black",
        height: 1,
        width: 1,
        position: 'absolute',
        left: state.x,
        top: state.y
      });
      _results.push($('#box').append(playerX));
    }
    return _results;
  };

  Connection.prototype.getPlayer = function() {
    return this.player;
  };

  return Connection;

})();

connection = new Connection();

randomEvent = null;

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
