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
	map,
	replace,
	set,
	uniq,
	unset,
} from 'lodash';
import { all, method, resolve } from 'bluebird';
import { Service, ServiceBroker, Errors, Context } from 'moleculer';
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
	FindManyOptions,
	FilterOperators,
	CountOptions,
} from 'typeorm';
import ConnectionManager from './connectionManager';
import { ListParams } from '../types/typeormadapter';
import { ObjectId } from 'mongodb';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
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
				'geoHaystackSearch',
				'geoNear',
				'group',
				'collectionIndexes',
				'collectionIndexExists',
				'collectionIndexInformation',
				'initializeOrderedBulkOp',
				'initializeUnorderedBulkOp',
				'insertMany',
				'insertOne',
				'isCapped',
				'listCollectionIndexes',
				'parallelCollectionScan',
				'reIndex',
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
						? method === 'hasId' ||
						  method === 'getRepository' ||
						  method === 'target' ||
						  method === 'metadata' ||
						  method === 'useDataSource' ||
						  method === 'getId'
							? (this[method] = dbRepository[method])
							: (this[`_${method}`] = dbRepository[method])
						: (methodsToAdd[method] = dbRepository[method]);
				}
			});
			/**
			 * apply entity methods object to this.adapter.entityName
			 */
			!dbRepository['save']
				? this.broker.logger.warn(
						`Entity class ${entityName} does not extend TypeORM BaseEntity.
						If you are not using MongoDB, use data mapping with this.adapter.repository or this.adapter.manager instead of active record methodology.`,
				  )
				: index !== 0
				? (this[entityName] = {
						...methodsToAdd,
						findByIdWO: this.findByIdWO,
						findById: this.findById,
						getPopulations: this.getPopulations,
						count: this.count,
						find: this.find,
						findOne: this.findOne,
						findByIds: this.findByIds,
						findByIdsWO: this.findByIdsWO,
						list: this.list,
						encodeID: this.encodeID,
						decodeID: this.decodeID,
						toMongoObjectId: this.toMongoObjectId,
						fromMongoObjectId: this.fromMongoObjectId,
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
	 * Count number of matching documents in the db to a query.
	 *
	 * @methods
	 * @param {Object} options - count options
	 * @param {Object?} query - query options
	 * @returns {Promise<number>}
	 * @memberof TypeORMDbAdapter
	 */
	async count<T extends Entity>(
		options?: FindManyOptions<T> | CountOptions,
		query?: ObjectLiteral,
	): Promise<number> {
		return this.opts.type !== 'mongodb'
			? await this['_count'](options)
			: await this['_count'](query, options);
	}

	/**
	 * Finds entities that match given find options.
	 *
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Object} findManyOptions - find many options
	 * @returns {Promise<[T | number]>}
	 * @memberof TypeORMDbAdapter
	 */
	async find<T extends Entity>(
		ctx: Context,
		findManyOptions?: FindManyOptions<T> | Partial<T> | FilterOperators<T>,
	): Promise<[T[], number]> {
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity = await this['_find'](findManyOptions)
			.then((docs: any) => {
				this.broker.logger.debug('Transforming findByIdWO docs...');
				return this.transformDocuments(ctx, params, docs);
			})
			.catch((error: any) => {
				this.broker.logger.error(`Failed to findByIdWO ${error}`);
				new Errors.MoleculerServerError(
					`Failed to findByIdWO ${error}`,
					500,
					'FAILED_TO_FIND_ONE_BY_OPTIONS',
					error,
				);
			});
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as any;
	}

	/**
	 * Finds first item by a given find options.
	 * If entity was not found in the database - returns null.
	 * Available Options props:
	 * - comment
	 * - select
	 * - where
	 * - relations
	 * - relationLoadStrategy
	 * - join
	 * - order
	 * - cache
	 * - lock
	 * - withDeleted
	 * - loadRelationIds
	 * - loadEagerRelations
	 * - transaction
	 *
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Object} findOptions - find options
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 */
	async findOne<T extends Entity>(
		ctx: Context,
		findOptions?: FindOneOptions<T> | MongoFindOneOptions<T>,
	): Promise<T | undefined> {
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity = await this['_findOne'](findOptions)
			.then((docs: any) => {
				this.broker.logger.debug('Transforming findByIdWO docs...');
				return this.transformDocuments(ctx, params, docs);
			})
			.catch((error: any) => {
				this.broker.logger.error(`Failed to findByIdWO ${error}`);
				new Errors.MoleculerServerError(
					`Failed to findByIdWO ${error}`,
					500,
					'FAILED_TO_FIND_ONE_BY_OPTIONS',
					error,
				);
			});
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Gets item by id(s). Can use find options, no where clause.
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Partial<T>} key - primary db id column name
	 * @param {string | number | string[] | number[]} id - id(s) of entity
	 * @param {Object} findOptions - find options, like relations, order, etc. No where clause
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 */
	async findByIdWO<T extends Entity>(
		ctx: Context,
		key: string | undefined | null = this.service.settings.idField,
		id: string | number | string[] | number[],
		findOptions?: FindOneOptions<T> | FindManyOptions<T>,
	): Promise<T | undefined> {
		const transformId = this.beforeQueryTransformID(key);
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity =
			this.opts.type !== 'mongodb'
				? isArray(id)
					? await this['_find']({
							where: { [transformId]: In([...id]) },
							...findOptions,
					  })
							.then((docs: any) => {
								this.broker.logger.debug('Transforming findByIdWO docs...');
								return this.transformDocuments(ctx, params, docs);
							})
							.catch((error: any) => {
								this.broker.logger.error(`Failed to findByIdWO ${error}`);
								new Errors.MoleculerServerError(
									`Failed to findByIdWO ${error}`,
									500,
									'FAILED_TO_FIND_BY_ID_WO',
									error,
								);
							})
					: await this['_findOneOrFail']({
							where: { [transformId]: In([id]) },
							...findOptions,
					  })
							.then((docs: any) => {
								this.broker.logger.debug('Transforming findByIdWO docs...');
								return this.transformDocuments(ctx, params, docs);
							})
							.catch((error: any) => {
								this.broker.logger.error(`Failed to findByIdWO ${error}`);
								new Errors.MoleculerServerError(
									`Failed to findByIdWO ${error}`,
									500,
									'FAILED_TO_FIND_BY_ID_WO',
									error,
								);
							})
				: isArray(id)
				? await this['_find']({
						where: {
							[transformId]: {
								$in: [
									...map(id, (recordId: any) => this.toMongoObjectId(recordId)),
								],
								// $in: [...[id.forEach((recordId: any) => new ObjectId(recordId))]],
							},
							...findOptions,
						},
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIdWO ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIdWO ${error}`,
								500,
								'FAILED_TO_FIND_BY_ID_WO',
								error,
							);
						})
				: await this['_findOneOrFail']({
						where: { [transformId]: { $in: [this.toMongoObjectId(id)] } },
						...findOptions,
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIdWO ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIdWO ${error}`,
								500,
								'FAILED_TO_FIND_BY_ID_WO',
								error,
							);
						}); // needed for mongodb
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Gets item by id(s). No find options can be provided
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Partial<T>} key - primary db id column name
	 * @param {string | number | string[] | number[]} id - id(s) of entity
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 *
	 */
	async findById<T extends Entity>(
		ctx: Context,
		key: string | undefined | null = this.service.settings.idField,
		id: string | number | string[] | number[],
	): Promise<T | undefined> {
		const transformId = this.beforeQueryTransformID(key);
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity =
			this.opts.type !== 'mongodb'
				? isArray(id)
					? await this['_findBy']({ [transformId]: In([...id]) })
							.then((docs: any) => {
								this.broker.logger.debug('Transforming findByIdWO docs...');
								return this.transformDocuments(ctx, params, docs);
							})
							.catch((error: any) => {
								this.broker.logger.error(`Failed to findById ${error}`);
								new Errors.MoleculerServerError(
									`Failed to findById ${error}`,
									500,
									'FAILED_TO_FIND_BY_ID',
									error,
								);
							})
					: await this['_findOneByOrFail']({ [transformId]: In([id]) })
							.then((docs: any) => {
								this.broker.logger.debug('Transforming findByIdWO docs...');
								return this.transformDocuments(ctx, params, docs);
							})
							.catch((error: any) => {
								this.broker.logger.error(`Failed to findById ${error}`);
								new Errors.MoleculerServerError(
									`Failed to findById ${error}`,
									500,
									'FAILED_TO_FIND_BY_ID',
									error,
								);
							})
				: isArray(id)
				? await this['_find']({
						where: {
							[transformId]: {
								$in: [
									...map(id, (recordId: any) => this.toMongoObjectId(recordId)),
								],
							},
						},
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findById ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findById ${error}`,
								500,
								'FAILED_TO_FIND_BY_ID',
								error,
							);
						})
				: await this['_findOneByOrFail']({
						where: { [transformId]: { $in: [this.toMongoObjectId(id)] } },
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findById ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findById ${error}`,
								500,
								'FAILED_TO_FIND_BY_ID',
								error,
							);
						}); // needed for mongodb
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Populates entity(ies) by id(s) of another record.
	 *
	 * @methods
	 *
	 * @param {Context} ctx - Context instance.
	 * @param {Object?} params - Parameters.
	 *
	 * @returns {Object|Array<Object>} Found entity(ies).
	 *
	 * @throws {EntityNotFoundError} - 404 Entity not found
	 */
	getPopulations(ctx: Context, params?: any): Object | Array<Object> {
		let id = params.id;
		let origDoc: any;
		let shouldMapping = params.mapping === true;
		return this['findById'](ctx, null, id)
			.then((doc) => {
				if (!doc)
					return Promise.reject(
						new Errors.MoleculerServerError(
							`Failed to findById ${id}`,
							500,
							'FAILED_TO_FIND_BY_ID',
						),
					);

				if (shouldMapping) {
					origDoc = isArray(doc) ? doc.map((d) => cloneDeep(d)) : cloneDeep(doc);
				} else {
					origDoc = doc;
				}

				return this.transformDocuments(ctx, params, doc);
			})
			.then((json) => {
				if (params.mapping !== true) return json;

				let res: any = {};
				if (isArray(json)) {
					json.forEach((doc, i) => {
						const id = this.encodeID(
							// @ts-ignore
							this.afterRetrieveTransformID(
								origDoc[i],
								this.service.settings.idField,
							)[this.service.settings.idField],
						);
						res[id] = doc;
					});
				} else if (isObject(json)) {
					const id = this.encodeID(
						// @ts-ignore
						this.afterRetrieveTransformID(origDoc, this.service.settings.idField)[
							this.service.settings.idField
						],
					);
					res[id] = json;
				}
				return res;
			});
	}

	/**
	 * Gets multiple items by id.
	 * No find options
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Partial<T>} key - primary db id column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 * @deprecated - use findById instead. It now supports multiple ids
	 */
	async findByIds<T extends Entity>(
		ctx: Context,
		key: string | undefined | null = this.service.settings.idField,
		ids: any[],
	): Promise<T | undefined> {
		const transformId = this.beforeQueryTransformID(key);
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity =
			this.opts.type !== 'mongodb'
				? await this['_findBy']({ [transformId]: In([...ids]) })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIds docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIds ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIds ${error}`,
								500,
								'FAILED_TO_FIND_BY_IDS',
								error,
							);
						})
				: await this['_find']({
						where: {
							[transformId]: {
								$in: [
									...map(ids, (recordId: any) => this.toMongoObjectId(recordId)),
								],
							},
						},
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIds docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIds ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIds ${error}`,
								500,
								'FAILED_TO_FIND_BY_IDS',
								error,
							);
						}); // needed for mongodb. FindBy is having issues: https://github.com/typeorm/typeorm/issues/8889
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Gets multiple items by id.
	 * Can use find options, no where clause.
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {Partial<T>} key - primary db id column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @param {Object} findOptions - find options, like relations, order, etc. No where clause
	 * @returns {Promise<T | undefined>}
	 * @memberof TypeORMDbAdapter
	 * @deprecated - use findByIdWO instead. It now supports multiple ids
	 *
	 */
	async findByIdsWO<T extends Entity>(
		ctx: Context,
		key: string | undefined | null = this.service.settings.idField,
		ids: any[],
		findOptions?: FindManyOptions<T>,
	): Promise<T | undefined> {
		const transformId = this.beforeQueryTransformID(key);
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity =
			this.opts.type !== 'mongodb'
				? await this['_find']({ where: { [transformId]: In([...ids]) }, ...findOptions })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdsWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIdsWO ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIdsWO ${error}`,
								500,
								'FAILED_TO_FIND_BY_IDS_WO',
								error,
							);
						})
				: await this['_find']({
						where: {
							[transformId]: {
								$in: [
									...map(ids, (recordId: any) => this.toMongoObjectId(recordId)),
								],
							},
							...findOptions,
						},
				  })
						.then((docs: any) => {
							this.broker.logger.debug('Transforming findByIdsWO docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to findByIdsWO ${error}`);
							new Errors.MoleculerServerError(
								`Failed to findByIdsWO ${error}`,
								500,
								'FAILED_TO_FIND_BY_IDS_WO',
								error,
							);
						}); // needed for mongodb. FindBy is having issues: https://github.com/typeorm/typeorm/issues/8889
		return this.afterRetrieveTransformID(entity, this.service.settings.idField) as
			| T
			| undefined;
	}

	/**
	 * Update an entity by ID
	 * @methods
	 * @param {Context} ctx - request context
	 * @param {any} id - ID of record to be updated
	 * @param {Object} update - Object with update data
	 * @returns {Promise} - Updated record
	 * @memberof TypeORMDbAdapter
	 */
	async updateById(ctx: Context, id: any, update: any): Promise<any> {
		const transformId: any = this.beforeQueryTransformID(id);
		const params = this.sanitizeParams(ctx, ctx.params);
		const entity =
			this.opts.type !== 'mongodb'
				? await this['_update']({ [transformId]: id }, update)
						.then((docs: any) => {
							this.broker.logger.debug('Transforming updateById docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to updateById ${error}`);
							new Errors.MoleculerServerError(
								`Failed to updateById ${error}`,
								500,
								'FAILED_TO_UPDATE_BY_ID',
								error,
							);
						})
				: await this['_update']({ [transformId]: this.toMongoObjectId(id) }, update)
						.then((docs: any) => {
							this.broker.logger.debug('Transforming updateById docs...');
							return this.transformDocuments(ctx, params, docs);
						})
						.catch((error: any) => {
							this.broker.logger.error(`Failed to updateById ${error}`);
							new Errors.MoleculerServerError(
								`Failed to updateById ${error}`,
								500,
								'FAILED_TO_UPDATE_BY_ID',
								error,
							);
						});
		return this.afterRetrieveTransformID(entity, this.service.settings.idField);
	}

	/**
	 * List entities from db using filters and pagination results.
	 * @methods
	 * @param {Context} ctx - Context instance.
	 * @param {ListParams<Object>?} params - Optional parameters.
	 * @returns {Object} List of found entities and count.
	 * @memberof TypeORMDbAdapter
	 */
	list(ctx: any, params: ListParams): object {
		const sanatizedParams = this.sanitizeParams(ctx, params);
		let countParams = Object.assign({}, sanatizedParams);
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
			this['_find'](modifiedFindParams),
			// Get count of all rows
			this['_count'](modifiedCountParams),
		]).then(async (res) => {
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
	 * Transforms user defined idField into expected db id field name.
	 * @methods
	 * @param {Object} entity - Record to be saved
	 * @param {String} idField - user defined service idField
	 * @returns {Object} - Modified entity
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
	 * Transforms db field name into user defined idField service property
	 * @methods
	 * @param {Object} entity = Record retrieved from db
	 * @param {String} idField - user defined service idField
	 * @returns {Object} - Modified entity
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
		} else {
			newEntity = entity;
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
	 * Convert id to mongodb ObjectId.
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 * @memberof TypeORMDbAdapter
	 */
	toMongoObjectId(id: any): ObjectId {
		return new ObjectId(id);
	}

	/**
	 * Convert mongodb ObjectId to string.
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 * @memberof TypeORMDbAdapter
	 */
	fromMongoObjectId(id: any): string {
		return id.toString();
	}

	/**
	 * Transform user defined idField service property into the expected id field of db.
	 * @methods
	 * @param {any} idField - user defined service idField
	 * @returns {Object} - Record to be saved
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
	 * and populating the document with the relations specified in the populate service property.
	 * @methods
	 * @param {Context} ctx - Context of the request
	 * @param {Object} 	params - Params of the request
	 * @param {Array|Object} docs - Records to be transformed
	 * @returns {Array|Object} - Transformed records
	 * @memberof TypeORMDbAdapter
	 */
	transformDocuments(ctx: any, params: any, docs: any): Promise<Array<any> | object> {
		this.broker.logger.debug('Transforming documents..');
		let isDoc = false;
		this.broker.logger.debug(`Setting userDefinedIDField to ${this.service.settings.idField}`);
		const userDefinedIDField = this.service.settings.idField;
		this.broker.logger.debug('Checking if docs is an array or an object..');
		if (!Array.isArray(docs)) {
			this.broker.logger.debug('Docs is not an array');
			if (isObject(docs)) {
				this.broker.logger.debug('Docs is an object, converting to array..');
				isDoc = true;
				docs = [docs];
			} else {
				this.broker.logger.debug('Docs is not an object, returning docs..');
				return resolve(docs);
			}
		}

		return (
			resolve(docs)
				// Convert entity to JS object
				.then((docs) =>
					docs.map((doc: any) => {
						this.broker.logger.debug('Converting entity to JS object...');
						return this.entityToObject(doc);
					}),
				)

				// Apply idField
				.then((docs) =>
					docs.map((doc: any) => {
						this.broker.logger.debug('Applying idField to docs...');
						return this.afterRetrieveTransformID(doc, userDefinedIDField);
					}),
				)
				// Encode IDs
				.then((docs) =>
					docs.map((doc: { [x: string]: any }) => {
						this.broker.logger.debug('Encoding IDs..');
						doc[userDefinedIDField] = this.encodeID(doc[userDefinedIDField]);
						return doc;
					}),
				)
				// Populate
				.then((json) => {
					this.broker.logger.debug(`Populating docs with ${params.populate}..`);
					return ctx && params.populate
						? this.populateDocs(ctx, json, params.populate)
						: json;
				})

				// TODO onTransformHook

				// Filter fields
				.then((json) => {
					this.broker.logger.debug('Attempting to filter fields..');
					if (ctx && params.fields) {
						this.broker.logger.debug('Fields found in params..');
						const fields = isString(params.fields)
							? // Compatibility with < 0.4
							  /* istanbul ignore next */
							  params.fields.split(/\s+/)
							: params.fields;
						// Authorize the requested fields
						this.broker.logger.debug('Authorizing fields..');
						const authFields = this.authorizeFields(fields);
						this.broker.logger.debug('Filtering fields and returning object..');
						return json.map((item: any) => this.filterFields(item, authFields));
					} else {
						this.broker.logger.debug(
							'No fields found in params, returning filtered object..',
						);
						return json.map((item: any) =>
							this.filterFields(item, this.service.settings.fields),
						);
					}
				})

				// Filter excludeFields
				.then((json) => {
					this.broker.logger.debug('Attempting to filter excludeFields..');
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
						this.broker.logger.debug(
							'ExcludeFields found in params, returning filtered object..',
						);
						return json.map((doc: any) => {
							return this._excludeFields(doc, excludeFields);
						});
					} else {
						this.broker.logger.debug(
							'No excludeFields found in params, returning object..',
						);
						return json;
					}
				})

				// Return
				.then((json) => {
					this.broker.logger.debug('Returning json object..');
					return isDoc ? json[0] : json;
				})
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
	 * @param {Object} doc - Record to be filtered.
	 * @param {Array<String>} fields - Filter properties of model.
	 * @returns	{Object} - Filtered record
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
	 * @param {Object} doc - Record to be filtered.
	 * @param {Array<String>} fields - Exclude properties of model.
	 * @returns	{Object} - Recored without excluded fields
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
	 * Populate documents for relations.
	 * Used when relations between records between different databases can't be done.
	 * Populates the retreived record by calling service action with the `id` of the relation.
	 * Does not update related document at this time
	 * @methods
	 * @param {Context} ctx - Request context
	 * @param {Array|Object} docs - Records to be populated
	 * @param {Array?} populateFields - Fields to be populated
	 * @returns	{Promise} - Record with populated fields of relation
	 * @memberof TypeORMDbAdapter
	 */
	populateDocs(ctx: any, docs: any, populateFields?: any[]): Promise<any> {
		this.broker.logger.debug('Attempting to populate documents..');
		if (
			!this.service.settings.populates ||
			!Array.isArray(populateFields) ||
			populateFields.length == 0
		) {
			this.broker.logger.debug('No populateFields found, returning docs..');
			return resolve(docs);
		}

		if (docs == null || (!isObject(docs) && !Array.isArray(docs))) {
			this.broker.logger.debug('No docs found, returning docs..');
			return resolve(docs);
		}
		this.broker.logger.debug(
			`Setting settingPopulateFields with ${Object.keys(this.service.settings.populates)}`,
		);
		const settingPopulateFields = Object.keys(this.service.settings.populates);

		/**
		 * Group populateFields by populatesFields for deep population.
		 * (e.g. if "post" in populates and populateFields = ["post.author", "post.reviewer", "otherField"])
		 * then they would be grouped together: { post: ["post.author", "post.reviewer"], otherField:["otherField"]}
		 */
		this.broker.logger.debug('Grouping populateFields..');
		const groupedPopulateFields = populateFields.reduce((obj, populateField) => {
			this.broker.logger.debug(`Checking if ${populateField} is in ${settingPopulateFields}`);
			const settingPopulateField = settingPopulateFields.find(
				(settingPopulateField) =>
					settingPopulateField === populateField ||
					populateField.startsWith(settingPopulateField + '.'),
			);
			if (settingPopulateField != null) {
				this.broker.logger.debug('Found settingPopulateField');
				this.broker.logger.debug(`Checking if ${settingPopulateField} is in `, obj);
				// this.broker.logger.debug(`Checking if ${settingPopulateField} is in ${JSON.stringify(obj)}`);
				if (obj[settingPopulateField] == null) {
					this.broker.logger.debug(
						'No settingPopulateField found, setting to empty array',
					);
					this.broker.logger.debug(
						`Adding ${[populateField]} to ${obj[settingPopulateField]}`,
					);
					obj[settingPopulateField] = [populateField];
				} else {
					this.broker.logger.debug(
						`Pushing ${populateField} to ${obj[settingPopulateField]}`,
					);
					obj[settingPopulateField].push(populateField);
				}
			}
			this.broker.logger.debug(`Returning ${JSON.stringify(obj)}`);
			return obj;
		}, {});

		let promises = [];
		this.broker.logger.debug('Looping through settingPopulateFields...');
		for (const populatesField of settingPopulateFields) {
			this.broker.logger.debug(
				`setting rule to ${this.service.settings.populates[populatesField]}`,
			);
			let rule = this.service.settings.populates[populatesField];
			if (groupedPopulateFields[populatesField] == null) {
				this.broker.logger.debug('No groupedPopulateFields found, skipping');
				continue;
			} // skip
			// if the rule is a function, save as a custom handler
			this.broker.logger.debug('Checking if rule is a function...');
			if (isFunction(rule)) {
				this.broker.logger.debug('Rule is a function, setting handler');
				rule = {
					handler: method(rule),
				};
			}
			this.broker.logger.debug('Rule is not a function. Checking if rule is a string...');
			// If the rule is string, convert to object
			if (isString(rule)) {
				this.broker.logger.debug('Rule is a string, setting action');
				rule = {
					action: rule,
				};
			}
			this.broker.logger.debug('Rule is not a string. Checking if rule is undefined..');
			if (rule.field === undefined) {
				this.broker.logger.debug(
					`Rule is undefined, setting rule.field to ${populatesField}`,
				);
				rule.field = populatesField;
			}
			this.broker.logger.debug('Setting arr to docs...');
			let arr = Array.isArray(docs) ? docs : [docs];

			// Collect IDs from field of docs (flatten, compact & unique list)
			this.broker.logger.debug(
				'Collecting IDs from field of docs, (flatten, compact & unique list) setting idList',
			);
			let idList = uniq(flattenDeep(compact(arr.map((doc) => get(doc, rule.field)))));
			// Replace the received models according to IDs in the original docs
			this.broker.logger.debug(
				'Replacing the received models according to IDs in the original docs',
			);
			const resultTransform = (populatedDocs: { [x: string]: any }) => {
				this.broker.logger.debug('Looping through docs...');
				arr.forEach((doc) => {
					this.broker.logger.debug(`Setting id to ${get(doc, rule.field)}`);
					let id = get(doc, rule.field);
					this.broker.logger.debug(`Checking if id is an array...`);
					if (isArray(id)) {
						this.broker.logger.debug(
							`id is an array, setting models to ${compact(
								id.map((id) => populatedDocs[id]),
							)}`,
						);
						let models = compact(id.map((id) => populatedDocs[id]));
						this.broker.logger.debug('Setting doc to models...');
						set(doc, populatesField, models);
					} else {
						this.broker.logger.debug(
							`id is not an array, setting doc to populatedDocs[id]`,
						);
						set(doc, populatesField, populatedDocs[id]);
					}
				});
			};
			this.broker.logger.debug('Checking if rule.handler is defined...');
			if (rule.handler) {
				this.broker.logger.debug('rule.handler is defined, calling rule.handler');
				promises.push(rule.handler.call(this, idList, arr, rule, ctx));
			} else if (idList.length > 0) {
				this.broker.logger.debug(
					'rule.handler is not defined and idList.length > 0, calling target action & collect the promises',
				);
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
				this.broker.logger.debug('Checking if params.populate.length === 0...');
				if (params.populate.length === 0) {
					this.broker.logger.debug(
						'params.populate.length === 0, deleting params.populate',
					);
					delete params.populate;
				}
				this.broker.logger.debug(
					`Calling ${rule.action} with params ${params} then transforming result...`,
				);
				promises.push(ctx.call(rule.action, params).then(resultTransform));
			}
		}
		this.broker.logger.debug('Returning all promises...');
		return all(promises).then(() => docs);
	}

	/**
	 * Validate an entity by validator.
	 * Uses the `entityValidator` setting. If no validator function is supplied, returns record.
	 * @methods
	 * @param {Object} entity - Record to be validated
	 * @returns {Promise} - Validated record or unvalitaded record if no validator function is supplied.
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
	 * @param {any} entity - Record to be converted
	 * @returns {Object} - JSON object of record
	 * @memberof TypeORMDbAdapter
	 */
	entityToObject(entity: any): object {
		return entity;
	}

	/**
	 * Authorize the required field list. Remove fields which does not exist in the `this.service.settings.fields`
	 * @methods
	 * @param {Array} askedFields - List of fields to be authorized
	 * @returns {Array} - Authorized list of fields
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
	 * Sanitize context parameters at `find` action.
	 *
	 * @methods
	 *
	 * @param {Context} ctx - Request context
	 * @param {Object} params - Request parameters
	 * @returns {Object} - Sanitized parameters
	 * @memberof TypeORMDbAdapter
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

		if (typeof p.where === 'string') p.where = JSON.parse(p.where); // where array paramater is an object or query

		if (typeof p.searchFields === 'string') p.searchFields = p.searchFields.split(/[,\s]+/);

		if (ctx.action.name.endsWith('.list')) {
			// Default `pageSize`
			if (!p.pageSize) p.pageSize = this.service.settings.pageSize;

			// Default `page`
			if (!p.page) p.page = 1;

			// Limit the `pageSize`
			if (
				this.service.settings.maxPageSize > 0 &&
				p.pageSize > this.service.settings.maxPageSize
			)
				p.pageSize = this.service.settings.maxPageSize;

			// Calculate the limit & offset from page & pageSize
			if (p.limit) p.limit = p.pageSize;
			if (p.offset) p.offset = (p.page - 1) * p.pageSize;
			if (p.take) p.take = p.pageSize;
			if (p.skip) p.skip = (p.page - 1) * p.pageSize;
		}
		// Limit the `limit`
		if (this.service.settings.maxLimit > 0 && p.limit > this.service.settings.maxLimit)
			p.limit = this.service.settings.maxLimit;
		if (this.service.settings.maxLimit > 0 && p.take > this.service.settings.maxLimit)
			p.take = this.service.settings.maxLimit;

		return p;
	}
}
