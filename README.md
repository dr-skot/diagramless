## diagramless

Solve crosswords without knowing in advance where the black squares are.

Running at https://diagramless.herokuapp.com (it sleeps when idle so you might have to wait a few seconds).

### keys

|key|action|
|---|---|
|A-Z|insert letter|
|.|toggle black|
|0-9|edit cell number|
|esc|enter rebus|
|arrows|move or switch direction|
|tab|next incomplete word (shift = backward)|
|backspace|clear cell and move to previous|

### numbering

You can edit the number of a cell manually (by typing digits) only if
- the cell starts a word
- automatic numbering is off

### symmetry

Set the symmetry to 'diagonal' or 'left-right' and symmetrical cells will toggle blackness in tandem with the current cell.

### load a new puzzle

Drag a `.puz` file onto the puzzle grid.

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
