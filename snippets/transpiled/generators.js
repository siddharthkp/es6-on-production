"use strict";

var _marked = [foo].map(regeneratorRuntime.mark);

function foo() {
    var x;
    return regeneratorRuntime.wrap(function foo$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return "foo";

                case 2:
                    _context.t0 = _context.sent;
                    x = 1 + _context.t0;

                    console.log(x);

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, _marked[0], this);
}