class Sequencer
  constructor: (@context, @sound, @tempo, cb) ->
    @nextStepTime = 0.0
    @stepIndex = -1
    loadSound 'kick', (response) =>
      @context.decodeAudioData response, (buffer) =>
        @kick = buffer
        cb?()

  run: ->
    time = @context.currentTime - @startTime
    while @nextStepTime < time + 0.04
      @scheduleStep @startTime + @nextStepTime
      @nextStepTime += @stepDifference()
    setTimeout (=> @run()), 0

  scheduleStep: (time) ->
    @stepIndex += 1
    if (@stepIndex % 4) == 0
      source = @context.createBufferSource()
      source.buffer = @kick
      source.connect @context.destination
      source.noteOn time
    notes = [-1, 50, 55, -1,
             37, -1, 20, -1,
             26, -1, 30, -1,
             38, -1, 40, -1 ]
    noteIndex = @stepIndex % notes.length
    if (-1 != note = notes[noteIndex])
      console.log note, @context.currentTime, time
      @sound.play note, time

  stepDifference: ->
    secondsPerBeat = 60.0 / (4 * @tempo)

  start: ->
    @startTime = @context.currentTime
    @run()

