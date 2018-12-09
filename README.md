# Spectrogram-Player
![Spectrogram Player](http://www.mikebrady.com/programming/spectrogram/spectrogram-player.gif)

A web based media player for synchronized playback of an audio file and its spectrogram.

## Getting Started

### Requirements
To create a spectrogram player, you will need an audio file and an image file of its spectrogram. Spectrogram Player cannot create spectrograms automically from audio files. Fortunately, there are a variety of free websites and programs that will make it easy to create a spectrogram. A few good options are listed below.<br />
<br />
<b>Online Tools:</b><br />
<a href="http://convert.ing-now.com/audio-spectrogram-creator/">convert.ing-now.com/audio-spectrogram-creator</a><br />
<br />
<b>Free Programs:</b><br />
<a href="https://www.audacityteam.org/">Audacity</a> (<a href="https://manual.audacityteam.org/man/spectrogram_view.html">Spectrogram View in Audacity</a>)

### Adding Dependencies
In the \<head\> tag of the page you wish to add a spectrogram player to, add the following lines.
```
<link rel="stylesheet" type="text/css" href="spectrogram-player/style.css" />
<script type="text/javascript" src="spectrogram-player/spectrogram-player.js"></script>
```
### Creating a Spectrogram Player
To create a player, all you need to do is to create a \<div\> element with the class name "spectrogram-player". Then, add an \<img\> element and \<audio\> element inside the \<div\>, linking to the spectrogram image and audio file respectively. And that's it! Multiple spectrogram players can also be added on a single page.
```
<div class="spectrogram-player">
  <img src="[pathToSpectrogramImage]" />
  <audio controls>
    <source src="[pathToAudioFile]" type="audio/wav">
  </audio>
</div>
```
## Custom Settings
The following settings can be customized to change the look and behavior of the Spectrogram Player. There are two ways to change the settings. You can set them in HTML or change them in JavaScript. Setting values in HTML only apply to the individual instance of the player. Setting the values in JavaScript apply to all players. In the case of HTML and JavaScript settings being set at the same time, HTML settings will override JavaScript settings for each individual player.

### Custom Settings on a Per Player Basis
To change the settings for a specific player, add a "data-[setting-name]" attribute to the parent \<div\> of the player with desired setting value as the value of the attribute.
```
<div class="spectrogram-player" data-width="300" data-height="150">
  ...
</div>
```

### Default Settings For All Players
To change the default settings for all players, adjust the values of default variables inside spectrogram-players.js.
```
defaultWidth: 300,
defaultHeight: 150,
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
axisSmoothing|data-axis-smoothing|The amount of smoothing to apply to the axis. Smoothing attempts to divide the frequency range into increments that are mutliples of .25<br /><br />Example: A frequency range of 0 - 15kHz divided into 7 increments would result in the following increments:<br />0, 2.14.., 4.29.., 6.43.., 8.57.., 10.71.., 12.86.., 15<br /><br />With smoothing turned on and set to 1, the frequency will be divided into 6 increments instead, resulting in the following increments:<br />0, 2.5, 5, 7.5, 10, 12.5, 15<br /><br />The smoothing value determines how much higher/lower than the calculated number of divisions to look for a nice increment for the axis.<br /><br />A smoothing value of 0 will apply no smoothing.
