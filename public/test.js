var c2b, c3b, context, filter, loadSound, seq, sound;

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

context = sound = seq = null;

$(function() {
  var loader;
  return;
  context = new webkitAudioContext();
  loader = new WaveTableLoader(context);
  return loader.load(function() {
    var compressor, sound2;
    console.log("loaded wave tables");
    compressor = context.destination;
    sound = new Sound(context, compressor, loader.getTable('TB303'), 0.01, 0.04);
    sound2 = new Sound(context, compressor, loader.getTable('Twelve_String_Guitar'), 0.02, 0.08);
    return seq = new Sequencer(context, compressor, sound, sound2, 120.0, function() {
      return console.log("loaded sequencer. call seq.start()");
    });
  });
});
