"use strict";

var component = condition === true ? React.createElement(
  "div",
  null,
  "Loading..."
) : React.createElement(
  "div",
  null,
  undefined.state.data
);