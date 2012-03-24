var World, app, express, io, port, timeout, world,
  __hasProp = Object.prototype.hasOwnProperty;

World = (function() {

  function World() {
    this.positions = {};
    this.updates = {};
    this.lastPlayerId = 0;
  }

  World.prototype.addPlayer = function() {
    return "" + this.lastPlayerId++;
  };

  World.prototype.removePlayer = function(playerId) {
    delete this.positions[playerId];
    return this.stopUpdates;
  };

  World.prototype.setPosition = function(playerId, position) {
    return this.positions[playerId] = position;
  };

  World.prototype.getPositions = function(targetPlayerId) {
    var otherPositions, playerId, position, _ref;
    otherPositions = {};
    _ref = this.positions;
    for (playerId in _ref) {
      if (!__hasProp.call(_ref, playerId)) continue;
      position = _ref[playerId];
      if (playerId !== targetPlayerId) otherPositions[playerId] = position;
    }
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
    socket.emit('ready', playerId);
    return world.startUpdates(playerId, function(positions) {
      return socket.emit('otherPositions', positions);
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
