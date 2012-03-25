var Sound;

Sound = (function() {

  function Sound(context, output, wave, attack, decay) {
    this.context = context;
    this.env = new Envelope(context, attack, decay);
    this.osc = new Oscillator(context, wave);
    this.osc.node.connect(this.env.node);
    this.env.node.connect(output);
  }

  Sound.prototype.indexToFrequency = function(index) {
    var fulls, halfs;
    index = index % 49;
    halfs = fulls = 0;
    while (index >= 7) {
      halfs += 2;
      fulls += 5;
      index -= 7;
    }
    if (index >= 4) {
      halfs += 1;
      fulls += index - 1;
    } else {
      fulls += index;
    }
    return 43.6536 * Math.pow(2.0, halfs / 12) * Math.pow(2.0, fulls / 6);
  };

  Sound.prototype.play = function(index, time) {
    this.osc.setFrequency(this.indexToFrequency(index));
    return this.env.play(time);
  };

  return Sound;

})();
