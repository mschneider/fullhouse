var World, app, express, io, port, timeout, world;
var __hasProp = Object.prototype.hasOwnProperty;

World = (function() {

  function World() {
    this.positions = {};
    this.updates = {};
    this.playerCount = 0;
    this.lastPlayerId = 0;
    this.currentTime = 0;
  }

  World.prototype.getCurrentTime = function() {
    return this.currentTime;
  };

  World.prototype.addPlayer = function() {
    this.playerCount++;
    return "" + this.lastPlayerId++;
  };

  World.prototype.removePlayer = function(playerId) {
    this.playerCount--;
    if (this.playerCount === 0) this.lastPlayerId = 0;
    delete this.positions[playerId];
    return this.stopUpdates;
  };

  World.prototype.getPlayerCount = function() {
    return this.playerCount;
  };

  World.prototype.setPosition = function(playerId, position) {
    return this.positions[playerId] = position;
  };

  World.prototype.getPositions = function(targetPlayerId) {
    var lenght, otherPositions, playerId, position, _ref;
    otherPositions = {};
    lenght = 0;
    _ref = this.positions;
    for (playerId in _ref) {
      if (!__hasProp.call(_ref, playerId)) continue;
      position = _ref[playerId];
      if (playerId !== targetPlayerId) {
        lenght++;
        otherPositions[playerId] = position;
      }
    }
    if (lenght === 0) otherPositions = null;
    return otherPositions;
  };

  World.prototype.startUpdates = function(playerId, cb) {
    var _this = this;
    cb(this.getPositions(playerId));
    return this.updates[playerId] = setTimeout(function() {
      return _this.startUpdates(playerId, cb);
    }, timeout);
  };

  World.prototype.stopUpdates = function(playerId) {
    return clearTimeout(this.updates[playerId]);
  };

  return World;

})();

express = require('express');

app = express.createServer();

io = require('socket.io').listen(app);

app.use(express.static('public'));

timeout = 10;

port = process.env.PORT || 3000;

app.listen(port, function() {
  return console.log("Listening on " + port);
});

io.sockets.on('connection', function(socket) {
  var playerId;
  playerId = world.addPlayer();
  socket.set('playerId', playerId, function() {
    console.log("Welcome, player " + playerId);
    socket.emit('ready', {
      playerId: playerId,
      playerCount: world.getPlayerCount(),
      sound: playerId % 2
    });
    return world.startUpdates(playerId, function(positions) {
      if (positions != null) return socket.emit('otherPositions', positions);
    });
  });
  socket.on('playerPosition', function(position) {
    return socket.get('playerId', function(err, playerId) {
      return world.setPosition(playerId, position);
    });
  });
  return socket.on('disconnect', function() {
    return socket.get('playerId', function(err, playerId) {
      console.log("Goodbye, player " + playerId);
      return world.removePlayer(playerId);
    });
  });
});

world = new World;
