(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Controller = require('./controller');
const {$on} = require('./helpers');
const Template = require('./template');
const Store = require('./store');
const View = require('./view');

const store = new Store('todos-vanilla-es6');

const template = new Template();
const view = new View(template);

/**
 * @type {Controller}
 */
const controller = new Controller(store, view);

const setView = () => controller.setView(document.location.hash);
$on(window, 'load', setView);
$on(window, 'hashchange', setView);

},{"./controller":2,"./helpers":3,"./store":5,"./template":6,"./view":7}],2:[function(require,module,exports){
const {emptyItemQuery} = require('./item');
const Store = require('./store');
const View = require('./view');

module.exports = class Controller {
	/**
	 * @param  {!Store} store A Store instance
	 * @param  {!View} view A View instance
	 */
	constructor(store, view) {
		this.store = store;
		this.view = view;

		view.bindAddItem(this.addItem.bind(this));
		view.bindEditItemSave(this.editItemSave.bind(this));
		view.bindEditItemCancel(this.editItemCancel.bind(this));
		view.bindRemoveItem(this.removeItem.bind(this));
		view.bindToggleItem((id, completed) => {
			this.toggleCompleted(id, completed);
			this._filter();
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
	setView(raw) {
		const route = raw.replace(/^#\//, '');
		this._activeRoute = route;
		this._filter();
		this.view.updateFilterButtons(route);
	}

	/**
	 * Add an Item to the Store and display it in the list.
	 *
	 * @param {!string} title Title of the new item
	 */
	addItem(title) {
		this.store.insert({
			id: Date.now(),
			title,
			completed: false
		}, () => {
			this.view.clearNewTodo();
			this._filter(true);
		});
	}

	/**
	 * Save an Item in edit.
	 *
	 * @param {number} id ID of the Item in edit
	 * @param {!string} title New title for the Item in edit
	 */
	editItemSave(id, title) {
		if (title.length) {
			this.store.update({id, title}, () => {
				this.view.editItemDone(id, title);
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
	editItemCancel(id) {
		this.store.find({id}, data => {
			const title = data[0].title;
			this.view.editItemDone(id, title);
		});
	}

	/**
	 * Remove the data and elements related to an Item.
	 *
	 * @param {!number} id Item ID of item to remove
	 */
	removeItem(id) {
		this.store.remove({id}, () => {
			this._filter();
			this.view.removeItem(id);
		});
	}

	/**
	 * Remove all completed items.
	 */
	removeCompletedItems() {
		this.store.remove({completed: true}, this._filter.bind(this));
	}

	/**
	 * Update an Item in storage based on the state of completed.
	 *
	 * @param {!number} id ID of the target Item
	 * @param {!boolean} completed Desired completed state
	 */
	toggleCompleted(id, completed) {
		this.store.update({id, completed}, () => {
			this.view.setItemComplete(id, completed);
		});
	}

	/**
	 * Set all items to complete or active.
	 *
	 * @param {boolean} completed Desired completed state
	 */
	toggleAll(completed) {
		this.store.find({completed: !completed}, data => {
			for (let {id} of data) {
				this.toggleCompleted(id, completed);
			}
		});

		this._filter();
	}

	/**
	 * Refresh the list based on the current route.
	 *
	 * @param {boolean} [force] Force a re-paint of the list
	 */
	_filter(force) {
		const route = this._activeRoute;

		if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
			/* jscs:disable disallowQuotedKeysInObjects */
			this.store.find({
				'': emptyItemQuery,
				'active': {completed: false},
				'completed': {completed: true}
			}[route], this.view.showItems.bind(this.view));
			/* jscs:enable disallowQuotedKeysInObjects */
		}

		this.store.count((total, active, completed) => {
			this.view.setItemsLeft(active);
			this.view.setClearCompletedButtonVisibility(completed);

			this.view.setCompleteAllCheckbox(completed === total);
			this.view.setMainVisibility(total);
		});

		this._lastActiveRoute = route;
	}
}

},{"./item":4,"./store":5,"./view":7}],3:[function(require,module,exports){
/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
const qs = (selector, scope) => {
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
const $on = (target, type, callback, capture) => {
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
const $delegate = (target, selector, type, handler, capture) => {
	const dispatchEvent = event => {
		const targetElement = event.target;
		const potentialElements = target.querySelectorAll(selector);
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
const escapeForHTML = s => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

module.exports = {
  qs,
  $on,
  $delegate,
  escapeForHTML
}

},{}],4:[function(require,module,exports){
/**
 * @typedef {!{id: number, completed: boolean, title: string}}
 */
let Item;

/**
 * @typedef {!Array<Item>}
 */
let ItemList;

/**
 * Enum containing a known-empty record type, matching only empty records unlike Object.
 *
 * @enum {Object}
 */
const Empty = {
	Record: {}
};

/**
 * Empty ItemQuery type, based on the Empty @enum.
 *
 * @typedef {Empty}
 */
let EmptyItemQuery;

/**
 * Reference to the only EmptyItemQuery instance.
 *
 * @type {EmptyItemQuery}
 */
let emptyItemQuery = Empty.Record;

/**
 * @typedef {!({id: number}|{completed: boolean}|EmptyItemQuery)}
 */
let ItemQuery;

/**
 * @typedef {!({id: number, title: string}|{id: number, completed: boolean})}
 */
let ItemUpdate;


module.exports = {
  Item,
  ItemList,
  EmptyItemQuery,
  emptyItemQuery,
  ItemQuery,
  ItemUpdate
};

},{}],5:[function(require,module,exports){
const {Item, ItemList, ItemQuery, ItemUpdate, emptyItemQuery} = require('./item');

module.exports = class Store {
	/**
	 * @param {!string} name Database name
	 * @param {function()} [callback] Called when the Store is ready
	 */
	constructor(name, callback) {
		/**
		 * @type {Storage}
		 */
		const localStorage = window.localStorage;

		/**
		 * @type {ItemList}
		 */
		let liveTodos;

		/**
		 * Read the local ItemList from localStorage.
		 *
		 * @returns {ItemList} Current array of todos
		 */
		this.getLocalStorage = () => {
			return liveTodos || JSON.parse(localStorage.getItem(name) || '[]');
		};

		/**
		 * Write the local ItemList to localStorage.
		 *
		 * @param {ItemList} todos Array of todos to write
		 */
		this.setLocalStorage = todos => localStorage.setItem(name, JSON.stringify(liveTodos = todos));

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
	find(query, callback) {
		const todos = this.getLocalStorage();
		let k;

		callback(todos.filter(todo => {
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
	update(update, callback) {
		const id = update.id;
		const todos = this.getLocalStorage();
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
	insert(item, callback) {
		const todos = this.getLocalStorage();
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
	remove(query, callback) {
		let k;

		const todos = this.getLocalStorage().filter(todo => {
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
	count(callback) {
		this.find(emptyItemQuery, data => {
			const total = data.length;

			let i = total;
			let completed = 0;

			while (i--) completed += data[i].completed;
			callback(total, total - completed, completed);
		});
	}
}

},{"./item":4}],6:[function(require,module,exports){
const {ItemList} = require('./item');

const {escapeForHTML} = require('./helpers');

module.exports = class Template {
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
	itemList(items) {
		return items.reduce((a, item) => a + `
<li data-id="${item.id}"${item.completed ? ' class="completed"' : ''}>
	<input class="toggle" type="checkbox" ${item.completed ? 'checked' : ''}>
	<label>${escapeForHTML(item.title)}</label>
	<button class="destroy"></button>
</li>`, '');
	}

	/**
	 * Format the contents of an "items left" indicator.
	 *
	 * @param {number} activeTodos Number of active todos
	 *
	 * @returns {!string} Contents for an "items left" indicator
	 */
	itemCounter(activeTodos) {
		return `${activeTodos} item${activeTodos !== 1 ? 's' : ''} left`;
	}
}

},{"./helpers":3,"./item":4}],7:[function(require,module,exports){
const {ItemList} = require('./item');
const {qs, $on, $delegate} = require('./helpers');
const Template = require('./template');

const _itemId = element => parseInt(element.parentNode.dataset.id, 10);
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

module.exports = class View {
	/**
	 * @param {!Template} template A Template instance
	 */
	constructor(template) {
		this.template = template;
		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
		$delegate(this.$todoList, 'li label', 'dblclick', ({target}) => {
			this.editItem(target);
		});
	}


	/**
	 * Put an item into edit mode.
	 *
	 * @param {!Element} target Target Item's label Element
	 */
	editItem(target) {
		const listItem = target.parentElement;

		listItem.classList.add('editing');

		const input = document.createElement('input');
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
	showItems(items) {
		this.$todoList.innerHTML = this.template.itemList(items);
	}

	/**
	 * Remove an item from the view.
	 *
	 * @param {number} id Item ID of the item to remove
	 */
	removeItem(id) {
		const elem = qs(`[data-id="${id}"]`);

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	}

	/**
	 * Set the number in the 'items left' display.
	 *
	 * @param {number} itemsLeft Number of items left
	 */
	setItemsLeft(itemsLeft) {
		this.$todoItemCounter.innerHTML = this.template.itemCounter(itemsLeft);
	}

	/**
	 * Set the visibility of the "Clear completed" button.
	 *
	 * @param {boolean|number} visible Desired visibility of the button
	 */
	setClearCompletedButtonVisibility(visible) {
		this.$clearCompleted.style.display = !!visible ? 'block' : 'none';
	}

	/**
	 * Set the visibility of the main content and footer.
	 *
	 * @param {boolean|number} visible Desired visibility
	 */
	setMainVisibility(visible) {
		this.$main.style.display = !!visible ? 'block' : 'none';
	}

	/**
	 * Set the checked state of the Complete All checkbox.
	 *
	 * @param {boolean|number} checked The desired checked state
	 */
	setCompleteAllCheckbox(checked) {
		this.$toggleAll.checked = !!checked;
	}

	/**
	 * Change the appearance of the filter buttons based on the route.
	 *
	 * @param {string} route The current route
	 */
	updateFilterButtons(route) {
		qs('.filters>.selected').className = '';
		qs(`.filters>[href="#/${route}"]`).className = 'selected';
	}

	/**
	 * Clear the new todo input
	 */
	clearNewTodo() {
		this.$newTodo.value = '';
	}

	/**
	 * Render an item as either completed or not.
	 *
	 * @param {!number} id Item ID
	 * @param {!boolean} completed True if the item is completed
	 */
	setItemComplete(id, completed) {
		const listItem = qs(`[data-id="${id}"]`);

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
	editItemDone(id, title) {
		const listItem = qs(`[data-id="${id}"]`);

		const input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.classList.remove('editing');

		qs('label', listItem).textContent = title;
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindAddItem(handler) {
		$on(this.$newTodo, 'change', ({target}) => {
			const title = target.value.trim();
			if (title) handler(title);
		});
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindRemoveCompleted(handler) {
		$on(this.$clearCompleted, 'click', handler);
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindToggleAll(handler) {
		$on(this.$toggleAll, 'click', ({target}) => handler(target.checked));
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindRemoveItem(handler) {
		$delegate(this.$todoList, '.destroy', 'click', ({target}) => handler(_itemId(target)));
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindToggleItem(handler) {
		$delegate(this.$todoList, '.toggle', 'click', ({target}) => {
			handler(_itemId(target), target.checked);
		});
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindEditItemSave(handler) {
		$delegate(this.$todoList, 'li .edit', 'blur', ({target}) => {
			if (!target.dataset.iscanceled) handler(_itemId(target), target.value.trim());
		}, true);

		// Remove the cursor from the input when you hit enter just like if it were a real form
		$delegate(this.$todoList, 'li .edit', 'keypress', ({target, keyCode}) => {
			if (keyCode === ENTER_KEY) target.blur();
		});
	}

	/**
	 * @param {Function} handler Function called on synthetic event.
	 */
	bindEditItemCancel(handler) {
		$delegate(this.$todoList, 'li .edit', 'keyup', ({target, keyCode}) => {
			if (keyCode === ESCAPE_KEY) {
				target.dataset.iscanceled = true;
				target.blur();

				handler(_itemId(target));
			}
		});
	}
}

},{"./helpers":3,"./item":4,"./template":6}]},{},[1,2,3,4,5,6,7]);
