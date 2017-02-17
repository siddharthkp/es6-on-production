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
