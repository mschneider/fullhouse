class Sequencer
  constructor: (@context) ->
    @nextStepTime = 0.0
    @stepIndex = 0
    @tempo = 120.0
    loadSound 'c2', (response) =>
      @context.decodeAudioData response, (buffer) =>
        @buffer = buffer

  run: ->
    time = @context.currentTime - @startTime
    while @nextStepTime < time + 0.04
      @scheduleStep()
      @nextStepTime += @stepDifference()
    setTimeout (=> @run()), 0

  scheduleStep: ->
    @stepIndex += 1
    source = @context.createBufferSource()
    source.buffer = @buffer
    source.connect @context.destination
    idealPlaytime = @startTime + @stepIndex * @stepDifference()
    source.noteOn @idealPlaytime

  stepDifference: ->
    secondsPerBeat = 60.0 / @tempo

  start: ->
    @startTime = @context.currentTime
    @run()
