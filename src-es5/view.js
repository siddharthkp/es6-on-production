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
