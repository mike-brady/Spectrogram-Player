/*Spectrogram Player
    Syncs playback of an audio file and its spectrogram.

    Version     1.0.0
    Author      Mike Brady
    Website     www.mikebrady.com/programming/spectogram/

    BASIC HTML
        INSIDE <head> TAG
          <link rel="stylesheet" type="text/css" href="spectrogramplayer.css" />

        <body> TAG
          <body onload="sp_init();">

        INSIDE <body> TAG
          <script type="text/javascript" src="spectrogramplayer.js"></script>

          <div class="spectrogram-player">
            <img src="[pathToSpectrogramImage]" />
            <audio controls>
              <source src="[pathToAudioFile]" type="audio/wav">
            </audio>
          </div>

    CUSTOM SETTINGS
      The following settings can be customized to change the look and behavior
      of the Spectrogram Player. There are two ways to change the settings. You
      can set them in HTML or change them in JavaScript. Setting values in HTML
      only apply to the individual instance of the player. Setting the values in
      JavaScript apply to all players. HTML settings override JavaScript settings.

    CUSTOM SETTINGS IN HTML
      To change the settings in HTML add a "data-[setting-name]" attribute to
      the parent <div> of the player with desired setting value as the value of
      the attribute.

      Example:
      <div class="spectrogram-player" data-width="300" data-height="150">
      ...
      </div>

    CUSTOM SETTINGS IN JAVASCRIPT
      To change the settings in JavaScript, adjust the values of variables at
      the top of the function sp_init().

    SETTING             HTML ATTRIBUTE NAME         DESCRIPTION
    width               data-width                  The width of the player in pixels

    height              data-height                 The height of the player in pixels

    freqMin             data-freq-min               The minimum frequency of the spectrogram in kHz

    freqMax             data-freq-max               The maximum frequency of the spectrogram in kHz

    axisWidth           data-axis-width             The width of the frequency axis in pixels.
                                                    Setting a value < 1 will prevent the axis from
                                                    showing.

    axisDivisionHeight  data-axis-division-height   The minimum height of each division in the axis
                                                    in pixels

    axisSmoothing       data-axis-smoothing         The amount of smoothing to apply to the axis

                                                    Smoothing attempts to divide the frequency range
                                                    in a way that creates "nicer" increments than what
                                                    you might get when dividing the axis automatically
                                                    based on the spectrogram height, the axisDivisionHeight,
                                                    and the frequency range. A nice increment is defined as
                                                    an integer or decimal number whose value after the decimal
                                                    place is either .5 or .25

                                                    The smoothing value determines how much higher/lower
                                                    than the calculated number of divisions to look for a
                                                    nice increment for the axis.

                                                    For example a player with a height of 200px, an
                                                    axisDivisionHeight of 40px, and a frequency range of 12kHz
                                                    would result in 5 divisions (200px/40px) at an increment
                                                    of 2.4khz (12kHz/5) per division. 2.4 is not considered to
                                                    be a nice increment because its value after the decimal (.4)
                                                    is not .5 or .25

                                                    If the smoothing value was set at 2, divisions from 3 (5-2)
                                                    up to 7 (5+2) would be checked for a nice increment. It
                                                    will start by checking 5+/-1, then 5+/-2. Note if 5+1
                                                    divisions AND 5-1 divisions both result in a nice increment,
                                                    5+1 would be used first because the smoothing value was set
                                                    to positive 2. If the smoothing value was set to -2, then
                                                    5-1 would be used before 5+1.

                                                    In our example with smoothing set to 2, first 5+1 divisions
                                                    would be checked. 12khz/(5+1) = 2kHz. 2kHz is a nice
                                                    number, so the axis will be divided into 6 increments. If the
                                                    smoothing value was set to -2, it would check 5-1 first.
                                                    12kHz/(5-1) = 3kHz. 3kHz is a nice number, so the axis will
                                                    be divided into 4 increments.

                                                    A smoothing value of 0 will apply no smoothing.

*/
function sp_init() {
  defaultWidth = 500;
  defaultHeight = 200;
  defaultFreqMin = 0;
  defaultFreqMax = 0;
  defaultAxisWidth = 30;
  defaultAxisDivisionHeight = 40;
  defaultAxisSmoothing = 2;

  playerIDs = [];

  players = document.getElementsByClassName("spectrogram-player");
  for(i=0;i<players.length;i++) {
    player = players[i];

    imgElms = player.getElementsByTagName("img");
    if(imgElms.length != 1)
      continue;

    audioElms = player.getElementsByTagName("audio");
    if(audioElms.length != 1)
      continue;

    width = (player.getAttribute('data-width')) ? player.getAttribute('data-width') : defaultWidth;
    height = (player.getAttribute('data-height')) ? player.getAttribute('data-height') : defaultHeight;
    freqMin = (player.getAttribute('data-freq-min')) ? player.getAttribute('data-freq-min') : defaultFreqMin;
    freqMax = (player.getAttribute('data-freq-max')) ? player.getAttribute('data-freq-max') : defaultFreqMax;
    axisWidth = (player.getAttribute('data-axis-width')) ? player.getAttribute('data-axis-width') : defaultAxisWidth;
    axisDivisionHeight = (player.getAttribute('data-axis-division-height')) ? player.getAttribute('data-axis-division-height') : defaultAxisDivisionHeight;
    axisSmoothing = (player.getAttribute('data-axis-smoothing')) ? player.getAttribute('data-axis-smoothing') : defaultAxisSmoothing;

    spectrogram = imgElms[0].src;
    imgElms[0].parentNode.removeChild(imgElms[0]);

    audio = audioElms[0];
    audio.id = "sp-audio"+i;
    audio.style.width = width+"px";

    //Create viewer element
    viewer = document.createElement('div');
    viewer.className = "sp-viewer";
    viewer.id = "sp-viewer"+i;

    viewer.style.width = width+"px";
    viewer.style.height = height+"px";

    viewer.style.backgroundImage = "url('"+spectrogram+"')";
    viewer.style.backgroundPosition = width/2+"px";
    viewer.style.backgroundSize = "auto "+height+"px";

    if(axisWidth > 0) {
      divisions = Math.floor(height/axisDivisionHeight);
      if(axisSmoothing != 0)
        divisions = smoothAxis(freqMax-freqMin, divisions, [0,.5,.25], axisSmoothing);

      axis = drawAxis(axisWidth,height,freqMin,freqMax,divisions,"kHz");
      axis.className = "sp-axis";
      viewer.appendChild(axis);
    }

    timeBar = document.createElement('div');
    timeBar.className = "sp-timeBar";
    viewer.appendChild(timeBar);

    player.insertBefore(viewer, player.firstChild);

    playerIDs.push(i);
  }

  setInterval(function() { moveSpectrograms(playerIDs); },33);
}

//Loop through all players on the page and position their spectrogram image to
//correspond to the current time of the audio file.
function moveSpectrograms(IDs) {
  for(i=0;i<IDs.length;i++) {
    id = IDs[i];
    audio = document.getElementById("sp-audio"+id);
    if(audio.paused)
      continue;

    viewer = document.getElementById("sp-viewer"+id);
    viewerWidth = viewer.offsetWidth;
    duration = audio.duration;

    viewerStyle = viewer.currentStyle || window.getComputedStyle(viewer, false);
    img = new Image();
    //remove url(" and ") from backgroundImage string
    img.src = viewerStyle.backgroundImage.replace(/url\(\"|\"\)$/ig, '');
    //get the width of the spectrogram image based on its scaled size * its native size
    spectWidth = viewer.offsetHeight/img.height*img.width;

    viewer.style.backgroundPosition = viewerWidth/2 - audio.currentTime/duration*spectWidth + "px";
  }
}

function smoothAxis(range, baseDivision, allowedDecimals, distance) {
  if(distance==0)
    return baseDivision;

  subtractFirst = (distance<0) ? false : true;

  for(var i=0;i<=distance;i++) {
    d1 = (subtractFirst) ? baseDivision-i : baseDivision+i;
    d2 = (subtractFirst) ? baseDivision+i : baseDivision-i;

    if(d1 > 0) {
      decimal = qoutientDecimal(range, d1, 4)
      if(allowedDecimals.indexOf(decimal) > -1)
        return d1;
    }

    if(d2 > 0) {
      decimal = qoutientDecimal(range, d2, 4)
      if(allowedDecimals.indexOf(decimal) > -1)
        return d2;
    }
  }

  return baseDivision;
}

function drawAxis(width,height,min,max,divisions,unit) {
  axis = document.createElement('canvas');
  axis.width = width;
  axis.height = height;

  ctx = axis.getContext("2d");

  ctx.fillStyle ="rgba(0,0,0,.1)";
  ctx.fillRect(0,0,width,height);

  ctx.font = "12px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle ="rgb(100,100,100)";
  ctx.strokeStyle ="rgb(100,100,100)";

  range = max-min;

  for(var i=0;i<divisions;i++) {
    y = Math.round(height/divisions*i);
    ctx.moveTo(0,y+.5);
    ctx.lineTo(width,y+.5);
    ctx.stroke();

    curVal = (divisions-i) * range/divisions + min*1;

    ctx.fillText(Math.round(curVal*100)/100,width,y);
  }

  ctx.textBaseline = "bottom";
  ctx.fillText(unit,width,height);

  return axis;
}

function qoutientDecimal(dividend, divisor, precision) {
  quotient = dividend/divisor;

  if(precision === undefined)
    b = 1;
  else
    b = Math.pow(10,precision);

  return Math.round(quotient%1 *b)/b;
}
