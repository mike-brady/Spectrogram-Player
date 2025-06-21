/*
  Spectrogram Player

  Author: Mike Brady

  Version: 2.0.0

  Description:
    Spectrogram Player is a custom media player for synchronizing playback of
    an audio file with its spectrogram.

  License:
    MIT License

    Copyright (c) 2018 Mike Brady

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

Custom Settings
    Custom Settings on a per player basis
      To change the settings for a specific player, add a "data-[setting-name]"
      attribute to the parent <div> of the player with desired setting value as
      the value of the attribute.

      Example:
      <div class="spectrogram-player" data-width="300" data-height="150">
      ...
      </div>

    Default settings for all players
      To change the default settings for all players, adjust the values of
      default variables below.

    Custom settings in the HTML will override the default settings for that
    specific player.

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
                                                    into increments that are multiples of .25

                                                    Example: A frequency range of 0 - 15kHz divided
                                                    into 7 increments would result in the following
                                                    increments:
                                                    0, 2.14.., 4.29.., 6.43.., 8.57.., 10.71.., 12.86.., 15

                                                    With smoothing turned on and set to 1, the frequency
                                                    will be divided into 6 increments instead, resulting
                                                    in the following increments: 0, 2.5, 5, 7.5, 10, 12.5, 15

                                                    The smoothing value determines how much higher/lower
                                                    than the calculated number of divisions to look for a
                                                    nice increment for the axis.

                                                    A smoothing value of 0 will apply no smoothing.
*/

const spectrogram_player = {
  defaultWidth: 500,
  defaultHeight: 200,
  defaultFreqMin: 0,
  defaultFreqMax: 20,
  defaultAxisWidth: 30,
  defaultAxisDivisionHeight: 40,
  defaultAxisSmoothing: 2,

  players: {},

  init: function () {
    let players = document.getElementsByClassName('spectrogram-player');
    for (let i = 0; i < players.length; i++) {
      const player = players[i];

      const imgElms = player.getElementsByTagName('img');
      if (imgElms.length === 0) {
        console.log('Spectrogram Player: Missing image element');
        continue;
      } else if (imgElms.length > 1) {
        console.log('Spectrogram Player: Found multiple images in player. First image element is assumed to be the spectrogram.')
      }
      const img = imgElms[0];

      const audioElms = player.getElementsByTagName('audio');
      if (audioElms.length === 0) {
        console.log('Spectrogram Player: Missing audio element');
        continue;
      } else if (audioElms.length !== 1) {
        console.log('Spectrogram Player: Found multiple audio elements in player. First audio element is assumed to be the audio file.')
      }
      const audio = audioElms[0];

      const width = (player.getAttribute('data-width')) ? player.getAttribute('data-width') : this.defaultWidth;
      const height = (player.getAttribute('data-height')) ? player.getAttribute('data-height') : this.defaultHeight;
      const freqMin = (player.getAttribute('data-freq-min')) ? player.getAttribute('data-freq-min') : this.defaultFreqMin;
      const freqMax = (player.getAttribute('data-freq-max')) ? player.getAttribute('data-freq-max') : this.defaultFreqMax;
      const axisWidth = (player.getAttribute('data-axis-width')) ? player.getAttribute('data-axis-width') : this.defaultAxisWidth;
      const axisDivisionHeight = (player.getAttribute('data-axis-division-height')) ? player.getAttribute('data-axis-division-height') : this.defaultAxisDivisionHeight;
      const axisSmoothing = (player.getAttribute('data-axis-smoothing')) ? player.getAttribute('data-axis-smoothing') : this.defaultAxisSmoothing;

      audio.style.width = width + 'px';

      //Create viewer element
      const viewer = document.createElement('div');
      viewer.className = 'sp-viewer';

      viewer.style.width = width + 'px';
      viewer.style.height = height + 'px';

      viewer.style.backgroundImage = `url('${img.src}')`;
      viewer.style.backgroundPosition = width / 2 + 'px';
      viewer.style.backgroundSize = 'auto ' + height + 'px';

      if (axisWidth > 0) {
        let divisions = Math.floor(height / axisDivisionHeight);
        if (axisSmoothing !== 0)
          divisions = this.smoothAxis(freqMax - freqMin, divisions, [0, .5, .25], axisSmoothing);

        const axis = this.drawAxis(axisWidth, height, freqMin, freqMax, divisions, 'kHz');
        axis.className = 'sp-axis';
        viewer.appendChild(axis);
      }

      const timeBar = document.createElement('div');
      timeBar.className = 'sp-timeBar';
      viewer.appendChild(timeBar);

      player.insertBefore(viewer, player.firstChild);

      this.players[i] = {
        'viewer': viewer,
        'audio': audio,
        'interval': null,
        'spectrogram': {
          'original_width': img.width,
          'original_height': img.height
        }
      }
      imgElms[0].parentNode.removeChild(imgElms[0]);

      audio.addEventListener('play', function () {
        spectrogram_player.startPlayer(i);
      })
      audio.addEventListener('seeking', function () {
        spectrogram_player.positionSpectrogram(i);
      })
      audio.addEventListener('pause', function () {
        spectrogram_player.stopPlayer(i);
      })
    }
  },

  startPlayer: function (player_id) {
    let player = this.players[player_id];
    if (player.interval === null) {
      this.players[player_id]['interval'] = setInterval(
          function () {
            spectrogram_player.positionSpectrogram(player_id)
          },
          33
      );
    }
  },

  stopPlayer: function (player_id) {
    let player = this.players[player_id];
    if (player.interval !== null) {
      clearInterval(player.interval);
      player.interval = null;
    }
  },

  positionSpectrogram: function (player_id) {
    let player = this.players[player_id];
    let viewer = player.viewer;
    let audio = player.audio;
    let spectrogram = player.spectrogram

    const viewerWidth = viewer.offsetWidth;
    const duration = audio.duration;
    const spectWidth = viewer.offsetHeight / spectrogram.original_height * spectrogram.original_width;

    viewer.style.backgroundPosition = viewerWidth / 2 - audio.currentTime / duration * spectWidth + 'px';
  },

  smoothAxis: function (range, baseDivision, allowedDecimals, distance) {
    if(distance === 0)
      return baseDivision;

    let subtractFirst = (distance >= 0);

    for(let i = 0; i <= distance; i++) {
      let d1 = (subtractFirst) ? baseDivision - i : baseDivision + i;
      let d2 = (subtractFirst) ? baseDivision + i : baseDivision - i;
      let decimal;

      if(d1 > 0) {
        decimal = this.quotientDecimal(range, d1, 4)
        if (allowedDecimals.indexOf(decimal) > -1)
          return d1;
      }

      if(d2 > 0) {
        decimal = this.quotientDecimal(range, d2, 4)
        if (allowedDecimals.indexOf(decimal) > -1)
          return d2;
      }
    }

    return baseDivision;
  },

  drawAxis: function (width, height, min, max, divisions, unit) {
    let axis = document.createElement('canvas');
    axis.width = width;
    axis.height = height;

    let ctx = axis.getContext('2d');

    ctx.fillStyle = 'rgba(0,0,0,.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgb(100,100,100)';
    ctx.strokeStyle = 'rgb(100,100,100)';

    let range = max - min;

    for (let i = 0; i < divisions; i++) {
      let y = Math.round(height / divisions * i);
      ctx.moveTo(0, y + .5);
      ctx.lineTo(width, y + .5);
      ctx.stroke();

      let curVal = (divisions - i) * range / divisions + min * 1;

      ctx.fillText(String(Math.round(curVal * 100) / 100), width, y);
    }

    ctx.textBaseline = 'bottom';
    ctx.fillText(unit, width, height);

    return axis;
  },

  quotientDecimal: function (dividend, divisor, precision) {
    let quotient = dividend / divisor;
    let b;

    if (precision === undefined)
      b = 1;
    else
      b = Math.pow(10, precision);

    return Math.round(quotient % 1 * b) / b;
  }
};

window.onload = function() { spectrogram_player.init(); };
