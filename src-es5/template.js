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
