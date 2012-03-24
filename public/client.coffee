
timeout = 10
  
class Point
  
  constructor : (x, y) ->
    @x = x | 0
    @y = y | 0
    
  equals : (point) -> 
    point? && point.x is @x && point.y is @y
    
  set : (x, y) ->
    @x = x
    @y = y
    
  copy : () ->
    new Point(@x, @y)
    
  values : () ->
    {x: @x, y: @y}

sendPosition = (lastPosition) ->
  position = currentPosition.copy()
  if !position.equals(lastPosition)
    socket.emit('playerPosition', position)
  window.setTimeout(() -> 
    sendPosition(position)
  , timeout)


currentPosition = new Point()

$ ->
  $('#box').mousemove((e) ->
    currentPosition.set(e.offsetX, e.offsetY)
  )

socket = io.connect '/'

socket.on('ready', (playerId) ->
  console.log "Welcome, player #{playerId}"
  sendPosition()
)


socket.on('otherPositions', (positions) ->
  $('#box').html('')
  for own playerId, position of positions
    player = $('<div></div>')
    player.css({
       border: "1px solid black"
       height: 1
       width: 1
       position: 'absolute'
       left: position.x
       top: position.y
    })
    $('#box').append(player)
)


