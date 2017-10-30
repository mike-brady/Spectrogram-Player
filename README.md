# Spectrogram-Player
A web based media player for synchronized playback of an audio file and its spectrogram.
## Getting Started
### Link to the CSS file
```
<link rel="stylesheet" type="text/css" href="spectrogramplayer.css" />
```
### Link to the JavaScript file
```
<script type="text/javascript" src="spectrogramplayer.js"></script>
```
### Set Spectrogram Player to initialize after the page loads
```
<body onload="sp_init();">
```
### Add a player
```
<div class="spectrogram-player">
  <img src="[pathToSpectrogramImage]" />
  <audio controls>
    <source src="[pathToAudioFile]" type="audio/wav">
  </audio>
</div>
```
## Custom Settings
The following settings can be customized to change the look and behavior of the Spectrogram Player. There are two ways to change the settings. You can set them in HTML or change them in JavaScript. Setting values in HTML only apply to the individual instance of the player. Setting the values in JavaScript apply to all players. HTML settings override JavaScript settings.

### Custom Settings in HTML
To change the settings in HTML add a "data-[setting-name]" attribute to the parent \<div\> of the player with desired setting value as the value of the attribute.
```
<div class="spectrogram-player" data-width="300" data-height="150">
  <img src="[pathToSpectrogramImage]" />
  <audio controls>
    <source src="[pathToAudioFile]" type="audio/wav">
  </audio>
</div>
```

### Custom Settings in JavaScript
To change the settings in JavaScript, adjust the values of variables at the top of the function sp_init().
```
function sp_init() {
  defaultWidth = 300;
  defaultHeight = 150;
  ...
}
```

### Settings
|Setting|HTML Attribute Name|Description
|--|--|--|
width|data-width|The width of the player in pixels
height|data-height|The height of the player in pixels
freqMin|data-freq-min|The minimum frequency of the spectrogram in kHz
freqMax|data-freq-max|The maximum frequency of the spectrogram in kHz
axisWidth|data-axis-width|The width of the frequency axis in pixels. Setting a value < 1 will prevent the axis from showing.
axisDivisionHeight|data-axis-division-height|The minimum height of each division in the axis in pixels
axisSmoothing|data-axis-smoothing|The amount of smoothing to apply to the axis<br><br>Smoothing attempts to divide the frequency range in a way that creates "nicer" increments than what you might get when dividing the axis automatically based on the spectrogram height, the axisDivisionHeight, and the frequency range. A nice increment is defined as an integer or decimal number whose value after the decimal place is either .5 or .25<br><br>The smoothing value determines how much higher/lower than the calculated number of divisions to look for a nice increment for the axis.<br><br>For example a player with a height of 200px, an axisDivisionHeight of 40px, and a frequency range of 12kHz would result in 5 divisions (200px/40px) at an increment of 2.4khz (12kHz/5) per division. 2.4 is not considered to be a nice increment because its value after the decimal (.4) is not .5 or .25<br><br>If the smoothing value was set at 2, divisions from 3 (5-2) up to 7 (5+2) would be checked for a nice increment. It will start by checking 5+/-1, then 5+/-2. Note if 5+1 divisions AND 5-1 divisions both result in a nice increment, 5+1 would be used first because the smoothing value was set to positive 2. If the smoothing value was set to -2, then 5-1 would be used before 5+1.<br><br>In our example with smoothing set to 2, first 5+1 divisions would be checked. 12khz/(5+1) = 2kHz. 2kHz is a nice number, so the axis will be divided into 6 increments. If the smoothing value was set to -2, it would check 5-1 first. 12kHz/(5-1) = 3kHz. 3kHz is a nice number, so the axis will be divided into 4 increments.<br><br>A smoothing value of 0 will apply no smoothing.
