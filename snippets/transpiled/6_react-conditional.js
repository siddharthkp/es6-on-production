"use strict";

var component = function component() {
  return condition === true ? React.createElement(
    "div",
    null,
    "Loading..."
  ) : React.createElement(
    "div",
    null,
    undefined.state.data
  );
};