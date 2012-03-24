
class Sound
  constructor: (@context) ->
    @end()
    @sample = 0
    @intensity = 0
    @frequency = 440
    @bufferSize = 1024 # samples
    @node = @context.createJavaScriptNode(@bufferSize, 1, 1)
    @node.onaudioprocess = (e) =>
      @process e
    @node.connect @context.destination

  process: (e) ->
    @updateIntensity()
    data = e.outputBuffer.getChannelData 0
    for i in [0...data.length]
      data[i] = @intensity * Math.sin(@sample / (@context.sampleRate / (2 * Math.PI * @frequency)))
      @sample += 1

  begin: ->
    @state = "increasing"
    @intensity = 0.5

  end: ->
    @state = "decreasing"

  updateIntensity: ->
    if @state == "increasing"
      @intensity += 0.01
      if @intensity > 1
        @intensity = 1
    else
      @intensity -= 0.01
      if @intensity < 0
        @intensity = 0
