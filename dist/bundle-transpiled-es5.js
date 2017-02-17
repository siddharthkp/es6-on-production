(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Controller = require('./controller');

var _require = require('./helpers'),
    $on = _require.$on;

var Template = require('./template');
var Store = require('./store');
var View = require('./view');

var store = new Store('todos-vanilla-es6');

var template = new Template();
var view = new View(template);

/**
 * @type {Controller}
 */
var controller = new Controller(store, view);

var setView = function setView() {
  return controller.setView(document.location.hash);
};
$on(window, 'load', setView);
$on(window, 'hashchange', setView);

},{"./controller":2,"./helpers":3,"./store":5,"./template":6,"./view":7}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./item'),
    emptyItemQuery = _require.emptyItemQuery;

var Store = require('./store');
var View = require('./view');

module.exports = function () {
	/**
  * @param  {!Store} store A Store instance
  * @param  {!View} view A View instance
  */
	function Controller(store, view) {
		var _this = this;

		_classCallCheck(this, Controller);

		this.store = store;
		this.view = view;

		view.bindAddItem(this.addItem.bind(this));
		view.bindEditItemSave(this.editItemSave.bind(this));
		view.bindEditItemCancel(this.editItemCancel.bind(this));
		view.bindRemoveItem(this.removeItem.bind(this));
		view.bindToggleItem(function (id, completed) {
			_this.toggleCompleted(id, completed);
			_this._filter();
		});
		view.bindRemoveCompleted(this.removeCompletedItems.bind(this));
		view.bindToggleAll(this.toggleAll.bind(this));

		this._activeRoute = '';
		this._lastActiveRoute = null;
	}

	/**
  * Set and render the active route.
  *
  * @param {string} raw '' | '#/' | '#/active' | '#/completed'
  */


	_createClass(Controller, [{
		key: 'setView',
		value: function setView(raw) {
			var route = raw.replace(/^#\//, '');
			this._activeRoute = route;
			this._filter();
			this.view.updateFilterButtons(route);
		}

		/**
   * Add an Item to the Store and display it in the list.
   *
   * @param {!string} title Title of the new item
   */

	}, {
		key: 'addItem',
		value: function addItem(title) {
			var _this2 = this;

			this.store.insert({
				id: Date.now(),
				title: title,
				completed: false
			}, function () {
				_this2.view.clearNewTodo();
				_this2._filter(true);
			});
		}

		/**
   * Save an Item in edit.
   *
   * @param {number} id ID of the Item in edit
   * @param {!string} title New title for the Item in edit
   */

	}, {
		key: 'editItemSave',
		value: function editItemSave(id, title) {
			var _this3 = this;

			if (title.length) {
				this.store.update({ id: id, title: title }, function () {
					_this3.view.editItemDone(id, title);
				});
			} else {
				this.removeItem(id);
			}
		}

		/**
   * Cancel the item editing mode.
   *
   * @param {!number} id ID of the Item in edit
   */

	}, {
		key: 'editItemCancel',
		value: function editItemCancel(id) {
			var _this4 = this;

			this.store.find({ id: id }, function (data) {
				var title = data[0].title;
				_this4.view.editItemDone(id, title);
			});
		}

		/**
   * Remove the data and elements related to an Item.
   *
   * @param {!number} id Item ID of item to remove
   */

	}, {
		key: 'removeItem',
		value: function removeItem(id) {
			var _this5 = this;

			this.store.remove({ id: id }, function () {
				_this5._filter();
				_this5.view.removeItem(id);
			});
		}

		/**
   * Remove all completed items.
   */

	}, {
		key: 'removeCompletedItems',
		value: function removeCompletedItems() {
			this.store.remove({ completed: true }, this._filter.bind(this));
		}

		/**
   * Update an Item in storage based on the state of completed.
   *
   * @param {!number} id ID of the target Item
   * @param {!boolean} completed Desired completed state
   */

	}, {
		key: 'toggleCompleted',
		value: function toggleCompleted(id, completed) {
			var _this6 = this;

			this.store.update({ id: id, completed: completed }, function () {
				_this6.view.setItemComplete(id, completed);
			});
		}

		/**
   * Set all items to complete or active.
   *
   * @param {boolean} completed Desired completed state
   */

	}, {
		key: 'toggleAll',
		value: function toggleAll(completed) {
			var _this7 = this;

			this.store.find({ completed: !completed }, function (data) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var id = _step.value.id;

						_this7.toggleCompleted(id, completed);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			});

			this._filter();
		}

		/**
   * Refresh the list based on the current route.
   *
   * @param {boolean} [force] Force a re-paint of the list
   */

	}, {
		key: '_filter',
		value: function _filter(force) {
			var _this8 = this;

			var route = this._activeRoute;

			if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
				/* jscs:disable disallowQuotedKeysInObjects */
				this.store.find({
					'': emptyItemQuery,
					'active': { completed: false },
					'completed': { completed: true }
				}[route], this.view.showItems.bind(this.view));
				/* jscs:enable disallowQuotedKeysInObjects */
			}

			this.store.count(function (total, active, completed) {
				_this8.view.setItemsLeft(active);
				_this8.view.setClearCompletedButtonVisibility(completed);

				_this8.view.setCompleteAllCheckbox(completed === total);
				_this8.view.setMainVisibility(total);
			});

			this._lastActiveRoute = route;
		}
	}]);

	return Controller;
}();

},{"./item":4,"./store":5,"./view":7}],3:[function(require,module,exports){
'use strict';

/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
var qs = function qs(selector, scope) {
  return (scope || document).querySelector(selector);
};

/**
 * addEventListener wrapper
 *
 * @param {Element|Window} target Target Element
 * @param {string} type Event name to bind to
 * @param {Function} callback Event callback
 * @param {boolean} [capture] Capture the event
 */
var $on = function $on(target, type, callback, capture) {
  target.addEventListener(type, callback, !!capture);
};

/**
 * Attach a handler to an event for all elements matching a selector.
 *
 * @param {Element} target Element which the event must bubble to
 * @param {string} selector Selector to match
 * @param {string} type Event name
 * @param {Function} handler Function called when the event bubbles to target
 *                           from an element matching selector
 * @param {boolean} [capture] Capture the event
 */
var $delegate = function $delegate(target, selector, type, handler, capture) {
  var dispatchEvent = function dispatchEvent(event) {
    var targetElement = event.target;
    var potentialElements = target.querySelectorAll(selector);
    var i = potentialElements.length;

    while (i--) {
      if (potentialElements[i] === targetElement) {
        handler.call(targetElement, event);
        break;
      }
    }
  };

  $on(target, type, dispatchEvent, !!capture);
};

/**
 * Encode less-than and ampersand characters with entity codes to make user-
 * provided text safe to parse as HTML.
 *
 * @param {string} s String to escape
 *
 * @returns {string} String with unsafe characters escaped with entity codes
 */
var escapeForHTML = function escapeForHTML(s) {
  return s.replace(/[&<]/g, function (c) {
    return c === '&' ? '&amp;' : '&lt;';
  });
};

module.exports = {
  qs: qs,
  $on: $on,
  $delegate: $delegate,
  escapeForHTML: escapeForHTML
};

},{}],4:[function(require,module,exports){
"use strict";

/**
 * @typedef {!{id: number, completed: boolean, title: string}}
 */
var Item = void 0;

/**
 * @typedef {!Array<Item>}
 */
var ItemList = void 0;

/**
 * Enum containing a known-empty record type, matching only empty records unlike Object.
 *
 * @enum {Object}
 */
var Empty = {
  Record: {}
};

/**
 * Empty ItemQuery type, based on the Empty @enum.
 *
 * @typedef {Empty}
 */
var EmptyItemQuery = void 0;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {EmptyItemQuery}
 */
var emptyItemQuery = Empty.Record;

/**
 * @typedef {!({id: number}|{completed: boolean}|EmptyItemQuery)}
 */
var ItemQuery = void 0;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})}
 */
var ItemUpdate = void 0;

module.exports = {
  Item: Item,
  ItemList: ItemList,
  EmptyItemQuery: EmptyItemQuery,
  emptyItemQuery: emptyItemQuery,
  ItemQuery: ItemQuery,
  ItemUpdate: ItemUpdate
};

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./item'),
    Item = _require.Item,
    ItemList = _require.ItemList,
    ItemQuery = _require.ItemQuery,
    ItemUpdate = _require.ItemUpdate,
    emptyItemQuery = _require.emptyItemQuery;

module.exports = function () {
	/**
  * @param {!string} name Database name
  * @param {function()} [callback] Called when the Store is ready
  */
	function Store(name, callback) {
		_classCallCheck(this, Store);

		/**
   * @type {Storage}
   */
		var localStorage = window.localStorage;

		/**
   * @type {ItemList}
   */
		var liveTodos = void 0;

		/**
   * Read the local ItemList from localStorage.
   *
   * @returns {ItemList} Current array of todos
   */
		this.getLocalStorage = function () {
			return liveTodos || JSON.parse(localStorage.getItem(name) || '[]');
		};

		/**
   * Write the local ItemList to localStorage.
   *
   * @param {ItemList} todos Array of todos to write
   */
		this.setLocalStorage = function (todos) {
			return localStorage.setItem(name, JSON.stringify(liveTodos = todos));
		};

		if (callback) {
			callback();
		}
	}

	/**
  * Find items with properties matching those on query.
  *
  * @param {ItemQuery} query Query to match
  * @param {function(ItemList)} callback Called when the query is done
  *
  * @example
  * db.find({completed: true}, data => {
  *	 // data shall contain items whose completed properties are true
  * })
  */


	_createClass(Store, [{
		key: 'find',
		value: function find(query, callback) {
			var todos = this.getLocalStorage();
			var k = void 0;

			callback(todos.filter(function (todo) {
				for (k in query) {
					if (query[k] !== todo[k]) {
						return false;
					}
				}
				return true;
			}));
		}

		/**
   * Update an item in the Store.
   *
   * @param {ItemUpdate} update Record with an id and a property to update
   * @param {function()} [callback] Called when partialRecord is applied
   */

	}, {
		key: 'update',
		value: function update(_update, callback) {
			var id = _update.id;
			var todos = this.getLocalStorage();
			var i = todos.length;
			var k = void 0;

			while (i--) {
				if (todos[i].id === id) {
					for (k in _update) {
						todos[i][k] = _update[k];
					}
					break;
				}
			}

			this.setLocalStorage(todos);

			if (callback) {
				callback();
			}
		}

		/**
   * Insert an item into the Store.
   *
   * @param {Item} item Item to insert
   * @param {function()} [callback] Called when item is inserted
   */

	}, {
		key: 'insert',
		value: function insert(item, callback) {
			var todos = this.getLocalStorage();
			todos.push(item);
			this.setLocalStorage(todos);

			if (callback) {
				callback();
			}
		}

		/**
   * Remove items from the Store based on a query.
   *
   * @param {ItemQuery} query Query matching the items to remove
   * @param {function(ItemList)|function()} [callback] Called when records matching query are removed
   */

	}, {
		key: 'remove',
		value: function remove(query, callback) {
			var k = void 0;

			var todos = this.getLocalStorage().filter(function (todo) {
				for (k in query) {
					if (query[k] !== todo[k]) return true;
				}
				return false;
			});

			this.setLocalStorage(todos);

			if (callback) callback(todos);
		}

		/**
   * Count total, active, and completed todos.
   *
   * @param {function(number, number, number)} callback Called when the count is completed
   */

	}, {
		key: 'count',
		value: function count(callback) {
			this.find(emptyItemQuery, function (data) {
				var total = data.length;

				var i = total;
				var completed = 0;

				while (i--) {
					completed += data[i].completed;
				}callback(total, total - completed, completed);
			});
		}
	}]);

	return Store;
}();

},{"./item":4}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./item'),
    ItemList = _require.ItemList;

var _require2 = require('./helpers'),
    escapeForHTML = _require2.escapeForHTML;

module.exports = function () {
	function Template() {
		_classCallCheck(this, Template);
	}

	_createClass(Template, [{
		key: 'itemList',

		/**
   * Format the contents of a todo list.
   *
   * @param {ItemList} items Object containing keys you want to find in the template to replace.
   * @returns {!string} Contents for a todo list
   *
   * @example
   * view.show({
   *	id: 1,
   *	title: "Hello World",
   *	completed: false,
   * })
   */
		value: function itemList(items) {
			return items.reduce(function (a, item) {
				return a + ('\n<li data-id="' + item.id + '"' + (item.completed ? ' class="completed"' : '') + '>\n\t<input class="toggle" type="checkbox" ' + (item.completed ? 'checked' : '') + '>\n\t<label>' + escapeForHTML(item.title) + '</label>\n\t<button class="destroy"></button>\n</li>');
			}, '');
		}

		/**
   * Format the contents of an "items left" indicator.
   *
   * @param {number} activeTodos Number of active todos
   *
   * @returns {!string} Contents for an "items left" indicator
   */

	}, {
		key: 'itemCounter',
		value: function itemCounter(activeTodos) {
			return activeTodos + ' item' + (activeTodos !== 1 ? 's' : '') + ' left';
		}
	}]);

	return Template;
}();

},{"./helpers":3,"./item":4}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./item'),
    ItemList = _require.ItemList;

var _require2 = require('./helpers'),
    qs = _require2.qs,
    $on = _require2.$on,
    $delegate = _require2.$delegate;

var Template = require('./template');

var _itemId = function _itemId(element) {
	return parseInt(element.parentNode.dataset.id, 10);
};
var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

module.exports = function () {
	/**
  * @param {!Template} template A Template instance
  */
	function View(template) {
		var _this = this;

		_classCallCheck(this, View);

		this.template = template;
		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
		$delegate(this.$todoList, 'li label', 'dblclick', function (_ref) {
			var target = _ref.target;

			_this.editItem(target);
		});
	}

	/**
  * Put an item into edit mode.
  *
  * @param {!Element} target Target Item's label Element
  */


	_createClass(View, [{
		key: 'editItem',
		value: function editItem(target) {
			var listItem = target.parentElement;

			listItem.classList.add('editing');

			var input = document.createElement('input');
			input.className = 'edit';

			input.value = target.innerText;
			listItem.appendChild(input);
			input.focus();
		}

		/**
   * Populate the todo list with a list of items.
   *
   * @param {ItemList} items Array of items to display
   */

	}, {
		key: 'showItems',
		value: function showItems(items) {
			this.$todoList.innerHTML = this.template.itemList(items);
		}

		/**
   * Remove an item from the view.
   *
   * @param {number} id Item ID of the item to remove
   */

	}, {
		key: 'removeItem',
		value: function removeItem(id) {
			var elem = qs('[data-id="' + id + '"]');

			if (elem) {
				this.$todoList.removeChild(elem);
			}
		}

		/**
   * Set the number in the 'items left' display.
   *
   * @param {number} itemsLeft Number of items left
   */

	}, {
		key: 'setItemsLeft',
		value: function setItemsLeft(itemsLeft) {
			this.$todoItemCounter.innerHTML = this.template.itemCounter(itemsLeft);
		}

		/**
   * Set the visibility of the "Clear completed" button.
   *
   * @param {boolean|number} visible Desired visibility of the button
   */

	}, {
		key: 'setClearCompletedButtonVisibility',
		value: function setClearCompletedButtonVisibility(visible) {
			this.$clearCompleted.style.display = !!visible ? 'block' : 'none';
		}

		/**
   * Set the visibility of the main content and footer.
   *
   * @param {boolean|number} visible Desired visibility
   */

	}, {
		key: 'setMainVisibility',
		value: function setMainVisibility(visible) {
			this.$main.style.display = !!visible ? 'block' : 'none';
		}

		/**
   * Set the checked state of the Complete All checkbox.
   *
   * @param {boolean|number} checked The desired checked state
   */

	}, {
		key: 'setCompleteAllCheckbox',
		value: function setCompleteAllCheckbox(checked) {
			this.$toggleAll.checked = !!checked;
		}

		/**
   * Change the appearance of the filter buttons based on the route.
   *
   * @param {string} route The current route
   */

	}, {
		key: 'updateFilterButtons',
		value: function updateFilterButtons(route) {
			qs('.filters>.selected').className = '';
			qs('.filters>[href="#/' + route + '"]').className = 'selected';
		}

		/**
   * Clear the new todo input
   */

	}, {
		key: 'clearNewTodo',
		value: function clearNewTodo() {
			this.$newTodo.value = '';
		}

		/**
   * Render an item as either completed or not.
   *
   * @param {!number} id Item ID
   * @param {!boolean} completed True if the item is completed
   */

	}, {
		key: 'setItemComplete',
		value: function setItemComplete(id, completed) {
			var listItem = qs('[data-id="' + id + '"]');

			if (!listItem) return;

			listItem.className = completed ? 'completed' : '';

			// In case it was toggled from an event and not by clicking the checkbox
			qs('input', listItem).checked = completed;
		}

		/**
   * Bring an item out of edit mode.
   *
   * @param {!number} id Item ID of the item in edit
   * @param {!string} title New title for the item in edit
   */

	}, {
		key: 'editItemDone',
		value: function editItemDone(id, title) {
			var listItem = qs('[data-id="' + id + '"]');

			var input = qs('input.edit', listItem);
			listItem.removeChild(input);

			listItem.classList.remove('editing');

			qs('label', listItem).textContent = title;
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindAddItem',
		value: function bindAddItem(handler) {
			$on(this.$newTodo, 'change', function (_ref2) {
				var target = _ref2.target;

				var title = target.value.trim();
				if (title) handler(title);
			});
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindRemoveCompleted',
		value: function bindRemoveCompleted(handler) {
			$on(this.$clearCompleted, 'click', handler);
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindToggleAll',
		value: function bindToggleAll(handler) {
			$on(this.$toggleAll, 'click', function (_ref3) {
				var target = _ref3.target;
				return handler(target.checked);
			});
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindRemoveItem',
		value: function bindRemoveItem(handler) {
			$delegate(this.$todoList, '.destroy', 'click', function (_ref4) {
				var target = _ref4.target;
				return handler(_itemId(target));
			});
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindToggleItem',
		value: function bindToggleItem(handler) {
			$delegate(this.$todoList, '.toggle', 'click', function (_ref5) {
				var target = _ref5.target;

				handler(_itemId(target), target.checked);
			});
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindEditItemSave',
		value: function bindEditItemSave(handler) {
			$delegate(this.$todoList, 'li .edit', 'blur', function (_ref6) {
				var target = _ref6.target;

				if (!target.dataset.iscanceled) handler(_itemId(target), target.value.trim());
			}, true);

			// Remove the cursor from the input when you hit enter just like if it were a real form
			$delegate(this.$todoList, 'li .edit', 'keypress', function (_ref7) {
				var target = _ref7.target,
				    keyCode = _ref7.keyCode;

				if (keyCode === ENTER_KEY) target.blur();
			});
		}

		/**
   * @param {Function} handler Function called on synthetic event.
   */

	}, {
		key: 'bindEditItemCancel',
		value: function bindEditItemCancel(handler) {
			$delegate(this.$todoList, 'li .edit', 'keyup', function (_ref8) {
				var target = _ref8.target,
				    keyCode = _ref8.keyCode;

				if (keyCode === ESCAPE_KEY) {
					target.dataset.iscanceled = true;
					target.blur();

					handler(_itemId(target));
				}
			});
		}
	}]);

	return View;
}();

},{"./helpers":3,"./item":4,"./template":6}]},{},[1,2,3,4,5,6,7]);
