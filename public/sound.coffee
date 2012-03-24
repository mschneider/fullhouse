
class Sound
  constructor: (@context, wave, attack, decay) ->
    @env = new Envelope context, attack, decay
    @osc = new Oscillator context, wave
    @osc.node.connect @env.node
    @env.node.connect @context.destination

  play: (note, time) ->
    @frequency = 20.0 * Math.pow(2.0, note / 12.0)
    @osc.setFrequency @frequency
    @env.play time
