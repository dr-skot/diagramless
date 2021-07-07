## diagramless

Solve crosswords without knowing in advance where the black squares are.

Running at https://diagramless.herokuapp.com (it sleeps when idle so you might have to wait a few seconds).

### usage

`npm start`

### keys

|key|action|
|---|---|
|A-Z|insert letter|
|.|toggle black|
|0-9|edit cell number|
|esc|enter rebus|
|arrows|switch direction or move one cell|
|tab|move next incomplete word (shift = backward)|
|backspace|clear cell and move to previous|

### numbering

You can edit a cell's number manually (by typing digits) only if
- the cell starts a word
- automatic numbering is off

### symmetry

Set the symmetry to diagonal or left-right, and symmetrical cells will toggle blackness in tandem with the current cell.

### load a new puzzle

Drag a `.puz` file onto the puzzle grid.
