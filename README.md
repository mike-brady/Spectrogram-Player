# Spectrogram-Player
A web based media player for synchronized playback of an audio file and its spectrogram.

www.mikebrady.com/programming/spectrogram/

## Getting Started
### Link to the Javascript file and CSS file inside the \<head\> element
```
<link rel="stylesheet" type="text/css" href="spectrogram-player/style.css" />
<script type="text/javascript" src="spectrogram-player/spectrogram-player.js"></script>
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

### Custom settings on a per player basis
To change the settings for a specific player, add a "data-[setting-name]" attribute to the parent \<div\> of the player with desired setting value as the value of the attribute.
```
<div class="spectrogram-player" data-width="300" data-height="150">
  ...
</div>
```

### Default settings for all players
To change the default settings for all players, adjust the values of default variables inside spectrogram-players.js.
```
defaultWidth: 300,
defaultHeight: 150,
```

### Using custom settings and default settings at the same time
Custom settings in the HTML will override the default settings for that specific player.

### Settings
|Setting|HTML Attribute Name|Description
|--|--|--|
width|data-width|The width of the player in pixels
height|data-height|The height of the player in pixels
freqMin|data-freq-min|The minimum frequency of the spectrogram in kHz
freqMax|data-freq-max|The maximum frequency of the spectrogram in kHz
axisWidth|data-axis-width|The width of the frequency axis in pixels. Setting a value < 1 will prevent the axis from showing.
axisDivisionHeight|data-axis-division-height|The minimum height of each division in the axis in pixels
axisSmoothing|data-axis-smoothing|The amount of smoothing to apply to the axis. Smoothing attempts to divide the frequency range into increments that are mutliples of .25<br /><br />Example: A frequency range of 0 - 15kHz divided into 7 increments would result in the following increments:<br />0, 2.14.., 4.29.., 6.43.., 8.57.., 10.71.., 12.86.., 15<br /><br />With smoothing turned on and set to 1, the frequency will be divided into 6 increments instead, resulting in the following increments:<br />0, 2.5, 5, 7.5, 10, 12.5, 15<br /><br />The smoothing value determines how much higher/lower than the calculated number of divisions to look for a nice increment for the axis.<br /><br />A smoothing value of 0 will apply no smoothing.
