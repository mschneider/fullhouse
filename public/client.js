var currentPosition, sendPosition, socket, timeout,
  __hasProp = Object.prototype.hasOwnProperty;

timeout = 10;

currentPosition = {
  x: 0,
  y: 0
};

$(function() {
  return $('#box').mousemove(function(e) {
    currentPosition.x = e.offsetX;
    return currentPosition.y = e.offsetY;
  });
});

sendPosition = function() {
  socket.emit('playerPosition', currentPosition);
  return window.setTimeout(function() {
    return sendPosition();
  }, timeout);
};

socket = io.connect('http://localhost');

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
