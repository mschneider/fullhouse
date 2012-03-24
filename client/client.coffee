# A state of a player
class PlayerState
  
  constructor : (x, y, active) ->
    if typeof x == "object"
      @active = x.active
      @x = x.x
      @y = x.y
    else
      @active = active | false
      @x = x | 0
      @y = y | 0
    
  equals : (otherState) ->
    otherState? && otherState.x == @x && otherState.y == @y && otherState.active == @active
    
  setPosition : (x, y) ->
    @x = x
    @y = y
    
  setActive : (active) ->
    @active = active
    
  copy : ->
    new PlayerState(@x, @y, @active)
    
  values : ->
    {x: @x, y: @y, active: @active}
    
# The current player
class Player
  
  @timeout : 200
  
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
    
  getState : () ->
    @state
    
  setPosition : (x , y) ->
    @state.setPosition(x, y)
      
  setActive : (active) ->
    @state.setActive(active)
    
  enqueueStates : (states) ->
    @queuedStates.push(states)
      
  popStates : ->
    states = @queuedStates.shift()
    if !states?
      states = {}
    states

# Handles the connection between client and server
class Connection 
  constructor : ->
    @player = new Player(@onChangedState)
    @socket = io.connect '/'
    @socket.on('ready', @onReady)
    @socket.on('receivingStates', @onReceivingStates)
    
  getPlayer : ->
    @player

  onReady : (data) =>
    console.log "Welcome, player #{data.playerId}"
    @player.startUpdating()
    @play()

    context = new webkitAudioContext()
    sequencer = new Sequencer(context, data.sound, () ->
      sequencer.start()
    )
    
  onChangedState : (state) =>
    @socket.emit('changedState', state)

  onReceivingStates : (states) =>
    @player.enqueueStates(states)
    
  play : () ->
    states = @player.popStates()
    states['self'] = @player.getState()
    
    #  Draw
    canvas = document.getElementById('box')
    context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    worstRTT = 0
    for own playerId, state of states
      context.fillRect(state.x, state.y, 10, 10)
    
    $('#info').html('States: ' + JSON.stringify(states))
    
    window.setTimeout(() =>
      @play()
    , Player.timeout)

connection = new Connection()

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
