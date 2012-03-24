# The current player
class Player
  
  @timeout : 100
  
  constructor : (changedCallback) ->
    @changedCallback = changedCallback
    @queuedStates = []
    @state = new PlayerState()
  
  sendUpdate : ->
     if !@state.equals(@lastState)
       @changedCallback(@state.values())
     @lastState = @state.copy()
     
  startUpdating : ->
    @sendUpdate()
    window.setTimeout(() =>
      @startUpdating()
    , Player.timeout)
    
  setPosition : (x , y) ->
    @state.setPosition(x, y)
    
  setActive : (active) ->
    @state.setActive(active)
    
  enqueueStates : (states) ->
    @queuedStates.push(states)
      
  popStates : ->
    @queuedStates.shift()

# Handles the connection between client and server
class Connection 
  constructor : ->
    @player = new Player(@onChangedState)
    @socket = io.connect '/'
    @socket.on('ready', @onReady)
    @socket.on('receivingStates', @onReceivingStates)

  onReady : (data) =>
    console.log "Welcome, player #{data.playerId}"
    @player.startUpdating()

    context = new webkitAudioContext()
    sequencer = new Sequencer(context, data.sound, () ->
      sequencer.start()
    )
    
  onChangedState : (state) =>
    @socket.emit('changedState', state)

  onReceivingStates : (states) =>
    @player.enqueueStates(states)
    $('#box').html('')
    console.log(states)
    for own playerId, state of states
      playerX = $('<div></div>')
      playerX.css({
         border: "1px solid black"
         height: 1
         width: 1
         position: 'absolute'
         left: state.x
         top: state.y
      })
      $('#box').append(playerX)
      
  getPlayer : ->
    @player

connection = new Connection()
randomEvent = null

$ ->
  $('#box').mousemove((e) ->
    connection.getPlayer().setPosition(e.offsetX, e.offsetY)
  )
  $('#box').mousedown((e) ->
    connection.getPlayer().setActive(true)
  )
  $('#box').mouseup((e) ->
    connection.getPlayer().setActive(false)
  )
