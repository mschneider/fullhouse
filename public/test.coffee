filter = null

loadSound = (name, cb) ->
  request = new XMLHttpRequest()
  request.open('GET', "/samples/#{name}.mp3", true)
  request.responseType = 'arraybuffer'
  request.onload = () -> cb(request.response)
  request.send()

$ ->
  $('#box').mousemove (e) ->
    $('#info').html(e.offsetX + ', ' + e.offsetY)
  context = new webkitAudioContext()
  loadSound 'beat', (response) ->
    context.decodeAudioData response, (buffer) ->
      source = context.createBufferSource()
      source.buffer = buffer
      source.connect context.destination
      source.loop = true
      source.noteOn 0

  loadSound 'c2', (response) ->
    context.decodeAudioData response, (buffer) ->
      sourceC2 = context.createBufferSource()
      sourceC2.buffer = buffer
      sourceC2.loop = true
      loadSound 'c3', (response) ->
        context.decodeAudioData response, (buffer) ->
          sourceC3 = context.createBufferSource()
          sourceC3.buffer = buffer
          sourceC3.loop = true
          filter = context.createBiquadFilter()
          sourceC2.connect filter
          sourceC3.connect filter
          filter.connect context.destination
          filter.type = 6
          filter.frequency.value = 440
          filter.Q.value = 1
          sourceC2.noteOn 0
          sourceC3.noteOn 0

