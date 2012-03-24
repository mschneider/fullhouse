var arp = true;

var context;
var staticAudioRouting;

var loader;
var startTime;

var cutoff = 0.2;
var resonance = 12;
var envAmount = 0.4;
var width = 0.6;
var detune1 = 4.5;
var detune2 = -2.5;
var octave = 0;

var defaultWaveTableName = "Celeste";
var waveTable;
var waveTable2;

var volume = 1;
var filterAttack = 0.056;
var filterDecay = 0.991;
var ampAttack = 0.056;
var ampDecay = 0.100;
var playDoubleOctave = false;
var grungeDrive = 1;

var views;
var sequence;
var sequenceView;

var isShiftDown = false;
var isAltDown = false;

var monophonicNote;
var playMonophonic = true;

function onDocumentKeyDown( event ) {
    switch( event.keyCode ) {

        case 16:
            isShiftDown = true;
            break;
        case 18:
            isAltDown = true;
            break;
    }
    
    window.console.log(sequence.rhythm);
}

function onDocumentKeyUp( event ) {
    switch( event.keyCode ) {
        case 16:
            isShiftDown = false;
            break;
        case 18:
            isAltDown = false;
            break;
    }
}

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {

    return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

    window.setTimeout( callback, 1000 / 60 );
};

} )();
}


function WaveTableLoader(context) {
    this.context = context;
    this.waveNames = [
      "Bass", "Organ", "Saw", "TB303", "Twelve_String_Guitar"
    ];
}

WaveTableLoader.prototype.load = function(finishedCallback) {
    var loader = this;

    loader.finishedCallback = finishedCallback;
    loader.loadedCount = 0;
    loader.waveList = new Array();

    for (var i = 0; i < loader.waveNames.length; ++i) {
        var name = loader.waveNames[i];
        loader.waveList[i] = new WaveTable(name, this.context);
        loader.waveList[i].load(function(waveTable) {
            loader.loadedCount++;
            if (loader.loadedCount == loader.waveList.length)
                loader.finishedCallback();
        }
        );

    }
}

WaveTableLoader.prototype.makeWavePopup = function(popupName) {
    var waveList = document.getElementById(popupName);
        
    var numWaves = this.waveNames.length;
    
    for (var i = 0; i < numWaves; i++) {
        var item = document.createElement('option');
        item.innerHTML = this.waveNames[i];
                
        if (this.waveNames[i] == defaultWaveTableName)
            item.selected = "selected";

        waveList.appendChild(item);
    }
}

WaveTableLoader.prototype.getTable = function(name) {
    for (var i = 0; i < this.waveNames.length; ++i) {
        if (name == this.waveNames[i]) {
            return this.waveList[i];
        }
    }
}

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {

    return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

    window.setTimeout( callback, 1000 / 60 );
};

} )();
}

function SequenceView(sequence, divName) {
    this.sequence = sequence;
    this.name = divName;
    this.numberOfNotes = sequence.loopLength;
    this.numSemitones = 60;
    this.backgroundColor = "rgb(60,40,40)";
    this.noteColor = "rgb(200,150,150)";
    this.gridColor = "rgb(255,255,255)";
    this.playheadColor = "rgb(255,255,224)";
    
    this.canvas = document.getElementById(divName);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    var view = this;
    var canvas = this.canvas;
    
    canvas.addEventListener("mousedown", 
        function(event) {
            var eventInfo = {event: event, element:view.canvas};
            var position = getRelativeCoordinates(eventInfo);
            currentView = view;
            view.isDragging = true;
            view.startPosition = position;
            view.mouseDown(position);
        },
        true
    );
    
    // Note: document handles mouseup and mousemove events.
    document.addEventListener("mousemove", 
        function(event) {
            if (currentView && currentView == view) {
                var c = getAbsolutePosition(currentView.canvas);
                c.x = event.x - c.x;
                c.y = event.y - c.y;
                
                var position = c;
                
                // This isn't the best, should abstract better.
                if (isNaN(c.y)) {
                    var eventInfo = {event: event, element:currentView.canvas};
                    position = getRelativeCoordinates(eventInfo);
                }

                currentView.mouseMove(position);
            }
        },
        true
    );

    document.addEventListener("mouseup",
        function(event) {
            if (currentView && currentView == view) {
                view.isDragging = false;
                var eventInfo = {event: event, element:currentView.canvas};
                var position = getRelativeCoordinates(eventInfo);
                currentView.mouseUp(position);
                currentView = 0;
            }
        },
        true
    );
    
    this.draw();

    this.drawPlayhead();
}

SequenceView.prototype.draw = function() {
    var ctx = this.ctx;
    var width = this.width;
    var height = this.height;

    // Draw background.
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0,0, width, height);

    // Draw grid.
    var n = this.numberOfNotes;
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    for (var i = 0; i < n; ++i) {
        var x = i * width / n;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw notes.
    var noteWidth = width / n;
    var numSemitones = this.numSemitones;
    var noteHeight = height / numSemitones;
    for (var i = 0; i < n; ++i) {
        if (sequence.rhythm[i] != -1) {
            var x = i * width / n;
            var y = -noteHeight + height - sequence.rhythm[i]*noteHeight;
            ctx.fillStyle = this.noteColor;
            ctx.fillRect(x, y, noteWidth, noteHeight);
        }
    }
}


SequenceView.prototype.drawPlayhead = function() {
    var ctx = this.ctx;
    var width = this.width;
    var height = this.height;
    var n = this.numberOfNotes;

    var noteWidth = width / n;
    var numSemitones = this.numSemitones;
    var noteHeight = height / numSemitones;

    if (this.sequence.lastRhythmIndex != this.lastDrawnRhythmIndex) {
        // Erase last playhead
        var x = this.lastDrawnRhythmIndex * width / n;
        var y = 0;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(x, y, noteWidth, noteHeight);

        // Draw new playhead
        var x = this.sequence.lastRhythmIndex * width / n;
        var y = 0;
        ctx.fillStyle = this.playheadColor;
        ctx.fillRect(x, y, noteWidth, noteHeight);
        
        this.lastDrawnRhythmIndex = this.sequence.lastRhythmIndex;
    }    

    var view = this;
    function requestDispatch() {
        view.drawPlayhead();
    }
    
    window.requestAnimationFrame(requestDispatch);
}


SequenceView.prototype.mouseDown = function(position) {
    var width = this.width;
    var height = this.height;
    var n = this.numberOfNotes;
    var noteWidth = width / n;
    var numSemitones = this.numSemitones;
    var noteHeight = height / numSemitones;
    var ri = Math.floor(position.x / noteWidth);
    var note = Math.floor( (height - position.y) / noteHeight);
    if (ri >= 0 && ri < n && note >= 0) {
        if (isAltDown)
            sequence.rhythm[ri] = -1;
        else
            sequence.rhythm[ri] = note;

        this.draw();
    }
}

SequenceView.prototype.mouseMove = function(position) {
    if (this.isDragging) {
        this.mouseDrag(position);
    }
}

SequenceView.prototype.mouseDrag = function(position) {
}

SequenceView.prototype.mouseUp = function(position) {
}



var tempo = 85.0;


function Sequence() {
    this.loopLength = 16;
    this.rhythmIndex = 0;
    this.lastRhythmIndex = -1;
    this.loopNumber = 0;
    this.noteTime = 0.0;

    this.rhythm = [4, 4, 4, -1, 8, 13, 25, 15, 33, 23, 11, -1, 0, -1, 3, -1];
    // this.minor = [0, 3, 7, 10, 12, 15, 19, 22, 24, 27, 31, 34, 36, 39, 43, 46, 48, 51, 55, 58];
}

Sequence.prototype.advanceNote = function() {
    // Advance time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;
    this.noteTime += 0.25 * secondsPerBeat;

    this.lastRhythmIndex = this.rhythmIndex;
    
    this.rhythmIndex++;
    if (this.rhythmIndex == this.loopLength) {
        this.rhythmIndex = 0;
        this.loopNumber++
    }
}

function ddd() {
    sequence.schedule();
}

Sequence.prototype.schedule = function() {
    var currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (this.noteTime < currentTime + 0.040 /*0.120*/) {
        // Convert noteTime to context time.
        var contextPlayTime = this.noteTime + startTime;
        
        if (this.rhythm[this.rhythmIndex] != -1) {
            var noteNumber = this.rhythm[this.rhythmIndex];
            if (arp) {
                
                var minor = [0, 3, 7, 10];
                var arpOctave = Math.floor(noteNumber / 4);
                var i = noteNumber % 4;
                noteNumber = minor[i] + 12 * arpOctave;
            }

            if (playMonophonic) {
                monophonicNote.play(waveTable, waveTable2, noteNumber, octave, contextPlayTime);
            } else {
                var note = new Note(staticAudioRouting, false);
                note.play(waveTable, waveTable2, noteNumber, octave, contextPlayTime);

                if (playDoubleOctave) {
                    var note2 = new Note(staticAudioRouting, false);
                    note2.play(waveTable, waveTable2, noteNumber + 12, octave, contextPlayTime);
                }

            }

        }

        this.advanceNote();
    }
    
    setTimeout("ddd()", 0);
}

function Note(context, staticAudioRouting, isMonophonic) {
    this.context = context;
    this.staticAudioRouting = staticAudioRouting;
    this.isMonophonic = isMonophonic;
    
    // Create oscillators, panners, amplitude, and filter envelopes.    
    
    var osc1 = context.createBufferSource();
    osc1.looping = true;

    var osc1Octave = context.createBufferSource();
    osc1Octave.looping = true;

    var osc2 = context.createBufferSource();
    osc2.looping = true;

    var osc2Octave = context.createBufferSource();
    osc2Octave.looping = true;
    
    var panner1 = context.createPanner();
    panner1.panningModel = webkitAudioPannerNode.EQUALPOWER;

    var panner2 = context.createPanner();
    panner2.panningModel = webkitAudioPannerNode.EQUALPOWER;

    // Amplitude envelope
    var ampEnvelope = context.createGainNode();
    ampEnvelope.gain.value = 0.0; // default value

    // Filter
    var filter = context.createBiquadFilter();
    filter.type = 0;
    filter.gain.value = 0.0; // default value

    // Create note volume.
    var noteVolume = context.createGainNode();
    noteVolume.gain.value = 0; // start out silent until told otherwise

    // Make connections
    
    // oscillators --> panners.
    osc1.connect(panner1);
    osc1Octave.connect(panner1);
    osc2.connect(panner2);
    osc2Octave.connect(panner2);

    // panners --> amplitude envelope
    panner1.connect(ampEnvelope);
    panner2.connect(ampEnvelope);

    // amplitude envelope --> filter envelope
    ampEnvelope.connect(filter);

    // filter envelope --> note volume
    filter.connect(noteVolume);

    // note volume -> subsonic filter
    noteVolume.connect(this.staticAudioRouting.subsonicFilter /*subsonicFilter*/);

    // Keep oscillators playing at all times if monophonic.
    if (this.isMonophonic) {
        osc1.noteOn(0);
        osc2.noteOn(0);
        osc1Octave.noteOn(0);
        osc2Octave.noteOn(0);
    }
    
    // Keep track of all the nodes.
    this.osc1 = osc1;
    this.osc2 = osc2;
    this.osc1Octave = osc1Octave;
    this.osc2Octave = osc2Octave;
    this.panner1 = panner1;
    this.panner2 = panner2;
    this.ampEnvelope = ampEnvelope;
    this.filter = filter;
    this.noteVolume = noteVolume;
    
    this.wave = 0;
    this.wave2 = 0;
}

Note.prototype.setFilterValues = function() {
    var time = this.time;
    var filter = this.filter;
    var pitchFrequency = this.pitchFrequency;
    
    filter.frequency.cancelScheduledValues(0);

    filter.type = 0; // Lowpass
    filter.Q.value = resonance; // !!FIXME: should be Q

    var nyquist = 0.5 * this.context.sampleRate;

    var cutoffCents = 9600 * cutoff;
    var cutoffRate = Math.pow(2, cutoffCents / 1200.0);
    var startFrequency = cutoffRate * pitchFrequency;
    if (startFrequency > nyquist)
        startFrequency = nyquist;

    var envAmountCents = 7200 * envAmount;
    var envAmountRate = Math.pow(2, envAmountCents / 1200.0);
    var envAmountFrequency = startFrequency * envAmountRate;
    if (envAmountFrequency > nyquist)
        envAmountFrequency = nyquist;

    if (!this.isMonophonic) {
        filter.frequency.value = startFrequency;
        filter.frequency.setValueAtTime(startFrequency, time);
    } else {
        // filter.frequency.setValueAtTime(filter.frequency.value, time); // !! not correct
    }

    filter.frequency.setTargetValueAtTime(envAmountFrequency, time, filterAttack);
    filter.frequency.setTargetValueAtTime(startFrequency, time + filterAttack, filterDecay);
}

var firstTime = true;

Note.prototype.play = function(wave, wave2, semitone, octave, time) {
    this.time = time;
    
    if (wave != this.wave || wave2 != this.wave2 || !this.isMonophonic) {
        this.wave = wave;
        this.wave2 = wave2;
        firstTime = true;
    }
    
    // Get local copies.
    var osc1 = this.osc1;
    var osc2 = this.osc2;
    var osc1Octave = this.osc1Octave;
    var osc2Octave = this.osc2Octave;
    var panner1 = this.panner1;
    var panner2 = this.panner2;
    var ampEnvelope = this.ampEnvelope;
    var filter = this.filter;
    var noteVolume = this.noteVolume;

    // Set oscillator pitches.
    
    var pitchFrequency = 20.0 /*440.0*/ * Math.pow(2.0, semitone / 12.0);
    this.pitchFrequency = pitchFrequency;
    
    var pitchRate = pitchFrequency * wave.getRateScale();

    var rate1 = pitchRate * Math.pow(2.0, -detune1/1200);
    var buffer1 = wave.getWaveDataForPitch(rate1);
    if (firstTime) osc1.buffer = buffer1;

    osc1.playbackRate.value = rate1;


    var rate2 = pitchRate * Math.pow(2.0, octave - detune2/1200);
    var buffer2 = wave2.getWaveDataForPitch(rate2);
    if (firstTime) osc1Octave.buffer = buffer2;
    osc1Octave.playbackRate.value = rate2;

    if (firstTime) osc2.buffer = buffer1;
    osc2.playbackRate.value = pitchRate * Math.pow(2.0, +detune1/1200); // max one semi-tone

    if (firstTime) osc2Octave.buffer = buffer2;
    osc2Octave.playbackRate.value = pitchRate * Math.pow(2.0, octave + detune2/1200); // max one semi-tone
    
    // Set panning amount for width spreading.
    
    // pan maximum from -90 -> +90 degrees
    var x = Math.sin(0.5*Math.PI * width);
    var z = -Math.cos(0.5*Math.PI * width);
    panner1.panningModel = webkitAudioPannerNode.EQUALPOWER;
    panner1.setPosition(-x, 0, z);

    panner2.panningModel = webkitAudioPannerNode.EQUALPOWER;
    panner2.setPosition(x, 0, z);

    // Amplitude envelope
    ampEnvelope.gain.cancelScheduledValues(0);

    if (!this.isMonophonic)
        ampEnvelope.gain.setValueAtTime(0.0, time);
    else {
        // ampEnvelope.gain.setValueAtTime(ampEnvelope.gain.value, time); // !! not correct
    }
    
    // Amplitude attack
    var ampAttackTime = time + ampAttack;
    
    // Amplitude decay
    ampEnvelope.gain.setTargetValueAtTime(1, time, ampAttack);
    ampEnvelope.gain.setTargetValueAtTime(0, ampAttackTime, ampDecay);

    // Filter
    this.setFilterValues();

    // Set note volume.
    noteVolume.gain.value = 0.1 * volume*volume; // use x^2 volume curve for now

    // Trigger note if polyphonic, otherwise oscillators are running all the time for monophonic.
    if (!this.isMonophonic) {
        var ampDecayAdjust = 8*ampDecay; // time-constant adjusting... 
        if (ampDecayAdjust < 0.100) ampDecayAdjust = 0.100;
        if (ampDecayAdjust > 4) ampDecayAdjust = 4;
        var offTime = ampAttackTime + ampDecayAdjust;

        osc1.noteOn(time);
        osc2.noteOn(time);
        osc1.noteOff(offTime);
        osc2.noteOff(offTime);

        osc1Octave.noteOn(time);
        osc2Octave.noteOn(time);
        osc1Octave.noteOff(offTime);
        osc2Octave.noteOff(offTime);
    } else {
        firstTime = false;
    }
}

function setTempo(x) {
    tempo = x;
    bpmDelay.setTempo(tempo);
}


function loadImpulseResponse(url, convolver, context) {
    // Load impulse response asynchronously

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() { 
        convolver.buffer = context.createBuffer(request.response, false);
        isImpulseResponseLoaded = true;
    }
    request.onerror = function() { 
        alert("error loading reverb");
    }

    request.send();
}

function StaticAudioRouting(context) {
    this.context = context;
    // Create dynamics compressor to sweeten the overall mix.
    var compressor = this.context.createDynamicsCompressor();
    compressor.connect(this.context.destination);

    var convolver = this.context.createConvolver();
    loadImpulseResponse('impulse-responses/matrix-reverb6.wav', convolver, context);
    // loadImpulseResponse('impulse-responses/spatialized4.wav', convolver);

    var convolverDry = this.context.createGainNode();
    var convolverWet = this.context.createGainNode();

    convolverDry.connect(compressor);
    convolverWet.connect(convolver);
    convolver.connect(compressor);

    // BPM delay through delayWaveShaper feedback loop
    bpmDelay = new BpmDelay(this.context);

    var delayFeedback = this.context.createGainNode();
    var delayDry = this.context.createGainNode();
    var delayWet = this.context.createGainNode();

    delayFeedback.gain.value = 0.5;
    delayDry.gain.value = 0.5;
    delayWet.gain.value = 0.5;

    delayDry.connect(compressor);
    bpmDelay.delay.connect(delayWet);
    delayWet.connect(compressor);

    bpmDelay.delay.connect(delayFeedback);
    delayWaveShaper = new WaveShaper(this.context);
    
    delayFeedback.connect(delayWaveShaper.input);
    delayWaveShaper.output.connect(bpmDelay.delay);

    grungeWaveShaper = new WaveShaper(this.context);

    // Connect to delay dry/wet
    grungeWaveShaper.output.connect(delayDry);
    grungeWaveShaper.output.connect(bpmDelay.delay);

    // Connect to reverb dry/wet
    grungeWaveShaper.output.connect(convolverDry);
    grungeWaveShaper.output.connect(convolverWet);

    var subsonicFilter = this.context.createBiquadFilter();
    
    subsonicFilter.type = 1; // hipass
    subsonicFilter.frequency.value = 10;

    subsonicFilter.connect(grungeWaveShaper.input);
    
    this.compressor = compressor;
    this.convolver = convolver;
    this.convolverDry = convolverDry;
    this.convolverWet = convolverWet;
    this.bpmDelay = bpmDelay;
    this.delayFeedback = delayFeedback;
    this.delayDry = delayDry;
    this.delayWet = delayWet;
    this.delayWaveShaper = delayWaveShaper;
    this.grungeWaveShaper = grungeWaveShaper;
    this.subsonicFilter = subsonicFilter;

    this.setReverbDryWet(0.2);
}

StaticAudioRouting.prototype.setDelayDryWet = function(x) {
    // Equal-power cross-fade dry -> wet
    var gain1 = 0.5 * (1.0 + Math.cos(x * Math.PI));
    var gain2 = 0.5 * (1.0 + Math.cos((1.0-x) * Math.PI));
    this.delayDry.gain.value = gain1;
    this.delayWet.gain.value = gain2;
}

StaticAudioRouting.prototype.setReverbDryWet = function(x) {
    // Equal-power cross-fade dry -> wet
    var gain1 = 0.5 * (1.0 + Math.cos(x * Math.PI));
    var gain2 = 0.5 * (1.0 + Math.cos((1.0-x) * Math.PI));
    this.convolverDry.gain.value = gain1;
    this.convolverWet.gain.value = gain2;
}

StaticAudioRouting.prototype.setDelayFeedback = function(x) {
    this.delayFeedback.gain.value = x;
}

StaticAudioRouting.prototype.setDelayGrunge = function(driveDb) {
    this.delayWaveShaper.setDrive(Math.pow(10, 0.05*driveDb));
}

StaticAudioRouting.prototype.setMainGrunge = function(driveDb) {
    this.grungeWaveShaper.setDrive(Math.pow(10, 0.05*driveDb));
}

function init() {
    context = new webkitAudioContext();
    staticAudioRouting = new StaticAudioRouting();
    monophonicNote = new Note(staticAudioRouting, true);

    loadWaveTables();
    
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);

    sequence = new Sequence();

    addUI();
}

function addUI() {
    var controls = document.getElementById("controls");
    views = new Array();
    
    var j = 0;
    views[j++] = new KnobView("cutoff", cutoff, 0.0, 1.0, UNITS.generic, 1, false, function(value) { cutoff = value; } );
    views[j++] = new KnobView("resonance", resonance, 0, 40 /*20*/, UNITS.decibels, 1, false, function(value) { resonance = value; } );
    views[j++] = new KnobView("envAmount", envAmount, 0, 1, UNITS.generic, 2, false, function(value) { envAmount = value; } );
    views[j++] = new KnobView("filterAttack", filterAttack, 0.004, 0.200, UNITS.seconds, 3, false, function(value) { filterAttack = value; } );
    views[j++] = new KnobView("filterDecay", filterDecay, 0.004, 0.300, UNITS.seconds, 3, false, function(value) { filterDecay = value; } );
    views[j++] = new KnobView("ampAttack", ampAttack, 0.005, 0.300, UNITS.seconds, 3, true, function(value) { ampAttack = value; } );
    views[j++] = new KnobView("ampDecay", ampDecay, 0.001, 5.0, UNITS.seconds, 3, true, function(value) { ampDecay = value; } );
    views[j++] = new KnobView("width", width, 0.0, 1.0, UNITS.generic, 1, false, function(value) { width = value; } );
    views[j++] = new KnobView("detune1", detune1, -50, 50, UNITS.cents, 1, false, function(value) { detune1 = value; } );
    views[j++] = new KnobView("detune2", detune2, -50, 50, UNITS.cents, 1, false, function(value) { detune2 = value; } );
    views[j++] = new KnobView("osc2 octave", octave, 0, 4, UNITS.indexed, 0, false, function(value) { octave = value; } );
    views[j++] = new KnobView("tempo", tempo, 50.0, 240.0, UNITS.bpm, 1, false, function(value) { setTempo(value); } );
    views[j++] = new KnobView("subsonic cutoff", 10, 5, 2000, UNITS.hertz, 0, true, function(value) { subsonicFilter.frequency.value = value; } );
    views[j++] = new KnobView("reverb dry/wet", 20, 0, 100, UNITS.percent, 1, false, function(value) { staticAudioRouting.setReverbDryWet(0.01 * value); } );
    views[j++] = new KnobView("delay dry/wet", 50, 0, 100, UNITS.percent, 1, false, function(value) { staticAudioRouting.setDelayDryWet(0.01 * value); } );
    views[j++] = new KnobView("delay feedback", 50, 0, 100, UNITS.percent, 1, false, function(value) { staticAudioRouting.setDelayFeedback(0.01 * value); } );
    views[j++] = new KnobView("delay grunge", 0, -10, 30, UNITS.decibels, 1, false, function(value) { staticAudioRouting.setDelayGrunge(value); } );
    views[j++] = new KnobView("main grunge", 0, -15, 50, UNITS.decibels, 1, false, function(value) { staticAudioRouting.setMainGrunge(value); } );
    views[j++] = new KnobView("volume", volume, 0.0, 1.0, UNITS.generic, 1, false, function(value) { volume = value; } );
    
    installViews(views, controls);
    
    sequenceView = new SequenceView(sequence, "sequenceView");
    
    bpmDelay.setDelayValue("quarter note");
    
    var bpmDelayMenu = document.getElementById("bpmDelayMenu");
    var menuText = 'Delay: <select onchange="bpmDelay.setDelayValue(this.value);">'
        menuText += '<option>32nd note</option>'
        menuText += '<option>16th note triplet</option>'
        menuText += '<option>dotted 32nd note</option>'
        menuText += '<option>16th note</option>'
        menuText += '<option>8th note triplet</option>'
        menuText += '<option>dotted 16th note</option>'
        menuText += '<option>8th note</option>'
        menuText += '<option>quarter note triplet</option>'
        menuText += '<option>dotted eighth note</option>'
        menuText += '<option selected>quarter note</option>'
        menuText += '</select>';
    bpmDelayMenu.innerHTML = menuText;

    loader.makeWavePopup("wavePopup1");
    // loader.makeWavePopup("wavePopup2");
}

