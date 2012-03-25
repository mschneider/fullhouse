var Connection, Player, PlayerState, connection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty;

PlayerState = (function() {

  function PlayerState(y, active) {
    this.active = active | false;
    this.y = y | 0;
  }

  PlayerState.prototype.equals = function(otherState) {
    return (otherState != null) && otherState.y === this.y && otherState.active === this.active;
  };

  PlayerState.prototype.setPosition = function(y) {
    return this.y = y;
  };

  PlayerState.prototype.setActive = function(active) {
    return this.active = active;
  };

  PlayerState.prototype.copy = function() {
    return new PlayerState(this.y, this.active);
  };

  PlayerState.prototype.values = function() {
    return {
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

  Player.prototype.setPosition = function(y) {
    return this.state.setPosition(y);
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
    var canvas, context, element, playerId, state, states, updated,
      _this = this;
    states = this.player.popStates();
    states['self'] = this.player.getState();
    updated = [];
    for (playerId in states) {
      if (!__hasProp.call(states, playerId)) continue;
      state = states[playerId];
      updated.push(playerId);
      element = "player_" + playerId;
      if ($("#" + element).length === 0) {
        $("#players").append(this.createCanvas(element));
      }
      canvas = document.getElementById(element);
      context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (state.active) {
        context.fillStyle = "orange";
      } else {
        context.fillStyle = "black";
      }
      context.fillRect(0, state.y, 50, 10);
    }
    $('[id^="player_"]').each(function() {
      var tmp;
      element = $(this);
      tmp = element.attr('id').split('_');
      if ($.inArray(tmp[1], updated) === -1) return element.remove();
    });
    $('#info').html('States: ' + JSON.stringify(states));
    return window.setTimeout(function() {
      return _this.play();
    }, Player.timeout);
  };

  Connection.prototype.createCanvas = function(id) {
    return "<canvas width=\"50\" height=\"500\" id=\"" + id + "\"></canvas>";
  };

  return Connection;

})();

connection = new Connection();

$(function() {
  $('#players').append(connection.createCanvas('player_self'));
  $('#player_self').mousemove(function(e) {
    return connection.getPlayer().setPosition(e.offsetY);
  });
  $('#player_self').mousedown(function(e) {
    return connection.getPlayer().setActive(true);
  });
  return $('#player_self').mouseup(function(e) {
    return connection.getPlayer().setActive(false);
  });
});
