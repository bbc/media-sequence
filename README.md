# media-sequence

> Manual and automatic HTML5 media sequenced playback. And plain JavaScript, no library required.

# Installation

<table>
  <thead>
    <tr>
      <th><a href="https://npmjs.org/">npm</a></th>
      <th><a href="https://github.com/bower/bower">bower</a></th>
      <th>old school</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm install --save media-sequence</code></td>
      <td><code>bower install --save media-sequence</code></td>
      <td><a href="https://github.com/oncletom/media-sequence/archive/master.zip">download zip file</a></td>
    </tr>
  </tbody>
</table>

# Usage

```js
var el = document.querySelector('audio');
var sequences = [{start: 0, end: 5}, {start: 12, end: 13}, {start: 21, end: 31}];
var sequencer = new MediaSequence(el, sequences);

sequencer.playAll();
```

# API

## `new MediaSequence(el, sequences)`

## `sequencer.play()`

Registers event listeners and starts the playback from the current time position.

## `sequencer.pause()`

Unregisters event listeners and stops the playback.

## `sequencer.playAll()`

Registers event listeners and starts the playback of all the sequences in a row.

## `sequencer.playNext()`

Starts the playback or jumps to the next available sequence in time, and continues to the next available sequences.

## `sequencer.playFrom(start, end)`

Starts the playback from the `start` time and stops automatically at the `end` time.

# Licence

> Copyright 2014 British Broadcasting Corporation
>
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.