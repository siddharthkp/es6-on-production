(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Controller = require('./controller');
var helpers = require('./helpers');
var $on = helpers.$on;

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

function setView() {
  return controller.setView(document.location.hash);
};

$on(window, 'load', setView);
$on(window, 'hashchange', setView);

},{"./controller":2,"./helpers":3,"./store":5,"./template":6,"./view":7}],2:[function(require,module,exports){
var item = require('./item');
var emptyItemQuery = item.emptyItemQuery;
var Store = require('./store');
var View = require('./view');

/**
 * @param  {!Store} store A Store instance
 * @param  {!View} view A View instance
 */
function Controller(store, view) {
  this.store = store;
  this.view = view;
  var self = this;

  view.bindAddItem(this.addItem.bind(this));
  view.bindEditItemSave(this.editItemSave.bind(this));
  view.bindEditItemCancel(this.editItemCancel.bind(this));
  view.bindRemoveItem(this.removeItem.bind(this));
  view.bindToggleItem(function(id, completed) {
    self.toggleCompleted(id, completed);
    self._filter();
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
 Controller.prototype.setView = function (raw) {
   var route = raw.replace(/^#\//, '');
   this._activeRoute = route;
   this._filter();
   this.view.updateFilterButtons(route);
 };


/**
 * Add an Item to the Store and display it in the list.
 *
 * @param {!string} title Title of the new item
 */
Controller.prototype.addItem = function(title) {
  var self = this;
	this.store.insert({
		id: Date.now(),
		title: title,
		completed: false
	}, function () {
		self.view.clearNewTodo();
		self._filter(true);
	});
}

/**
 * Save an Item in edit.
 *
 * @param {number} id ID of the Item in edit
 * @param {!string} title New title for the Item in edit
 */
Controller.prototype.editItemSave = function(id, title) {
	if (title.length) {
    var self = this;
		this.store.update({id, title}, function () {
			self.view.editItemDone(id, title);
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
Controller.prototype.editItemCancel = function (id) {
  var self = this;
	this.store.find({id}, function(data) {
		var title = data[0].title;
		self.view.editItemDone(id, title);
	});
}

/**
 * Remove the data and elements related to an Item.
 *
 * @param {!number} id Item ID of item to remove
 */
Controller.prototype.removeItem = function (id) {
  var self = this;
	this.store.remove({id}, function () {
		self._filter();
		self.view.removeItem(id);
	});
}

/**
 * Remove all completed items.
 */
Controller.prototype.removeCompletedItems = function () {
	this.store.remove({completed: true}, this._filter.bind(this));
}

/**
 * Update an Item in storage based on the state of completed.
 *
 * @param {!number} id ID of the target Item
 * @param {!boolean} completed Desired completed state
 */
Controller.prototype.toggleCompleted = function (id, completed) {
  var self = this;
	this.store.update({id, completed}, function () {
		self.view.setItemComplete(id, completed);
	});
}

/**
 * Set all items to complete or active.
 *
 * @param {boolean} completed Desired completed state
 */
Controller.prototype.toggleAll = function (completed) {
  var self = this;
	this.store.find({completed: !completed}, function (data) {
		for (let {id} of data) {
			self.toggleCompleted(id, completed);
		}
	});

	this._filter();
}

/**
 * Refresh the list based on the current route.
 *
 * @param {boolean} [force] Force a re-paint of the list
 */
Controller.prototype._filter = function (force) {
	var route = this._activeRoute;

	if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
		/* jscs:disable disallowQuotedKeysInObjects */
		this.store.find({
			'': emptyItemQuery,
			'active': {completed: false},
			'completed': {completed: true}
		}[route], this.view.showItems.bind(this.view));
		/* jscs:enable disallowQuotedKeysInObjects */
	}

  var self = this;
	this.store.count(function (total, active, completed) {
		self.view.setItemsLeft(active);
		self.view.setClearCompletedButtonVisibility(completed);

		self.view.setCompleteAllCheckbox(completed === total);
		self.view.setMainVisibility(total);
	});

	this._lastActiveRoute = route;
}

module.exports = Controller;

},{"./item":4,"./store":5,"./view":7}],3:[function(require,module,exports){
/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
function qs (selector, scope) {
	return (scope || document).querySelector(selector);
}

/**
 * addEventListener wrapper
 *
 * @param {Element|Window} target Target Element
 * @param {string} type Event name to bind to
 * @param {Function} callback Event callback
 * @param {boolean} [capture] Capture the event
 */
function $on (target, type, callback, capture) {
	target.addEventListener(type, callback, !!capture);
}

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
function $delegate (target, selector, type, handler, capture) {
	var dispatchEvent = function(event) {
		var targetElement = event.target;
		var potentialElements = target.querySelectorAll(selector);
		let i = potentialElements.length;

		while (i--) {
			if (potentialElements[i] === targetElement) {
				handler.call(targetElement, event);
				break;
			}
		}
	};

	$on(target, type, dispatchEvent, !!capture);
}

/**
 * Encode less-than and ampersand characters with entity codes to make user-
 * provided text safe to parse as HTML.
 *
 * @param {string} s String to escape
 *
 * @returns {string} String with unsafe characters escaped with entity codes
 */
function escapeForHTML (s) {
  return s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');
};

module.exports = {
  qs: qs,
  $on: $on,
  $delegate: $delegate,
  escapeForHTML: escapeForHTML
}

},{}],4:[function(require,module,exports){
/**
 * @typedef {!{id: number, completed: boolean, title: string}}
 */
var Item;

/**
 * @typedef {!Array<Item>}
 */
var ItemList;

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
var EmptyItemQuery;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {EmptyItemQuery}
 */
var emptyItemQuery = Empty.Record;

/**
 * @typedef {!({id: number}|{completed: boolean}|EmptyItemQuery)}
 */
var ItemQuery;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})}
 */
var ItemUpdate;


module.exports = {
  Item: Item,
  ItemList: ItemList,
  EmptyItemQuery: EmptyItemQuery,
  emptyItemQuery: emptyItemQuery,
  ItemQuery: ItemQuery,
  ItemUpdate: ItemUpdate
};

},{}],5:[function(require,module,exports){
var item = require('./item');
var Item = item.Item;
var ItemList = item.ItemList;
var ItemQuery = item.ItemQuery;
var ItemUpdate = item.ItemUpdate;
var emptyItemQuery = item.emptyItemQuery;

/**
 * @param {!string} name Database name
 * @param {function()} [callback] Called when the Store is ready
 */
function Store(name, callback) {
	/**
	 * @type {Storage}
	 */
	var localStorage = window.localStorage;

	/**
	 * @type {ItemList}
	 */
	var liveTodos;

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
		localStorage.setItem(name, JSON.stringify(liveTodos = todos));
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
 * db.find({completed: true}, function(data) {
 *	 // data shall contain items whose completed properties are true
 * })
 */
Store.prototype.find = function (query, callback) {
	var todos = this.getLocalStorage();
	let k;

	callback(todos.filter(function(todo) {
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
Store.prototype.update = function(update, callback) {
	var id = update.id;
	var todos = this.getLocalStorage();
	let i = todos.length;
	let k;

	while (i--) {
		if (todos[i].id === id) {
			for (k in update) {
				todos[i][k] = update[k];
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
Store.prototype.insert = function(item, callback) {
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
Store.prototype.remove = function(query, callback) {
	let k;

	var todos = this.getLocalStorage().filter(function(todo) {
		for (k in query) {
			if (query[k] !== todo[k]) {
				return true;
			}
		}
		return false;
	});

	this.setLocalStorage(todos);

	if (callback) {
		callback(todos);
	}
}

/**
 * Count total, active, and completed todos.
 *
 * @param {function(number, number, number)} callback Called when the count is completed
 */
Store.prototype.count = function(callback) {
	this.find(emptyItemQuery, function(data) {
		var total = data.length;

		let i = total;
		let completed = 0;

		while (i--) {
			completed += data[i].completed;
		}
		callback(total, total - completed, completed);
	});
}

module.exports = Store;

},{"./item":4}],6:[function(require,module,exports){
var item = require('./item');
var ItemList = item.ItemList;

var helpers = require('./helpers');
var escapeForHTML = helpers.escapeForHTML;

function Template () {};
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
 Template.prototype.itemList = function (items) {
   return items.reduce(function (a, item) {
     return a + ('\n<li data-id="\' + item.id}"'
       + (item.completed ? ' class="completed"' : '') + '>\n  <input class="toggle" type="checkbox" '
       + (item.completed ? 'checked' : '') + '>\n  <label>'
       + escapeForHTML(item.title) + '</label>\n  <button class="destroy"></button>\n  </li>');
   }, '');
 };

/**
 * Format the contents of an "items left" indicator.
 *
 * @param {number} activeTodos Number of active todos
 *
 * @returns {!string} Contents for an "items left" indicator
 */
Template.prototype.itemCounter = function (activeTodos) {
	return activeTodos + ' item' + (activeTodos !== 1 ? 's' : '') + ' left';
};

module.exports = Template;

},{"./helpers":3,"./item":4}],7:[function(require,module,exports){
var item = require('./item');
var ItemList = item.ItemList;
var helpers = require('./helpers');
var qs = helpers.qs;
var $on = helpers.$on;
var $delegate = helpers.$delegate;
var Template = require('./template');

function _itemId (element) {
  return parseInt(element.parentNode.dataset.id, 10);
}
var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

/**
 * @param {!Template} template A Template instance
 */

function View (template) {
	this.template = template;
	this.$todoList = qs('.todo-list');
	this.$todoItemCounter = qs('.todo-count');
	this.$clearCompleted = qs('.clear-completed');
	this.$main = qs('.main');
	this.$toggleAll = qs('.toggle-all');
	this.$newTodo = qs('.new-todo');
  var self = this;
	$delegate(this.$todoList, 'li label', 'dblclick', function(event) {
    var target = event.target;
		self.editItem(target);
	});
}


/**
 * Put an item into edit mode.
 *
 * @param {!Element} target Target Item's label Element
 */
View.prototype.editItem = function (target) {
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
View.prototype.showItems = function (items) {
	this.$todoList.innerHTML = this.template.itemList(items);
}

/**
 * Remove an item from the view.
 *
 * @param {number} id Item ID of the item to remove
 */
View.prototype.removeItem = function (id) {
	var elem = qs(`[data-id="${id}"]`);

	if (elem) {
		this.$todoList.removeChild(elem);
	}
}

/**
 * Set the number in the 'items left' display.
 *
 * @param {number} itemsLeft Number of items left
 */
View.prototype.setItemsLeft = function (itemsLeft) {
	this.$todoItemCounter.innerHTML = this.template.itemCounter(itemsLeft);
}

/**
 * Set the visibility of the "Clear completed" button.
 *
 * @param {boolean|number} visible Desired visibility of the button
 */
View.prototype.setClearCompletedButtonVisibility = function (visible) {
	this.$clearCompleted.style.display = !!visible ? 'block' : 'none';
}

/**
 * Set the visibility of the main content and footer.
 *
 * @param {boolean|number} visible Desired visibility
 */
View.prototype.setMainVisibility = function (visible) {
	this.$main.style.display = !!visible ? 'block' : 'none';
}

/**
 * Set the checked state of the Complete All checkbox.
 *
 * @param {boolean|number} checked The desired checked state
 */
View.prototype.setCompleteAllCheckbox = function (checked) {
	this.$toggleAll.checked = !!checked;
}

/**
 * Change the appearance of the filter buttons based on the route.
 *
 * @param {string} route The current route
 */
View.prototype.updateFilterButtons = function (route) {
	qs('.filters>.selected').className = '';
	qs(`.filters>[href="#/${route}"]`).className = 'selected';
}

/**
 * Clear the new todo input
 */
View.prototype.clearNewTodo = function() {
	this.$newTodo.value = '';
}

/**
 * Render an item as either completed or not.
 *
 * @param {!number} id Item ID
 * @param {!boolean} completed True if the item is completed
 */
View.prototype.setItemComplete = function(id, completed) {
	var listItem = qs(`[data-id="${id}"]`);

	if (!listItem) {
		return;
	}

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
View.prototype.editItemDone = function (id, title) {
	var listItem = qs(`[data-id="${id}"]`);

	var input = qs('input.edit', listItem);
	listItem.removeChild(input);

	listItem.classList.remove('editing');

	qs('label', listItem).textContent = title;
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindAddItem = function (handler) {
	$on(this.$newTodo, 'change', function(event) {
    var target = event.target;
		var title = target.value.trim();
		if (title) {
			handler(title);
		}
	});
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindRemoveCompleted = function(handler) {
	$on(this.$clearCompleted, 'click', handler);
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindToggleAll = function(handler) {
	$on(this.$toggleAll, 'click', function(event) {
    var target = event.target;
		handler(target.checked);
	});
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindRemoveItem = function(handler) {
	$delegate(this.$todoList, '.destroy', 'click', function(event) {
    var target = event.target;
		handler(_itemId(target));
	});
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindToggleItem = function(handler) {
	$delegate(this.$todoList, '.toggle', 'click', function(event) {
    var target = event.target;
		handler(_itemId(target), target.checked);
	});
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindEditItemSave = function(handler) {
	$delegate(this.$todoList, 'li .edit', 'blur', function(event) {
    var target = event.target;
		if (!target.dataset.iscanceled) {
			handler(_itemId(target), target.value.trim());
		}
	}, true);

	// Remove the cursor from the input when you hit enter just like if it were a real form
	$delegate(this.$todoList, 'li .edit', 'keypress', function(event) {
    var target = event.target;
    var keyCode = event.keyCode;
		if (keyCode === ENTER_KEY) {
			target.blur();
		}
	});
}

/**
 * @param {Function} handler Function called on synthetic event.
 */
View.prototype.bindEditItemCancel = function(handler) {
	$delegate(this.$todoList, 'li .edit', 'keyup', function(event) {
    var target = event.target;
    var keyCode = event.keyCode;
		if (keyCode === ESCAPE_KEY) {
			target.dataset.iscanceled = true;
			target.blur();

			handler(_itemId(target));
		}
	});
}

module.exports = View;

},{"./helpers":3,"./item":4,"./template":6}]},{},[1,2,3,4,5,6,7]);
