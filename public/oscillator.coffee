class Oscillator
  constructor: (@context, @wave) ->
    @detune = -4.5
    @node = context.createBufferSource()
    @node.loop = true
    @started = false

  setFrequency: (@frequency) ->
    @pitchRate = @frequency * @wave.getRateScale()
    @playbackRate = @pitchRate * Math.pow(2.0, @detune/1200)
    @node.playbackRate.value = @playbackRate
    unless @started
      @node.buffer = @wave.getWaveDataForPitch @playbackRate
      @node.noteOn 0
      @started = true

