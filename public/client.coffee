
timeout = 10

currentPosition = {x: 0, y: 0}


$ ->
  $('#box').mousemove((e) ->
    currentPosition.x = e.offsetX
    currentPosition.y = e.offsetY
  )

sendPosition = () ->
  socket.emit('playerPosition', currentPosition)
  window.setTimeout(() -> 
    sendPosition()
  , timeout)


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

