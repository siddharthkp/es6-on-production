"use strict";

var cascadingMenu = React.createElement(
  Menu,
  null,
  React.createElement(
    MenuItem,
    null,
    "One"
  ),
  React.createElement(
    MenuItem,
    null,
    "Two"
  ),
  React.createElement(
    MenuItem,
    null,
    "Three"
  ),
  React.createElement(
    MenuItem,
    null,
    "Four"
  ),
  React.createElement(
    MenuItem,
    null,
    "Five"
  )
);

/*
let items = ['One', 'Two', 'Three', 'Four', 'Five'];
let cascadingMenu = (
  <Menu>{items.map((item, key) => <MenuItem key={key}>{item}</MenuItem>)}</Menu>
)
*/