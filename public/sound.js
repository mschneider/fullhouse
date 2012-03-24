var Sound;

Sound = (function() {

  function Sound(context) {
    var _this = this;
    this.context = context;
    this.end();
    this.sample = 0;
    this.intensity = 0;
    this.frequency = 440;
    this.bufferSize = 1024;
    this.node = this.context.createJavaScriptNode(this.bufferSize, 1, 1);
    this.node.onaudioprocess = function(e) {
      return _this.process(e);
    };
    this.node.connect(this.context.destination);
  }

  Sound.prototype.process = function(e) {
    var data, i, _ref, _results;
    this.updateIntensity();
    data = e.outputBuffer.getChannelData(0);
    _results = [];
    for (i = 0, _ref = data.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      data[i] = this.intensity * Math.sin(this.sample / (this.context.sampleRate / (2 * Math.PI * this.frequency)));
      _results.push(this.sample += 1);
    }
    return _results;
  };

  Sound.prototype.begin = function() {
    this.state = "increasing";
    return this.intensity = 0.5;
  };

  Sound.prototype.end = function() {
    return this.state = "decreasing";
  };

  Sound.prototype.updateIntensity = function() {
    if (this.state === "increasing") {
      this.intensity += 0.01;
      if (this.intensity > 1) return this.intensity = 1;
    } else {
      this.intensity -= 0.01;
      if (this.intensity < 0) return this.intensity = 0;
    }
  };

  return Sound;

})();
