# A state of a player
class PlayerState
  
  constructor : (y, active) ->
    @active = active | false
    @y = y | 0
    
  equals : (otherState) ->
    otherState? && otherState.y == @y && otherState.active == @active
    
  setPosition : (y) ->
    @y = y
    
  setActive : (active) ->
    @active = active
    
  copy : ->
    new PlayerState(@y, @active)
    
  values : ->
    {y: @y, active: @active}
    
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
    
  setPosition : (y) ->
    @state.setPosition(y)
      
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
    
    # Draw all mixers
    updated = []
    for own playerId, state of states
      updated.push(playerId)
      element = "player_#{playerId}"
      if $("##{element}").length == 0
        $("#players").append(@createCanvas(element))
      
      canvas = document.getElementById(element)
      context = canvas.getContext("2d")
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      if state.active
        context.fillStyle = "orange"
      else
        context.fillStyle = "black"
      context.fillRect(0, state.y, 50, 10)
      
    $('[id^="player_"]').each(() ->
      element = $(@)
      tmp = element.attr('id').split('_')
      if $.inArray(tmp[1], updated) == -1
        element.remove()
    )
    
    $('#info').html('States: ' + JSON.stringify(states))
    window.setTimeout(() =>
      @play()
    , Player.timeout)
    
  createCanvas : (id) ->
    "<canvas width=\"50\" height=\"500\" id=\"#{id}\"></canvas>"

connection = new Connection()

$ ->
  $('#players').append(connection.createCanvas('player_self'))
  $('#player_self').mousemove((e) ->
    connection.getPlayer().setPosition(e.offsetY)
  )
  $('#player_self').mousedown((e) ->
    connection.getPlayer().setActive(true)
  )
  $('#player_self').mouseup((e) ->
    connection.getPlayer().setActive(false)
  )
