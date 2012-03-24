var Player, World, app, express, io, port, world,
  __hasProp = Object.prototype.hasOwnProperty,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

World = (function() {

  function World() {
    this.states = {};
    this.playerCount = 0;
    this.lastPlayerId = 0;
  }

  World.prototype.addPlayer = function() {
    this.playerCount++;
    return "" + this.lastPlayerId++;
  };

  World.prototype.removePlayer = function(playerId) {
    this.playerCount--;
    if (this.playerCount === 0) this.lastPlayerId = 0;
    return delete this.states[playerId];
  };

  World.prototype.getPlayerCount = function() {
    return this.playerCount;
  };

  World.prototype.setState = function(playerId, state) {
    return this.states[playerId] = state;
  };

  World.prototype.getStates = function(targetPlayerId) {
    var lenght, otherStates, playerId, state, _ref;
    otherStates = {};
    lenght = 0;
    _ref = this.states;
    for (playerId in _ref) {
      if (!__hasProp.call(_ref, playerId)) continue;
      state = _ref[playerId];
      if (playerId !== targetPlayerId) {
        lenght++;
        otherStates[playerId] = state;
      }
    }
    if (lenght === 0) otherStates = null;
    return otherStates;
  };

  return World;

})();

Player = (function() {

  Player.timeout = 200;

  function Player(socket) {
    this.onDisconnect = __bind(this.onDisconnect, this);
    this.onChangedState = __bind(this.onChangedState, this);
    this.onReady = __bind(this.onReady, this);
    var _this = this;
    this.socket = socket;
    socket.set('playerId', world.addPlayer(), function() {
      _this.getPlayerId(_this.onReady);
      socket.on('changedState', _this.onChangedState);
      return socket.on('disconnect', _this.onDisconnect);
    });
  }

  Player.prototype.getPlayerId = function(cb) {
    return this.socket.get('playerId', function(err, playerId) {
      return cb(playerId);
    });
  };

  Player.prototype.onReady = function(id) {
    console.log("Player " + id + " connected.");
    this.socket.emit('ready', {
      playerId: id,
      playerCount: world.getPlayerCount(),
      sound: id % 2
    });
    return this.startStateSending();
  };

  Player.prototype.onChangedState = function(state) {
    var _this = this;
    return this.getPlayerId(function(id) {
      return world.setState(id, state);
    });
  };

  Player.prototype.onDisconnect = function() {
    var _this = this;
    return this.getPlayerId(function(id) {
      console.log("Player " + id + " disconnected.");
      world.removePlayer(id);
      return _this.stopStateSending();
    });
  };

  Player.prototype.startStateSending = function() {
    var _this = this;
    return this.getPlayerId(function(id) {
      var states;
      states = world.getStates(id);
      if (states != null) _this.socket.emit('receivingStates', states);
      return _this.updateTimer = setTimeout(function() {
        return _this.startStateSending();
      }, Player.timeout);
    });
  };

  Player.prototype.stopStateSending = function() {
    return clearTimeout(this.updateTimer);
  };

  return Player;

})();

express = require('express');

app = express.createServer();

io = require('socket.io').listen(app);

app.use(express.static('public'));

port = process.env.PORT || 3000;

app.listen(port, function() {
  return console.log("Listening on " + port);
});

world = new World();

io.configure(function() {
  if (process.env.PORT != null) {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  }
  return io.set("log level", 2);
});

io.sockets.on('connection', function(socket) {
  return new Player(socket);
});
