var Sequencer;

Sequencer = (function() {

  function Sequencer(context, sound, tempo, cb) {
    var _this = this;
    this.context = context;
    this.sound = sound;
    this.tempo = tempo;
    this.nextStepTime = 0.0;
    this.stepIndex = -1;
    loadSound('kick', function(response) {
      return _this.context.decodeAudioData(response, function(buffer) {
        _this.kick = buffer;
        return typeof cb === "function" ? cb() : void 0;
      });
    });
  }

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
    var note, noteIndex, notes, source;
    this.stepIndex += 1;
    if ((this.stepIndex % 4) === 0) {
      source = this.context.createBufferSource();
      source.buffer = this.kick;
      source.connect(this.context.destination);
      source.noteOn(time);
    }
    notes = [-1, 50, 55, -1, 37, -1, 20, -1, 26, -1, 30, -1, 38, -1, 40, -1];
    noteIndex = this.stepIndex % notes.length;
    if (-1 !== (note = notes[noteIndex])) {
      console.log(note, this.context.currentTime, time);
      return this.sound.play(note, time);
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
