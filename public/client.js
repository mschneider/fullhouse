var Point, currentPosition, sendPosition, socket, timeout,
  __hasProp = Object.prototype.hasOwnProperty;

timeout = 10;

Point = (function() {

  function Point(x, y) {
    this.x = x | 0;
    this.y = y | 0;
  }

  Point.prototype.equals = function(point) {
    return (point != null) && point.x === this.x && point.y === this.y;
  };

  Point.prototype.set = function(x, y) {
    this.x = x;
    return this.y = y;
  };

  Point.prototype.copy = function() {
    return new Point(this.x, this.y);
  };

  Point.prototype.values = function() {
    return {
      x: this.x,
      y: this.y
    };
  };

  return Point;

})();

sendPosition = function(lastPosition) {
  var position;
  position = currentPosition.copy();
  if (!position.equals(lastPosition)) {
    socket.emit('playerPosition', position.values());
  }
  return window.setTimeout(function() {
    return sendPosition(position);
  }, timeout);
};

currentPosition = new Point();

$(function() {
  return $('#box').mousemove(function(e) {
    return currentPosition.set(e.offsetX, e.offsetY);
  });
});

socket = io.connect('/');

socket.on('ready', function(playerId) {
  console.log("Welcome, player " + playerId);
  return sendPosition();
});

socket.on('otherPositions', function(positions) {
  var player, playerId, position, _results;
  $('#box').html('');
  _results = [];
  for (playerId in positions) {
    if (!__hasProp.call(positions, playerId)) continue;
    position = positions[playerId];
    player = $('<div></div>');
    player.css({
      border: "1px solid black",
      height: 1,
      width: 1,
      position: 'absolute',
      left: position.x,
      top: position.y
    });
    _results.push($('#box').append(player));
  }
  return _results;
});
