class Sequencer
  constructor: (@context, @output, @checkFn, @tempo, cb) ->
    @nextStepTime = 0.0
    @stepIndex = -1
    loadSound 'kick', (response) =>
      @context.decodeAudioData response, (buffer) =>
        @kick = buffer
        loadSound 'clap', (response) =>
          @context.decodeAudioData response, (buffer) =>
            @clap = buffer
            cb?()

  play: (sample, time) ->
    source = @context.createBufferSource()
    source.buffer = sample
    source.connect @context.destination
    source.noteOn time

  run: ->
    time = @context.currentTime - @startTime
    while @nextStepTime < time + 0.04
      @scheduleStep @startTime + time
      @nextStepTime += @stepDifference()
    setTimeout (=> @run()), 0

  scheduleStep: (time) ->
    @stepIndex += 1
    if (@stepIndex % 4) == 0
      source = @context.createBufferSource()
      source.buffer = @kick
      source.connect @context.destination
      source.noteOn time
      
    @checkFn((states) ->
      for state in states
        state.sound.play state.note, time
        console.log(state.note)
    )

  stepDifference: ->
    secondsPerBeat = 60.0 / (4 * @tempo)

  start: ->
    @startTime = @context.currentTime
    @run()

