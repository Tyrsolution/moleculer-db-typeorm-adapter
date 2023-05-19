/*
 * moleculer-db-typeorm-adapter
 * Copyright (c) 2023 TyrSolutions (https://github.com/Tyrsolution/moleculer-db-typeorm-adapter)
 * MIT Licensed
 */

'use strict';
import 'reflect-metadata';
import {
	capitalize,
	cloneDeep,
	compact,
	find,
	flattenDeep,
	get,
	has,
	isArray,
	isFunction,
	isObject,
	isString,
	isUndefined,
	replace,
	set,
	uniq,
	unset,
} from 'lodash';
import { all, method, resolve } from 'bluebird';
import { Service, ServiceBroker, Errors } from 'moleculer';
import {
	DataSource,
	DataSourceOptions,
	EntityManager,
	EntitySchema,
	ObjectLiteral,
	Repository,
	FindOneOptions,
	In,
	MongoEntityManager,
} from 'typeorm';
import ConnectionManager from './connectionManager';
import { ListParams } from '../types/typeormadapter';
// const type = require('typeof-items');

/**
 * Moleculer TypeORM Adapter
 *
 * @name moleculer-db-typeORM-adapter
 * @module Service
 * @class TypeOrmDbAdapter
 */
/**
 * Settings for TypeORM adapter
 *
 * @module Settings
 * @param {DataSourceOptions} opts - TypeORM connection options
 *
 * @example
 * ```js
 * {
 * 	  name: 'greeter',
 *    type: 'better-sqlite3',
 *    database: 'temp/test.db',
 *    synchronize: true,
 *    logging: ['query', 'error'],
 *    entities: [TypeProduct]
 * }
 * ```
 */
export default class TypeORMDbAdapter<Entity extends ObjectLiteral> {
	// Dynamic property key
	[index: string]: any;
	/**
	 * Grants access to the connection manager instance which is used to create and manage connections.
	 * Called using this.adapter.connectionManager
	 *
	 * @static
	 * @property {ConnectionManager} connectionManager
	 *
	 * @properties
	 */
	connectionManager: ConnectionManager | undefined;
	private _entity: EntitySchema<Entity> | Array<EntitySchema<Entity>> | undefined;
	/**
	 * Grants access to the entity manager of the connection.
	 * Called using this.adapter.manager
	 * @static
	 * @property {EntityManager} manager
	 *
	 * @properties
	 */
	manager: EntityManager | MongoEntityManager | undefined;
	/**
	 * Grants access to the entity repository of the connection.
	 * Called using this.adapter.repository
	 * @static
	 * @property {Repository<Entity>} repository
	 *
	 * @properties
	 */
	repository: Repository<Entity> | undefined;

	/**
	 * Creates an instance of TypeORM db service.
	 *
	 * @param {DataSourceOptions} opts
	 *
	 */
	constructor(opts?: DataSourceOptions) {
		this.opts = opts;
	}

	/**
	 * Initialize adapter.
	 * It will be called in `broker.start()` and is used internally.
	 * @methods
	 * @param {ServiceBroker} broker
	 * @param {Service} service
	 * @memberof TypeORMDbAdapter
	 */
	init(broker: ServiceBroker, service: Service) {
		this.broker = broker;
		this.service = service;
		const entityFromService = this.service.schema.model;
		const entityArray: Array<EntitySchema<Entity>> = [];
		has(this.opts, 'entities')
			? (this._entity = [...this.opts.entities])
			: isArray(entityFromService)
			? (entityFromService.forEach((entity) => {
					const isValid = !!entity.constructor;
					if (!isValid) {
						new Errors.MoleculerServerError(
							'Invalid model. It should be a typeorm repository',
						);
					}
					entityArray.push(entity);
			  }),
			  (this._entity = entityArray))
			: !isUndefined(entityFromService) && !!entityFromService.constructor
			? (this._entity = entityFromService)
			: new Errors.MoleculerServerError('Invalid model. It should be a typeorm repository');
	}

	/**
	 * Connects to database.
	 * It will be called in `broker.start()` and is used internally.
	 * @methods
	 * @public
	 * @returns {Promise}
	 */
	async connect(): Promise<any> {
		/**
		 * set connection manager on this.adapter
		 */
		this.connectionManager = new ConnectionManager();
		/**
		 * create connection using this.opts & initialize db connection
		 */
		const db: DataSource = await this.connectionManager.create(this.opts);
		this.broker.logger.info(`${this.service.name} has connected to ${db.name} database`);

		/**
		 * array of entities
		 */
		const entityArrray: { [key: string]: any } = isArray(this._entity)
			? (this._entity as unknown as DataSource)
			: [this._entity as unknown as DataSource];

		/**
		 * get entity methods
		 *
		 * @param {Object} obj -- entity object
		 * @returns {Array<string>}
		 */
		const entityMethods = (obj: { [key: string]: any } = {}) => {
			const members = Object.getOwnPropertyNames(obj);
			const methods = members.filter((el) => {
				return typeof obj[el] === 'function';
			});
			return methods;
		};

		/**
		 * add additional entities and methods to adapter
		 * under entity name this.adapter.entityName
		 */
		entityArrray.forEach((entity: any, index: number) => {
			const dbRepository: any = db.manager.getRepository(entity);
			const dbManager: any = db.manager;
			const entityName = dbRepository.metadata.name;
			const methodNames = entityMethods(entity);
			/**
			 * object for entity methods to this.adapter.entityName
			 * getRepository function required for this to work
			 */
			const methodsToAdd: { [key: string]: any } = {
				manager: dbManager,
				repository: dbRepository,
				getRepository: function getRepository() {
					const dataSource = db;
					if (!dataSource) throw new Error(`DataSource is not set for this entity.`);
					return dbManager.getRepository(entity);
				},
			};
			/**
			 * add base entity methods to this.adapter
			 * or add additional methods to methods object
			 */
			methodNames.forEach((method) => {
				index === 0
					? (this[method] = entity[method])
					: (methodsToAdd[method] = entity[method]);
			});
			/**
			 * add entity local methods to this.adapter or methods object
			 */

			[
				/**
				 * Base entity methods
				 */
				'hasId',
				'save',
				'remove',
				'softRemove',
				'recover',
				'reload',
				'useDataSource',
				'getRepository',
				'metadata',
				'target',
				'getId',
				'createQueryBuilder',
				'create',
				'merge',
				'preload',
				'insert',
				'update',
				'upsert',
				'delete',
				'count',
				'countBy',
				'sum',
				'average',
				'minimum',
				'maximum',
				'find',
				'findBy',
				'findAndCount',
				'findAndCountBy',
				'findOne',
				'findOneBy',
				'findOneOrFail',
				'findOneByOrFail',
				'query',
				'clear',
				/**
				 * Mongo Entity methods
				 */
				'createCursor',
				'createEntityCursor',
				'aggregate',
				'aggregateEntity',
				'bulkWrite',
				'createCollectionIndex',
				'createCollectionIndexes',
				'deleteMany',
				'deleteOne',
				'distinct',
				'dropCollectionIndex',
				'dropCollectionIndexes',
				'findOneAndDelete',
				'findOneAndReplace',
				'findOneAndUpdate',
				'collectionIndexes',
				'collectionIndexExists',
				'collectionIndexInformation',
				'initializeOrderedBulkOp',
				'initializeUnorderedBulkOp',
				'insertMany',
				'insertOne',
				'isCapped',
				'listCollectionIndexes',
				'rename',
				'replaceOne',
				'stats',
				'updateMany',
				'updateOne',
			].forEach((method) => {
				/**
				 * add base entity methods to this.adapter if index === 0
				 * or add additional methods to methods object
				 */
				if (dbRepository[method]) {
					index === 0
						? (this[method] = dbRepository[method])
						: (methodsToAdd[method] = dbRepository[method]);
				}
			});
			/**
			 * apply entity methods object to this.adapter.entityName
			 */
			!entity['save']
				? this.broker.logger.warn(
						`Entity class ${entityName} does not extend TypeORM BaseEntity, use data mapping with this.adapter.repository instead of active record methodology.`,
				  )
				: index !== 0
				? (this[entityName] = {
						...methodsToAdd,
						findByIdWO: this.findByIdWO,
						findById: this.findById,
						findByIds: this.findByIds,
						list: this.list,
						encodeID: this.encodeID,
						decodeID: this.decodeID,
						transformDocuments: this.transformDocuments,
						beforeEntityChange: this.beforeEntityChange,
						entityChanged: this.entityChanged,
						clearCache: this.clearCache,
						filterFields: this.filterFields,
						excludeFields: this.excludeFields,
						_excludeFields: this._excludeFields,
						populateDocs: this.populateDocs,
						validateEntity: this.validateEntity,
						entityToObject: this.entityToObject,
						beforeSaveTransformID: this.beforeSaveTransformID,
						beforeQueryTransformID: this.beforeQueryTransformID,
						afterRetrieveTransformID: this.afterRetrieveTransformID,
						authorizeFields: this.authorizeFields,
						updateById: this.updateById,
						broker: this.broker,
						service: this.service,
				  })
				: null;
		});

		/**
		 * set entity manager on this.adapter
		 */
		this.manager = db.manager;

		/**
		 * set repository on this.adapter
		 */
		this.repository = db.manager.getRepository(
			isArray(this._entity) ? this._entity[0] : this._entity!,
		);
		// this.repository = db.getRepository(entityArrray[0]);

		/**
		 * set datasource on this.adapter
		 */
		this.dataSource = db;
	}

	/**
	 * Disconnects all connections from database and connection manager.
	 * It will be called in `broker.stop()` and is used internally.
	 * @methods
	 * @public
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	disconnect(): Promise<any> {
		this.connectionManager!.connections.forEach(async (connection: DataSource) => {
			this.broker.logger.info(`Attempting to disconnect from database ${connection.name}...`);
			await this.connectionManager!.close(connection.name)
				.then((disconnected: any) =>
					disconnected === true
						? this.broker.logger.info(`Disconnected from database ${connection.name}`)
						: this.broker.logger.info(
								`Failed to disconnect from database ${connection.name}`,
						  ),
				)
				.catch((error: any) => {
					this.broker.logger.error(`Failed to disconnect from database ${error}`);
					new Errors.MoleculerServerError(
						`Failed to disconnect from database ${error}`,
						500,
						'FAILED_TO_DISCONNECT_FROM_DATABASE',
						error,
					);
				});
		});
		return resolve();
	}

	// -------------------------------------------------------------------------
	// Public Methods
	// -------------------------------------------------------------------------

	/**
	 * Gets item by id. Can use find options, no where clause.
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @param {Object} findOptions - find options, like relations, order, etc. No where clause
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 */
	async findByIdWO<T extends Entity>(
		key: string | undefined | null = this.service.settings.idField,
		id: string | number,
		findOptions?: FindOneOptions<T>,
	): Promise<T | undefined> {
		const dbID = this.beforeQueryTransformID(key);
		const entity =
			this.opts.type !== 'mongodb'
				? await this['findOneOrFail']({
						where: { [dbID]: In([id]) },
						...findOptions,
				  })
				: await this['findOneOrFail']({
						where: { [dbID]: { $in: [id] } },
						...findOptions,
				  });
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Gets item by id. No find options
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 *
	 */
	async findById<T extends Entity>(
		key: string | undefined | null = this.service.settings.idField,
		id: string | number,
	): Promise<T | undefined> {
		const dbID = this.beforeQueryTransformID(key);
		const entity =
			this.opts.type !== 'mongodb'
				? await this['findOneByOrFail']({ [dbID]: In([id]) })
				: await this['findOneByOrFail']({ [dbID]: In([id]) });
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Gets multiple items by id.
	 * No find options
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 *
	 */
	async findByIds<T extends Entity>(
		key: string | undefined | null = this.service.settings.idField,
		ids: any[],
	): Promise<T | undefined> {
		const dbID = this.beforeQueryTransformID(key);
		const entity = await this['findBy']({ [dbID]: In([...ids]) });
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * List entities from db using filters and pagination results.
	 * @methods
	 * @param {Context} ctx - Context instance.
	 * @param {ListParams<Object>?} params - Optional parameters.
	 *
	 * @returns {Object} List of found entities and count.
	 * @memberof TypeORMDbAdapter
	 */
	list(ctx: any, params: ListParams): object {
		let countParams = Object.assign({}, params);
		// Remove pagination params
		if (countParams && countParams.limit) countParams.limit = undefined;
		if (countParams && countParams.offset) countParams.offset = undefined;
		if (params.limit == null) {
			if (this.service.settings.limit > 0 && params.pageSize! > this.service.settings.limit)
				params.limit = this.service.settings.limit;
			else params.limit = params.pageSize;
		}
		let modifiedFindParams;
		if (params.take && params.skip) {
			if (params.limit) {
				delete params.limit;
			}
			if (params.offset) {
				delete params.offset;
			}
			modifiedFindParams = params;
		} else if (params.limit || params.offset) {
			modifiedFindParams = JSON.parse(
				replace(JSON.stringify(params), '"limit":', '"take":').replace(
					'"offset":',
					'"skip":',
				),
			);
		}
		if (
			has(modifiedFindParams, 'relations') &&
			typeof modifiedFindParams.relations === 'string'
		) {
			modifiedFindParams.relations = JSON.parse(modifiedFindParams.relations);
		}
		if (has(modifiedFindParams, 'where') && typeof modifiedFindParams.where === 'string') {
			modifiedFindParams.where = JSON.parse(modifiedFindParams.where);
		}
		let modifiedCountParams;
		if (countParams.take && countParams.skip) {
			if (countParams.limit) {
				delete countParams.limit;
			}
			if (countParams.offset) {
				delete countParams.offset;
			}
			if (params.offset !== 0) {
				modifiedCountParams = countParams;
			}
		}
		if (params.limit && params.offset) {
			if (params.offset !== 0) {
				modifiedCountParams = JSON.parse(
					replace(JSON.stringify(countParams), '"limit":', '"take":').replace(
						'"offset":',
						'"skip":',
					),
				);
			}
		}
		if (has(modifiedCountParams, 'relations')) {
			delete modifiedCountParams.relations;
		}
		if (has(modifiedCountParams, 'where') && typeof modifiedCountParams.where === 'string') {
			modifiedCountParams.where = JSON.parse(modifiedCountParams.where);
		}
		delete modifiedFindParams.pageSize;
		delete modifiedFindParams.page;
		if (modifiedCountParams) {
			delete modifiedCountParams.pageSize;
			delete modifiedCountParams.page;
		}

		return all([
			// Get rows
			this['find'](modifiedFindParams),
			// Get count of all rows
			this['count'](modifiedCountParams),
		]).then(async (res) => {
			console.log('list count: ', res[1]);
			return await this.transformDocuments(ctx, params, res[0]).then((docs: any) => {
				return {
					// Rows
					rows: docs,
					// Total rows
					total: res[1],
					// Page
					page: params.page,
					// Page size
					pageSize: params.pageSize,
					// Total pages
					totalPages: Math.floor(
						(res[1] + params.pageSize - 1) / Number(params.pageSize),
					),
				};
			});
		});
	}

	/**
	 * Transforms user defined idField into expected db id field.
	 * @methods
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 * @memberof TypeORMDbAdapter
	 */
	beforeSaveTransformID(entity: any, idField: string): object {
		let newEntity = cloneDeep(entity);
		// gets the idField from the entity
		const dbIDField =
			this.opts.type === 'mongodb'
				? '_id'
				: find(this.repository!.metadata.ownColumns, {
						isPrimary: true,
				  })!.propertyName;

		if (idField !== dbIDField && entity[idField] !== undefined) {
			newEntity = JSON.parse(
				replace(
					JSON.stringify(newEntity),
					new RegExp(`"${idField}":`, 'g'),
					`"${dbIDField}":`,
				),
			);
		}

		return newEntity;
	}

	/**
	 * Transforms db field into user defined idField service property
	 * @methods
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 * @memberof TypeORMDbAdapter
	 */
	afterRetrieveTransformID(entity: any, idField: string): Object {
		// gets the idField from the entity
		const dbIDField = find(this.repository!.metadata.ownColumns, {
			isPrimary: true,
		})!.propertyName;
		let newEntity;
		if (!entity.hasOwnProperty(idField)) {
			newEntity = JSON.parse(
				replace(
					JSON.stringify(entity),
					new RegExp(`"${dbIDField}":`, 'g'),
					`"${idField}":`,
				),
			);
		}
		return newEntity;
	}

	/**
	 * Encode ID of entity.
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 * @memberof TypeORMDbAdapter
	 */
	encodeID(id: any): any {
		return id;
	}

	/**
	 * Transform user defined idField service property into the expected id field of db.
	 * @methods
	 * @param {any} idField
	 * @returns {any}
	 * @memberof TypeORMDbAdapter
	 */
	beforeQueryTransformID(idField: any): any {
		const dbIDField =
			this.opts.type === 'mongodb'
				? '_id'
				: find(this.repository!.metadata.ownColumns, {
						isPrimary: true,
				  })!.propertyName;
		if (idField !== dbIDField) {
			return dbIDField;
		}
		return idField;
	}

	/**
	 * Decode ID of entity.
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 * @memberof TypeORMDbAdapter
	 */
	decodeID(id: any): any {
		return id;
	}

	/**
	 * Transform the fetched documents by converting id to user defind idField,
	 * filtering the fields according to the fields service property,
	 * an populating the document with the relations specified in the populate service property.
	 * @methods
	 * @param {Context} ctx
	 * @param {Object} 	params
	 * @param {Array|Object} docs
	 * @returns {Array|Object}
	 * @memberof TypeORMDbAdapter
	 */
	transformDocuments(ctx: any, params: any, docs: any): Promise<Array<any> | object> {
		let isDoc = false;
		const userDefinedIDField = this.service.settings.idField;
		if (!Array.isArray(docs)) {
			if (isObject(docs)) {
				isDoc = true;
				docs = [docs];
			} else return resolve(docs);
		}

		return (
			resolve(docs)
				// Convert entity to JS object
				.then((docs) => docs.map((doc: any) => this.entityToObject(doc)))

				// Apply idField
				.then((docs) =>
					docs.map((doc: any) => this.afterRetrieveTransformID(doc, userDefinedIDField)),
				)
				// Encode IDs
				.then((docs) =>
					docs.map((doc: { [x: string]: any }) => {
						doc[userDefinedIDField] = this.encodeID(doc[userDefinedIDField]);
						return doc;
					}),
				)
				// Populate
				.then((json) =>
					ctx && params.populate ? this.populateDocs(ctx, json, params.populate) : json,
				)

				// TODO onTransformHook

				// Filter fields
				.then((json) => {
					if (ctx && params.fields) {
						const fields = isString(params.fields)
							? // Compatibility with < 0.4
							  /* istanbul ignore next */
							  params.fields.split(/\s+/)
							: params.fields;
						// Authorize the requested fields
						const authFields = this.authorizeFields(fields);

						return json.map((item: any) => this.filterFields(item, authFields));
					} else {
						return json.map((item: any) =>
							this.filterFields(item, this.service.settings.fields),
						);
					}
				})

				// Filter excludeFields
				.then((json) => {
					const askedExcludeFields =
						ctx && params.excludeFields
							? isString(params.excludeFields)
								? params.excludeFields.split(/\s+/)
								: params.excludeFields
							: [];
					const excludeFields = askedExcludeFields.concat(
						this.service.settings.excludeFields || [],
					);

					if (Array.isArray(excludeFields) && excludeFields.length > 0) {
						return json.map((doc: any) => {
							return this._excludeFields(doc, excludeFields);
						});
					} else {
						return json;
					}
				})

				// Return
				.then((json) => (isDoc ? json[0] : json))
				.catch((err) => {
					/* istanbul ignore next */
					this.broker.logger.error('Transforming documents is failed!', err);
					throw new Errors.MoleculerServerError(
						`Failed to transform documents ${err}`,
						500,
						'FAILED_TO_TRANSFORM_DOCUMENTS',
						err,
					);
				})
		);
	}

	/**
	 * Call before entity lifecycle events
	 * @methods
	 * @param {String} type
	 * @param {Object} entity
	 * @param {Context} ctx
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	beforeEntityChange(type: string | undefined, entity: any, ctx: any): Promise<any> {
		const eventName = `beforeEntity${capitalize(type)}`;
		if (this.service.schema[eventName] == null) {
			return resolve(entity);
		}
		return resolve(this.service.schema[eventName].call(this, entity, ctx));
	}

	/**
	 * Clear the cache & call entity lifecycle events
	 * @methods
	 * @param {String} type
	 * @param {Object|Array<Object>|Number} json
	 * @param {Context} ctx
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	async entityChanged(type: string | undefined, json: any, ctx: any): Promise<any> {
		return await this.clearCache().then(async () => {
			const eventName = `entity${capitalize(type)}`;
			if (this.schema[eventName] != null) {
				return await this.service.schema[eventName].call(this, json, ctx);
			}
		});
	}

	/**
	 * Clear cached entities
	 * @methods
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	clearCache(): Promise<any> {
		this.broker[this.service.settings.cacheCleanEventType](`cache.clean.${this.fullName}`);
		if (this.broker.cacher) return this.broker.cacher.clean(`${this.fullName}.**`);
		return resolve();
	}

	/**
	 * Filter fields in the entity object
	 * @methods
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Filter properties of model.
	 * @returns	{Object}
	 * @memberof TypeORMDbAdapter
	 */
	filterFields(doc: any, fields: any[]): object {
		// Apply field filter (support nested paths)
		if (Array.isArray(fields)) {
			let res = {};
			fields.forEach((n) => {
				const v = get(doc, n);
				if (v !== undefined) set(res, n, v);
			});
			return res;
		}

		return doc;
	}

	/**
	 * Exclude fields in the entity object
	 * @methods
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Exclude properties of model.
	 * @returns	{Object}
	 * @memberof TypeORMDbAdapter
	 */
	excludeFields(doc: any, fields: string | any[]): object {
		if (Array.isArray(fields) && fields.length > 0) {
			return this._excludeFields(doc, fields);
		}

		return doc;
	}

	/**
	 * Exclude fields in the entity object. Internal use only, must ensure `fields` is an Array
	 */
	private _excludeFields(doc: any, fields: any[]) {
		const res = cloneDeep(doc);
		fields.forEach((field) => {
			unset(res, field);
		});
		return res;
	}

	/**
	 * Populate documents.
	 * @methods
	 * @param {Context} 		ctx
	 * @param {Array|Object} 	docs
	 * @param {Array?}			populateFields
	 * @returns	{Promise}
	 * @memberof TypeORMDbAdapter
	 */
	populateDocs(ctx: any, docs: any, populateFields?: any[]): Promise<any> {
		if (
			!this.service.settings.populates ||
			!Array.isArray(populateFields) ||
			populateFields.length == 0
		)
			return resolve(docs);

		if (docs == null || (!isObject(docs) && !Array.isArray(docs))) return resolve(docs);

		const settingPopulateFields = Object.keys(this.service.settings.populates);

		/* Group populateFields by populatesFields for deep population.
			(e.g. if "post" in populates and populateFields = ["post.author", "post.reviewer", "otherField"])
			then they would be grouped together: { post: ["post.author", "post.reviewer"], otherField:["otherField"]}
			*/
		const groupedPopulateFields = populateFields.reduce((obj, populateField) => {
			const settingPopulateField = settingPopulateFields.find(
				(settingPopulateField) =>
					settingPopulateField === populateField ||
					populateField.startsWith(settingPopulateField + '.'),
			);
			if (settingPopulateField != null) {
				if (obj[settingPopulateField] == null) {
					obj[settingPopulateField] = [populateField];
				} else {
					obj[settingPopulateField].push(populateField);
				}
			}
			return obj;
		}, {});

		let promises = [];
		for (const populatesField of settingPopulateFields) {
			let rule = this.service.settings.populates[populatesField];
			if (groupedPopulateFields[populatesField] == null) continue; // skip

			// if the rule is a function, save as a custom handler
			if (isFunction(rule)) {
				rule = {
					handler: method(rule),
				};
			}

			// If the rule is string, convert to object
			if (isString(rule)) {
				rule = {
					action: rule,
				};
			}

			if (rule.field === undefined) rule.field = populatesField;

			let arr = Array.isArray(docs) ? docs : [docs];

			// Collect IDs from field of docs (flatten, compact & unique list)
			let idList = uniq(flattenDeep(compact(arr.map((doc) => get(doc, rule.field)))));
			// Replace the received models according to IDs in the original docs
			const resultTransform = (populatedDocs: { [x: string]: any }) => {
				arr.forEach((doc) => {
					let id = get(doc, rule.field);
					if (isArray(id)) {
						let models = compact(id.map((id) => populatedDocs[id]));
						set(doc, populatesField, models);
					} else {
						set(doc, populatesField, populatedDocs[id]);
					}
				});
			};

			if (rule.handler) {
				promises.push(rule.handler.call(this, idList, arr, rule, ctx));
			} else if (idList.length > 0) {
				// Call the target action & collect the promises
				const params = Object.assign(
					{
						id: idList,
						mapping: true,
						populate: [
							// Transform "post.author" into "author" to pass to next populating service
							...groupedPopulateFields[populatesField]
								.map((populateField: string | any[]) =>
									populateField.slice(populatesField.length + 1),
								) //+1 to also remove any leading "."
								.filter((field: string) => field !== ''),
							...(rule.populate ? rule.populate : []),
						],
					},
					rule.params || {},
				);

				if (params.populate.length === 0) {
					delete params.populate;
				}

				promises.push(ctx.call(rule.action, params).then(resultTransform));
			}
		}

		return all(promises).then(() => docs);
	}

	/**
	 * Validate an entity by validator.
	 * @methods
	 * @param {Object} entity
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	validateEntity(entity: any): Promise<any> {
		if (!isFunction(this.service.settings.entityValidator)) return resolve(entity);

		let entities = Array.isArray(entity) ? entity : [entity];
		return all(
			entities.map((entity) => this.service.settings.entityValidator.call(this, entity)),
		).then(() => entity);
	}

	/**
	 * Convert DB entity to JSON object
	 * @methods
	 * @param {any} entity
	 * @returns {Object}
	 * @memberof TypeORMDbAdapter
	 */
	entityToObject(entity: any): object {
		return entity;
	}

	/**
	 * Authorize the required field list. Remove fields which is not exist in the `this.service.settings.fields`
	 * @methods
	 * @param {Array} askedFields
	 * @returns {Array}
	 * @memberof TypeORMDbAdapter
	 */
	authorizeFields(askedFields: any[]): Array<any> {
		if (this.service.settings.fields && this.service.settings.fields.length > 0) {
			let allowedFields: any[] = [];
			if (Array.isArray(askedFields) && askedFields.length > 0) {
				askedFields.forEach((askedField) => {
					if (this.service.settings.fields.indexOf(askedField) !== -1) {
						allowedFields.push(askedField);
						return;
					}

					if (askedField.indexOf('.') !== -1) {
						let parts = askedField.split('.');
						while (parts.length > 1) {
							parts.pop();
							if (this.service.settings.fields.indexOf(parts.join('.')) !== -1) {
								allowedFields.push(askedField);
								return;
							}
						}
					}

					let nestedFields = this.service.settings.fields.filter((settingField: string) =>
						settingField.startsWith(askedField + '.'),
					);
					if (nestedFields.length > 0) {
						allowedFields = allowedFields.concat(nestedFields);
					}
				});
				//return _.intersection(f, this.service.settings.fields);
			}
			return allowedFields;
		}

		return askedFields;
	}

	/**
	 * Update an entity by ID
	 * @methods
	 * @param {any} id
	 * @param {Object} update
	 * @returns {Promise}
	 * @memberof TypeORMDbAdapter
	 */
	async updateById(id: any, update: any): Promise<any> {
		const entity = await this['update']({ id: id }, update);
		return this.afterRetrieveTransformID(entity, this.service.settings.idField);
	}

	/**
	 * Sanitize context parameters at `find` action.
	 *
	 * @methods
	 *
	 * @param {Context} ctx
	 * @param {Object} params
	 * @returns {Object}
	 */
	sanitizeParams(ctx: any, params: any) {
		let p = Object.assign({}, params);

		// Convert from string to number
		if (typeof p.limit === 'string') p.limit = Number(p.limit);
		if (typeof p.take === 'string') p.take = Number(p.take);
		if (typeof p.offset === 'string') p.offset = Number(p.offset);
		if (typeof p.skip === 'string') p.skip = Number(p.skip);
		if (typeof p.page === 'string') p.page = Number(p.page);
		if (typeof p.pageSize === 'string') p.pageSize = Number(p.pageSize);
		// Convert from string to POJO
		if (typeof p.query === 'string') p.query = JSON.parse(p.query);

		if (typeof p.sort === 'string') p.sort = p.sort.split(/[,\s]+/);

		if (typeof p.fields === 'string') p.fields = p.fields.split(/[,\s]+/);

		if (typeof p.excludeFields === 'string') p.excludeFields = p.excludeFields.split(/[,\s]+/);

		if (typeof p.populate === 'string') p.populate = p.populate.split(/[,\s]+/);

		if (typeof p.relations === 'string') p.relations = JSON.parse(p.relations);

		if (typeof p.where === 'string') p.where = JSON.parse(p.where); // where array paramater is an or query

		if (typeof p.searchFields === 'string') p.searchFields = p.searchFields.split(/[,\s]+/);

		if (ctx.action.name.endsWith('.list')) {
			// Default `pageSize`
			if (!p.pageSize) p.pageSize = this.settings.pageSize;

			// Default `page`
			if (!p.page) p.page = 1;

			// Limit the `pageSize`
			if (this.settings.maxPageSize > 0 && p.pageSize > this.settings.maxPageSize)
				p.pageSize = this.settings.maxPageSize;

			// Calculate the limit & offset from page & pageSize
			if (p.limit) p.limit = p.pageSize;
			if (p.offset) p.offset = (p.page - 1) * p.pageSize;
			if (p.take) p.take = p.pageSize;
			if (p.skip) p.skip = (p.page - 1) * p.pageSize;
		}
		// Limit the `limit`
		if (this.settings.maxLimit > 0 && p.limit > this.settings.maxLimit)
			p.limit = this.settings.maxLimit;
		if (this.settings.maxLimit > 0 && p.take > this.settings.maxLimit)
			p.take = this.settings.maxLimit;

		return p;
	}
}
