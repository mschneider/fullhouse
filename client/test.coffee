filter = c2b = c3b = null

loadSound = (name, cb) ->
  request = new XMLHttpRequest()
  request.open('GET', "/samples/#{name}.mp3", true)
  request.responseType = 'arraybuffer'
  request.onload = () -> cb(request.response)
  request.send()

busy = false
timeout = 500
sequencer = null

$ ->
  return
  $('#box').mousemove (e) ->
    if busy
      return
    busy = true
    setTimeout( () ->
      busy = false
    , timeout)
    filter.frequency.value = 7000 * (e.offsetY / 300)
    console.log "freq:#{filter.frequency.value}"
    sourceC2 = context.createBufferSource()
    sourceC2.buffer = c2b
    sourceC2.connect filter
    sourceC3 = context.createBufferSource()
    sourceC3.buffer = c3b
    sourceC3.connect filter
    sourceC2.noteOn 0
    sourceC3.noteOn 0
    $('#info').html(e.offsetX + ', ' + e.offsetY)
  loadSound 'beat', (response) ->
    context.decodeAudioData response, (buffer) ->
      source = context.createBufferSource()
      source.buffer = buffer
      source.connect context.destination
      source.loop = true
      source.noteOn 0

  loadSound 'c2', (response) ->
    context.decodeAudioData response, (buffer) ->
      c2b = buffer
      loadSound 'c3', (response) ->
        context.decodeAudioData response, (buffer) ->
          c3b = buffer
          filter = context.createBiquadFilter()
          filter.connect context.destination
          filter.type = 6
          filter.Q.value = 1
          
