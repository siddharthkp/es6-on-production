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
