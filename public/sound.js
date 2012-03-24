var Sound;

Sound = (function() {

  function Sound(context, wave, attack, decay) {
    this.context = context;
    this.env = new Envelope(context, attack, decay);
    this.osc = new Oscillator(context, wave);
    this.osc.node.connect(this.env.node);
    this.env.node.connect(this.context.destination);
  }

  Sound.prototype.play = function(note, time) {
    this.frequency = 20.0 * Math.pow(2.0, note / 12.0);
    this.osc.setFrequency(this.frequency);
    return this.env.play(time);
  };

  return Sound;

})();
