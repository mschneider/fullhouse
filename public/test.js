var busy, c2b, c3b, filter, loadSound, sequencer, timeout;

filter = c2b = c3b = null;

loadSound = function(name, cb) {
  var request;
  request = new XMLHttpRequest();
  request.open('GET', "/samples/" + name + ".mp3", true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    return cb(request.response);
  };
  return request.send();
};

busy = false;

timeout = 500;

sequencer = null;

$(function() {
  return;
  $('#box').mousemove(function(e) {
    var sourceC2, sourceC3;
    if (busy) return;
    busy = true;
    setTimeout(function() {
      return busy = false;
    }, timeout);
    filter.frequency.value = 7000 * (e.offsetY / 300);
    console.log("freq:" + filter.frequency.value);
    sourceC2 = context.createBufferSource();
    sourceC2.buffer = c2b;
    sourceC2.connect(filter);
    sourceC3 = context.createBufferSource();
    sourceC3.buffer = c3b;
    sourceC3.connect(filter);
    sourceC2.noteOn(0);
    sourceC3.noteOn(0);
    return $('#info').html(e.offsetX + ', ' + e.offsetY);
  });
  loadSound('beat', function(response) {
    return context.decodeAudioData(response, function(buffer) {
      var source;
      source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.loop = true;
      return source.noteOn(0);
    });
  });
  return loadSound('c2', function(response) {
    return context.decodeAudioData(response, function(buffer) {
      c2b = buffer;
      return loadSound('c3', function(response) {
        return context.decodeAudioData(response, function(buffer) {
          c3b = buffer;
          filter = context.createBiquadFilter();
          filter.connect(context.destination);
          filter.type = 6;
          return filter.Q.value = 1;
        });
      });
    });
  });
});
