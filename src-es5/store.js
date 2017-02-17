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
