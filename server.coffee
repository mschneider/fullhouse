class World
  
  constructor : ->
    @states = {}
    @playerCount = 0
    @lastPlayerId = 0
    
  addPlayer : ->
    @playerCount++
    "" + @lastPlayerId++
    
  removePlayer : (playerId) ->
    @playerCount--
    if @playerCount == 0
      @lastPlayerId = 0
    
    delete @states[playerId]
    
  getPlayerCount : ->
    @playerCount
    
  setState : (playerId, state) ->
    @states[playerId] = state
    
  getStates : (targetPlayerId) ->
    otherStates = {}
    lenght = 0
    for own playerId, state of @states
      if (playerId != targetPlayerId)
        lenght++
        otherStates[playerId] = state
        
    if lenght == 0
      otherStates = null
    otherStates
  

class Player
  
  @timeout : 100

  constructor : (socket) ->
    @socket = socket
    socket.set('playerId', world.addPlayer(), () =>
      @getPlayerId(@onReady)
      socket.on('changedState', @onChangedState)
      socket.on('disconnect', @onDisconnect)
    )
  
  getPlayerId : (cb) ->
    @socket.get('playerId', (err, playerId) ->
      cb(playerId)
    )
    
  onReady : (id) =>
    console.log "Player #{id} connected."
    @socket.emit('ready', {
      playerId : id
      playerCount : world.getPlayerCount()
      sound : id % 2
    })
    @startStateSending()

  onChangedState : (state) =>
    @getPlayerId((id) =>
      # console.log "Player #{id} changed."
      world.setState(id, state) 
    )
    
    
  onDisconnect : () =>
    @getPlayerId((id) =>
      console.log "Player #{id} disconnected."
      world.removePlayer(id)
      @stopStateSending()
    )

  startStateSending : () ->
    @getPlayerId((id) =>
      states = world.getStates(id)
      if states?
        @socket.emit('receivingStates', states)
      @updateTimer = setTimeout(() =>
        @startStateSending()
      , Player.timeout)
    )
    
  stopStateSending : () ->
    clearTimeout @updateTimer
    

express = require('express')
app = express.createServer()
io = require('socket.io').listen app


app.use(express.static 'public')

port = process.env.PORT || 3000
app.listen(port, () ->
  console.log "Listening on " + port
)

world = new World()

io.configure(() ->
  io.set("log level", 2)
)


io.sockets.on('connection', (socket) -> 
  new Player(socket)
)