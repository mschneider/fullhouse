var Sequencer;

Sequencer = (function() {

  function Sequencer(context, output, sound, sound2, tempo, cb) {
    var _this = this;
    this.context = context;
    this.output = output;
    this.sound = sound;
    this.sound2 = sound2;
    this.tempo = tempo;
    this.nextStepTime = 0.0;
    this.stepIndex = -1;
    loadSound('kick', function(response) {
      return _this.context.decodeAudioData(response, function(buffer) {
        _this.kick = buffer;
        return loadSound('clap', function(response) {
          return _this.context.decodeAudioData(response, function(buffer) {
            _this.clap = buffer;
            return typeof cb === "function" ? cb() : void 0;
          });
        });
      });
    });
  }

  Sequencer.prototype.play = function(sample, time) {
    var source;
    source = this.context.createBufferSource();
    source.buffer = sample;
    source.connect(this.context.destination);
    return source.noteOn(time);
  };

  Sequencer.prototype.run = function() {
    var time;
    var _this = this;
    time = this.context.currentTime - this.startTime;
    while (this.nextStepTime < time + 0.04) {
      this.scheduleStep(this.startTime + time);
      this.nextStepTime += this.stepDifference();
    }
    return setTimeout((function() {
      return _this.run();
    }), 0);
  };

  Sequencer.prototype.scheduleStep = function(time) {
    var index, notes, notes2;
    this.stepIndex += 1;
    if ((this.stepIndex % 4) === 0) this.play(this.kick, time);
    if ((this.stepIndex % 8) === 5) this.play(this.clap, time);
    notes = [20, 22, 24, 26, 40, 36, 37, 33, 20, 21, 22, 23, 30, 28, 26, 24];
    notes2 = [14, 18, 20, 15, 32, 33, 28, 20, 7, 12, 15, 20, 28, 30, 25, 17];
    if (this.stepIndex % 2 === 0) {
      index = (this.stepIndex / 2) % notes.length;
      console.log(notes[index], this.context.currentTime, time);
      this.sound.play(notes[index], time);
    }
    if ((this.stepIndex % (notes.length * 2)) > notes.length) {
      return this.sound2.play(notes2[this.stepIndex % notes.length], time);
    }
  };

  Sequencer.prototype.stepDifference = function() {
    var secondsPerBeat;
    return secondsPerBeat = 60.0 / (4 * this.tempo);
  };

  Sequencer.prototype.start = function() {
    this.startTime = this.context.currentTime;
    return this.run();
  };

  return Sequencer;

})();
