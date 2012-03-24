var Oscillator;

Oscillator = (function() {

  function Oscillator(context, wave) {
    this.context = context;
    this.wave = wave;
    this.detune = -4.5;
    this.node = context.createBufferSource();
    this.node.loop = true;
    this.started = false;
  }

  Oscillator.prototype.setFrequency = function(frequency) {
    this.frequency = frequency;
    this.pitchRate = this.frequency * this.wave.getRateScale();
    this.playbackRate = this.pitchRate * Math.pow(2.0, this.detune / 1200);
    this.node.playbackRate.value = this.playbackRate;
    if (!this.started) {
      this.node.buffer = this.wave.getWaveDataForPitch(this.playbackRate);
      this.node.noteOn(0);
      return this.started = true;
    }
  };

  return Oscillator;

})();
