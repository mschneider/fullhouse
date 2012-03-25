class Envelope
  constructor: (@context, @attack, @decay) ->
    @node = @context.createGainNode()
    @node.gain.value = 0.0

  play: (time) ->
    @node.gain.cancelScheduledValues(time)
    @node.gain.setTargetValueAtTime(1, time, @attack)
    @node.gain.setTargetValueAtTime(0, time+@attack, @decay)

