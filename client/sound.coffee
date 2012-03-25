
class Sound
  constructor: (@context, output, wave, attack, decay) ->
    @env = new Envelope context, attack, decay
    @osc = new Oscillator context, wave
    @osc.node.connect @env.node
    @env.node.connect output


  indexToFrequency: (index) ->
    index = index % 49
    halfs = fulls = 0
    while index >= 7
      halfs += 2
      fulls += 5
      index -= 7
    if index >= 4
      halfs += 1
      fulls += index - 1
    else
      fulls += index
    43.6536 * Math.pow(2.0, halfs / 12) * Math.pow(2.0, fulls / 6)

  play: (index, time) ->
    @osc.setFrequency @indexToFrequency index
    @env.play time
