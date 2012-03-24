


class World
  
  constructor : () ->
    @positions = {}
    @updates = {}
    @playerCount = 0
    @lastPlayerId = 0
    @currentTime = 0
  
  getCurrentTime : () ->
    @currentTime
    
  addPlayer : () ->
    @playerCount++
    "" + @lastPlayerId++
    
  removePlayer : (playerId) ->
    @playerCount--
    if @playerCount == 0
      @lastPlayerId = 0
    
    delete @positions[playerId]
    @stopUpdates
    
  getPlayerCount : () ->
    @playerCount
    
  setPosition : (playerId, position) ->
    @positions[playerId] = position
    
  getPositions : (targetPlayerId) ->
    otherPositions = {}
    lenght = 0
    for own playerId, position of @positions
      if (playerId != targetPlayerId)
        lenght++
        otherPositions[playerId] = position
        
    if lenght == 0
      otherPositions = null
    otherPositions
    
  startUpdates : (playerId, cb) ->
    cb(@getPositions(playerId))
    @updates[playerId] = setTimeout(() =>
      @startUpdates(playerId, cb)
    , timeout)
    
  stopUpdates : (playerId) ->
    clearTimeout @updates[playerId]
  

express = require('express')
app = express.createServer()
io = require('socket.io').listen app

app.use(express.static 'public')

timeout = 10

port = process.env.PORT || 3000
app.listen(port, () ->
  console.log "Listening on " + port
)

io.sockets.on('connection', (socket) -> 
  playerId = world.addPlayer()
  
  socket.set('playerId', playerId, () ->
    console.log "Welcome, player #{playerId}"
    
    socket.emit('ready',  {
      playerId: playerId
      playerCount : world.getPlayerCount()
      sound : playerId % 2
    })
    
    world.startUpdates(playerId, (positions) ->
      if positions?
        socket.emit('otherPositions', positions)
    )
  )

  socket.on('playerPosition', (position) ->
    socket.get('playerId', (err, playerId) ->
      world.setPosition(playerId, position)
    )
  )
  
  socket.on('disconnect', () ->
    socket.get('playerId', (err, playerId) ->
      console.log "Goodbye, player #{playerId}"
      world.removePlayer(playerId)
    )
  )
)


world = new World



