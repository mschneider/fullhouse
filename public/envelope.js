var Envelope;

Envelope = (function() {

  function Envelope(context, attack, decay) {
    this.context = context;
    this.attack = attack;
    this.decay = decay;
    this.node = this.context.createGainNode();
    this.node.gain.value = 0.0;
  }

  Envelope.prototype.play = function(time) {
    console.log("" + this.context.currentTime + " => " + time + "-" + (time + this.attack) + "-" + (time + this.attack + this.decay));
    this.node.gain.setTargetValueAtTime(1, time, this.attack);
    return this.node.gain.setTargetValueAtTime(0, time + this.attack, this.decay);
  };

  return Envelope;

})();
