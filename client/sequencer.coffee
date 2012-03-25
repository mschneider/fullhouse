class Sequencer
  constructor: (@context, @output, @sound, @sound2, @tempo, cb) ->
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
      @play @kick, time
    if (@stepIndex % 8) == 4
      @play @clap, time
    notes = [20, 22, 24, 26, 40, 36, 37, 33,
             20, 21, 22, 23, 30, 28, 26, 24]
    notes2= [14, 18, 20, 15, 32, 33, 28, 20,
              7, 12, 15, 20, 28, 30, 25, 17]
    if @stepIndex % 2 == 0
      index = (@stepIndex/2) % notes.length
      console.log notes[index], @context.currentTime, time
      @sound.play notes[index], time
    if (@stepIndex % (notes.length * 2)) > notes.length
      @sound2.play notes2[@stepIndex % notes.length], time

  stepDifference: ->
    secondsPerBeat = 60.0 / (4 * @tempo)

  start: ->
    @startTime = @context.currentTime
    @run()

