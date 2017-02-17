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
		this.store.update(item, function () {
      var id = item.id;
      var title = item.title;
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
	this.store.find(item, function(data) {
    var id = item.id;
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
	this.store.remove(item, function () {
    var id = item.id;
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
	this.store.update(item, function () {
    var id = item.id;
    var completed = item.completed;
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
    for (var i = 0; i < data.length; i++) {
      var id = data[i].id;
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
