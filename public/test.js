var filter, loadSound;

filter = null;

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

$(function() {
  var context;
  $('#box').mousemove(function(e) {
    return $('#info').html(e.offsetX + ', ' + e.offsetY);
  });
  context = new webkitAudioContext();
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
      var sourceC2;
      sourceC2 = context.createBufferSource();
      sourceC2.buffer = buffer;
      sourceC2.loop = true;
      return loadSound('c3', function(response) {
        return context.decodeAudioData(response, function(buffer) {
          var sourceC3;
          sourceC3 = context.createBufferSource();
          sourceC3.buffer = buffer;
          sourceC3.loop = true;
          filter = context.createBiquadFilter();
          sourceC2.connect(filter);
          sourceC3.connect(filter);
          filter.connect(context.destination);
          filter.type = 6;
          filter.frequency.value = 440;
          filter.Q.value = 1;
          sourceC2.noteOn(0);
          return sourceC3.noteOn(0);
        });
      });
    });
  });
});
