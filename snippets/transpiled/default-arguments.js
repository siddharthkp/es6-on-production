'use strict';

function func() {
  var foo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'bar';
}