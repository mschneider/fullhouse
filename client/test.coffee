filter = c2b = c3b = null

loadSound = (name, cb) ->
  request = new XMLHttpRequest()
  request.open('GET', "/samples/#{name}.mp3", true)
  request.responseType = 'arraybuffer'
  request.onload = () -> cb(request.response)
  request.send()

context = sound = seq = null

$ ->
  context = new webkitAudioContext()
  #staticAudioRouting = new StaticAudioRouting(context)
  loader = new WaveTableLoader(context)
  loader.load () ->
    console.log "loaded wave tables"
    compressor = context.destination #context.createDynamicsCompressor()
    #compressor.connect context.destination
    sound = new Sound context, compressor, loader.getTable('TB303'), 0.01, 0.04
    seq = new Sequencer context, compressor, sound, 120.0, ->
      console.log "loaded sequencer. call seq.start()"

