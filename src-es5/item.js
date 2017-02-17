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
