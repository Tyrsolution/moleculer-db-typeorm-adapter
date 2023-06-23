/*
 * moleculer-db
 * Copyright (c) 2019 MoleculerJS (https://github.com/moleculerjs/moleculer-db)
 * MIT Licensed
 */

'use strict';

import { capitalize, defaultsDeep } from 'lodash';
import { resolve } from 'bluebird';
import { Context } from 'moleculer';
// const pkg = require('../package.json');

/**
 * Service mixin to access database entities
 *
 * @name moleculer-db-typerom-adapter
 * @module Service
 */
// module.exports = function (mixinOptions?: any) {
export const TAdapterServiceSchemaMixin = (mixinOptions?: any) => {
	const mixin = defaultsDeep(
		{
			/**
			 * Actions
			 */
			actions: {
				/**
				 * Find entities by query.
				 *
				 * @actions
				 * @cached
				 *
				 * @param {String|Array<String>} populate - Populated fields.
				 * @param {String|Array<String>} fields - Fields filter.
				 * @param {String|Array<String>} excludeFields - List of excluded fields.
				 * @param {Number?} limit - Max count of rows.
				 * @param {Number?} offset - Count of skipped rows.
				 * @param {String?} sort - Sorted fields.
				 * @param {String?} search - Search text.
				 * @param {String|Array<String>} searchFields - Fields for searching.
				 * @param {Object?} query - Query object. Passes to adapter.
				 *
				 * @returns {Array<Object>} List of found entities.
				 */
				find: {
					cache: {
						keys: [
							'populate',
							'fields',
							'excludeFields',
							'limit',
							'offset',
							'sort',
							'search',
							'searchFields',
							'query',
						],
					},
					params: {
						populate: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						fields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						excludeFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						take: {
							type: 'number',
							integer: true,
							min: 0,
							optional: true,
							convert: true,
						},
						skip: {
							type: 'number',
							integer: true,
							min: 0,
							optional: true,
							convert: true,
						},
						sort: { type: 'string', optional: true },
						search: { type: 'string', optional: true },
						searchFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						query: [
							{ type: 'object', optional: true },
							{ type: 'string', optional: true },
						],
					},
					handler(ctx: Context): any {
						// @ts-ignore
						let params = this.adapter.sanitizeParams(ctx, ctx.params);
						// @ts-ignore
						return this.adapter.find(ctx, params);
					},
				},

				/**
				 * Get count of entities by query.
				 *
				 * @actions
				 * @cached
				 *
				 * @param {String?} search - Search text.
				 * @param {String|Array<String>} searchFields - Fields list for searching.
				 * @param {Object?} query - Query object. Passes to adapter.
				 *
				 * @returns {Number} Count of found entities.
				 */
				count: {
					cache: {
						keys: ['search', 'searchFields', 'query'],
					},
					params: {
						search: { type: 'string', optional: true },
						searchFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						query: [
							{ type: 'object', optional: true },
							{ type: 'string', optional: true },
						],
					},
					handler(ctx: Context): any {
						// @ts-ignore
						let params = this.adapter.sanitizeParams(ctx, ctx.params);
						// @ts-ignore
						return this.adapter.count(ctx, params);
					},
				},

				/**
				 * List entities by filters and pagination results.
				 *
				 * @actions
				 * @cached
				 *
				 * @param {String|Array<String>} populate - Populated fields.
				 * @param {String|Array<String>} fields - Fields filter.
				 * @param {String|Array<String>} excludeFields - List of excluded fields.
				 * @param {Number?} page - Page number.
				 * @param {Number?} pageSize - Size of a page.
				 * @param {String?} sort - Sorted fields.
				 * @param {String?} search - Search text.
				 * @param {String|Array<String>} searchFields - Fields for searching.
				 * @param {Object?} query - Query object. Passes to adapter.
				 *
				 * @returns {Object} List of found entities and count with pagination info.
				 */
				list: {
					cache: {
						keys: [
							'populate',
							'fields',
							'excludeFields',
							'page',
							'pageSize',
							'sort',
							'search',
							'searchFields',
							'query',
						],
					},
					rest: 'GET /',
					params: {
						populate: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						fields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						excludeFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						page: {
							type: 'number',
							integer: true,
							min: 1,
							optional: true,
							convert: true,
						},
						pageSize: {
							type: 'number',
							integer: true,
							min: 0,
							optional: true,
							convert: true,
						},
						sort: { type: 'string', optional: true },
						search: { type: 'string', optional: true },
						searchFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						query: [
							{ type: 'object', optional: true },
							{ type: 'string', optional: true },
						],
					},
					handler(ctx: Context): any {
						// @ts-ignore
						let params = this.adapter.sanitizeParams(ctx, ctx.params);
						// @ts-ignore
						return this.adapter.list(ctx, params);
					},
				},

				/**
				 * Create a new entity.
				 *
				 * @actions
				 *
				 * @param {Object} params - Entity to save.
				 *
				 * @returns {Object} Saved entity.
				 */
				create: {
					rest: 'POST /',
					handler(ctx: Context): any {
						// @ts-ignore
						return this.adapter.create(ctx, ctx.params);
					},
				},

				/**
				 * Create many new entities.
				 *
				 * @actions
				 *
				 * @param {Object?} entity - Entity to save.
				 * @param {Array<Object>?} entities - Entities to save.
				 *
				 * @returns {Object|Array<Object>} Saved entity(ies).
				 */
				insert: {
					params: {
						entity: { type: 'object', optional: true },
						entities: { type: 'array', optional: true },
					},
					handler(ctx: Context): any {
						// @ts-ignore
						return this.adapter.insert(ctx, ctx.params);
					},
				},

				/**
				 * Get entity by ID.
				 *
				 * @actions
				 * @cached
				 *
				 * @param {any|Array<any>} id - ID(s) of entity.
				 * @param {String|Array<String>} populate - Field list for populate.
				 * @param {String|Array<String>} fields - Fields filter.
				 * @param {String|Array<String>} excludeFields - List of excluded fields.
				 * @param {Boolean?} mapping - Convert the returned `Array` to `Object` where the key is the value of `id`.
				 *
				 * @returns {Object|Array<Object>} Found entity(ies).
				 *
				 * @throws {EntityNotFoundError} - 404 Entity not found
				 */
				get: {
					cache: {
						keys: ['id', 'populate', 'fields', 'excludeFields', 'mapping'],
					},
					rest: 'GET /:id',
					params: {
						id: [{ type: 'string' }, { type: 'number' }, { type: 'array' }],
						populate: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						fields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						excludeFields: [
							{ type: 'string', optional: true },
							{ type: 'array', optional: true, items: 'string' },
						],
						mapping: { type: 'boolean', optional: true },
					},
					handler(ctx: Context): any {
						// @ts-ignore
						let params = this.adapter.sanitizeParams(ctx, ctx.params);
						// @ts-ignore
						return this.adapter.findByIdWO(null, params);
					},
				},

				/**
				 * Update an entity by ID.
				 * > After update, clear the cache & call lifecycle events.
				 *
				 * @actions
				 *
				 * @param {any} id - ID of entity.
				 * @returns {Object} Updated entity.
				 *
				 * @throws {EntityNotFoundError} - 404 Entity not found
				 */
				update: {
					rest: 'PUT /:id',
					params: {
						id: { type: 'any' },
					},
					handler(ctx: Context): any {
						// @ts-ignore
						return this.adapter.update(ctx, ctx.params);
					},
				},

				/**
				 * Remove an entity by ID.
				 *
				 * @actions
				 *
				 * @param {any} id - ID of entity.
				 * @returns {Number} Count of removed entities.
				 *
				 * @throws {EntityNotFoundError} - 404 Entity not found
				 */
				remove: {
					rest: 'DELETE /:id',
					params: {
						id: { type: 'any' },
						options: { type: 'object', optional: true },
					},
					handler(ctx: Context): any {
						// @ts-ignore
						return this.adapter.remove(ctx.params);
					},
				},
			},

			/**
			 * Methods
			 */
			methods: {
				/**
				 * Get entity(ies) by ID(s).
				 *
				 * @methods
				 * @param {Context} ctx - Context of request.
				 * @param {any|Array<any>} id - ID or IDs.
				 * @param {Boolean?} decoding - Need to decode IDs.
				 * @returns {Object|Array<Object>} Found entity(ies).
				 */
				getById(ctx: Context, id: string | any[], decoding: boolean): any {
					return resolve().then(() => {
						// @ts-ignore
						return this.adapter.findById(
							ctx,
							null,
							// @ts-ignore
							decoding ? this.adapter.decodeID(id) : id,
						);
					});
				},

				/**
				 * Call before entity lifecycle events
				 *
				 * @methods
				 * @param {String} type
				 * @param {Object} entity
				 * @param {Context} ctx
				 * @returns {Promise}
				 */
				beforeEntityChange(type: string | undefined, entity: any, ctx: any): any {
					const eventName = `beforeEntity${capitalize(type)}`;
					// @ts-ignore
					if (this.schema[eventName] == null) {
						return resolve(entity);
					}
					// @ts-ignore
					return resolve(this.schema[eventName].call(this, entity, ctx));
				},

				/**
				 * Clear the cache & call entity lifecycle events
				 *
				 * @methods
				 * @param {String} type
				 * @param {Object|Array<Object>|Number} json
				 * @param {Context} ctx
				 * @returns {Promise}
				 */
				entityChanged(type: string | undefined, json: any, ctx: any): any {
					// @ts-ignore
					return this.adapter.entityChanged(type, json, ctx);
				},

				/**
				 * Clear cached entities
				 *
				 * @methods
				 * @returns {Promise}
				 */
				clearCache(): any {
					// @ts-ignore
					this.broker[this.settings.cacheCleanEventType](`cache.clean.${this.fullName}`);
					// @ts-ignore
					if (this.broker.cacher) return this.broker.cacher.clean(`${this.fullName}.**`);
					return resolve();
				},

				/**
				 * Transform the fetched documents
				 * @methods
				 * @param {Context} ctx
				 * @param {Object} 	params
				 * @param {Array|Object} docs
				 * @returns {Array|Object}
				 */
				transformDocuments(ctx: Context, params: {}, docs: any): any {
					// @ts-ignore
					return this.adapter.transformDocuments(ctx, params, docs);
				},

				/**
				 * Filter fields in the entity object
				 *
				 * @param {Object} 	doc
				 * @param {Array<String>} 	fields	Filter properties of model.
				 * @returns	{Object}
				 */
				filterFields(doc: any, fields: any): any {
					// @ts-ignore
					return this.adapter.filterFields(doc, fields);
				},

				/**
				 * Exclude fields in the entity object
				 *
				 * @param {Object} 	doc
				 * @param {Array<String>} 	fields	Exclude properties of model.
				 * @returns	{Object}
				 */
				excludeFields(doc: any, fields: string | any[]): any {
					// @ts-ignore
					return this.adapter.excludeFields(doc, fields);
				},

				/**
				 * Authorize the required field list. Remove fields which is not exist in the `this.settings.fields`
				 *
				 * @param {Array} askedFields
				 * @returns {Array}
				 */
				authorizeFields(askedFields: any): any {
					// @ts-ignore
					return this.adapter.authorizeFields(askedFields);
				},

				/**
				 * Populate documents.
				 *
				 * @param {Context} 		ctx
				 * @param {Array|Object} 	docs
				 * @param {Array?}			populateFields
				 * @returns	{Promise}
				 */
				populateDocs(ctx: Context, docs: any, populateFields: any) {
					// @ts-ignore
					return this.adapter.populateDocs(ctx, docs, populateFields);
				},

				/**
				 * Validate an entity by validator.
				 * @methods
				 * @param {Object} entity
				 * @returns {Promise}
				 */
				validateEntity(entity: any) {
					// @ts-ignore
					return this.adapter.validateEntity(entity);
				},

				/**
				 * Encode ID of entity.
				 *
				 * @methods
				 * @param {any} id
				 * @returns {any}
				 */
				encodeID(id: any): any {
					// @ts-ignore
					return this.adapter.encodeID(id);
				},

				/**
				 * Decode ID of entity.
				 *
				 * @methods
				 * @param {any} id
				 * @returns {any}
				 */
				decodeID(id: any): any {
					// @ts-ignore
					return this.adapter.decodeID(id);
				},
			},
		},
		mixinOptions,
	);

	return mixin;
};
