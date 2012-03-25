# A state of a player
class PlayerState
  
  constructor : (@wave, @attack, @decay, y, active) ->
    @active = active | false
    @y = y | 0
    
  equals : (otherState) ->
    otherState? && otherState.y == @y && otherState.active == @active
    
  setPosition : (y) ->
    @y = y
    
    
  getPosition : () ->
    @y
    
  setActive : (active) ->
    @active = active
    
  copy : ->
    new PlayerState(@wave, @attack, @decay, @y, @active)
    
  values : ->
    {y: @y, active: @active, wave: @wave, attack: @attack, decay: @decay}
    
# The current player
class Player
  
  @timeout : 50
  
  constructor : (@id, @changedCallback, wave, attack, decay) ->
    # @queuedStates = []
    @state = new PlayerState(wave, attack, decay)
  
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
    
  getPosition : () ->
    @state.getPosition()
      
  setActive : (active) ->
    @state.setActive(active)
    
  enqueueStates : (states) ->
    states[@id] = @getState()
    @lastStates = states
      
  popStates : ->
    @lastStates
      

# Handles the connection between client and server
class Connection 
  constructor : ->
    @sounds = {}
    
    # Load audio    
    @context = new webkitAudioContext()
    #staticAudioRouting = new StaticAudioRouting(context)
    @loader = new WaveTableLoader(@context)
    @loader.load =>
      @compressor = @context.createDynamicsCompressor()
      @melody = @context.createGainNode()
      @melody.gain.value = 0.5
      @compressor.connect @melody
      @melody.connect @context.destination
      
      console.log("Tables loaded")
      @socket = io.connect '/'
      @socket.on('ready', @onReady)
      @socket.on('receivingStates', @onReceivingStates)
    
  getPlayer : ->
    @player

  onReady : (data) =>
    console.log "Welcome, player #{data.playerId}"
    @player = new Player(data.playerId, @onChangedState, data.wave, data.attack, data.decay)
    @player.enqueueStates({})
    @player.startUpdating()
    @startPlaying()
    
  onChangedState : (state) =>
    @socket.emit('changedState', state)

  onReceivingStates : (states) =>
    @player.enqueueStates(states)
  
  startPlaying : () ->
    @sequencer = new Sequencer @context, @compressor, @getSoundsAndDraw, 120.0, =>
      console.log "loaded sequencer. call seq.start()"
      @sequencer.start()
      
  getSoundsAndDraw : (cb) =>
    states = @player.popStates()
    sounds = []
    for own playerId, state of states
      if state.active
        if !@sounds[playerId]?
          @sounds[playerId] = new Sound @context, @compressor, @loader.getTable(state.wave), state.attack, state.decay
        
        console.log (@sounds)
        sounds.push({
          sound: @sounds[playerId]
          note: Math.round((500 - state.y) / 10)
        })      
    cb(sounds)
    @drawMixer(states)
  
  drawMixer : (states) ->
    # Draw all mixers
    updated = []
    for own playerId, state of states
      updated.push(playerId)
      element = "player_#{playerId}"
      if $("##{element}").length == 0
        $("#players").append(@createCanvas(element))
        if (playerId == @player.id)
          el = $("##{element}")
          el.addClass('self')
          el.mousemove((e) =>
            @player.setPosition(e.offsetY)
          )
          $(document.body).mousedown((e) =>
            @player.setActive(true)
          )
          $(document.body).mouseup((e) =>
            @player.setActive(false)
          )

      canvas = document.getElementById(element)
      context = canvas.getContext("2d")
      context.clearRect(0, 0, canvas.width, canvas.height)

      if state.active
        context.fillStyle = "orange"
      else
        context.fillStyle = "black"
        
      y = state.y - 10
      if y > 490
        y = 490
      if y < 0
        y = 0
        
      context.fillRect(0, y, 50, 10)

    $('[id^="player_"]').each(() ->
      element = $(@)
      tmp = element.attr('id').split('_')
      if $.inArray(tmp[1], updated) == -1
        element.remove()
    )

    $('#info').html('States: ' + JSON.stringify(states))
  
  createCanvas : (id) ->
    "<canvas width=\"50\" height=\"500\" id=\"#{id}\"></canvas>"

connection = new Connection()

$ ->
