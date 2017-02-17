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
