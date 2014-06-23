# media-sequence

> HTML5 media sequenced playback API: play one or multiple sequences of a same audio or video with plain JavaScript.

![](demo.gif?raw=1)

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
var sequences = [{start: 0, end: 5}, {start: 12, end: 13}, {start: 21, end: 31}];
var sequencer = new MediaSequence(new Audio('path/to/audio.ogg'), sequences);

sequencer.playAll();
```

# API

## `new MediaSequence(el, sequences)`

## `sequencer.add(sequences)`

Adds new sequences to the actual stack.

```js
var sequencer = new MediaSequence(new Audio('path/to/audio.ogg'));

sequencer.add([{ start: 0, end: 10 }, { start: 3, end: 6}]);
sequencer.add([{ start: 11, end: 12 }]);
```

## `sequencer.playAll()`

Starts the playback of all the sequences in a row.

## `sequencer.playFrom(start, end)`

Starts the playback from a `start` time and stops automatically at an `end` time.

```js
var sequencer = new MediaSequence(new Audio('path/to/audio.ogg'));

sequencer.playFrom(10, 12); // will play from 10 seconds to 12 seconds
```

## `sequencer.playNext()`

Plays the next consecutive sequence based on the current playback time.

```js
var el = new Audio('path/to/audio.ogg');
var sequencer = new MediaSequence(el, sequences);

el.currentTime = 12;
sequencer.playNext(); // will play the next sequence starting after 12 seconds
```

## `sequencer.getNext(referenceTime, options)`

Returns the next sequence from a `referenceTime` numbered value.

```js
var ms = new MediaSequencer(…, [{ start: 3, end: 5 }, { start: 12, end: 13 }]);

ms.getNext(0);
// { start: 3, end: 5 }

ms.getNext(3);
// { start: 12, end: 13 }
```

If the `options.overlap` value is set to `true`, the returned sequence is allowed to overlap:

```js
var ms = new MediaSequencer(…, [{ start: 3, end: 5 }, {start: 3, end: 10 }, { start: 12, end: 13 }]);

ms.getNext(3);
// { start: 12, end: 13 }

ms.getNext(3, { overlap: true });
// {start: 3, end: 5 }
```

# Licence

> Copyright 2014 British Broadcasting Corporation
>
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.