/*
 * moleculer-db
 * Copyright (c) 2019 MoleculerJS (https://github.com/moleculerjs/moleculer-db)
 * MIT Licensed
 */

'use strict';
import 'reflect-metadata';
import { cloneDeep, isArray } from 'lodash';
import { resolve } from 'bluebird';
import { Service, ServiceBroker, Errors } from 'moleculer';
import {
	DataSource,
	DataSourceOptions,
	EntityManager,
	EntitySchema,
	ObjectLiteral,
	Repository,
} from 'typeorm';
import ConnectionManager from './connectionManager';

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
export class TypeORMDbAdapter<Entity extends ObjectLiteral> {
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
	static connectionManager: ConnectionManager | undefined;
	private _entity: EntitySchema<Entity> | Array<EntitySchema<Entity>> | undefined;
	private dataSource: DataSource | undefined;
	/**
	 * Grants access to the entity manager of the connection.
	 * Called using this.adapter.manager
	 * @static
	 * @property {EntityManager} manager
	 *
	 * @properties
	 */
	manager: EntityManager | undefined;
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
	 * Initialize adapter
	 * It will be called in `broker.start()` and is used internally
	 *
	 * @methods
	 * @param {ServiceBroker} broker
	 * @param {Service} service
	 *
	 * @memberof TypeORMDbAdapter
	 */
	init(broker: ServiceBroker, service: Service) {
		this.broker = broker;
		this.service = service;
		const entityFromService = this.service.schema.model;
		const entityArray: Array<EntitySchema<Entity>> = [];
		isArray(entityFromService)
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
			: !!entityFromService.constructor
			? (this._entity = entityFromService)
			: new Errors.MoleculerServerError('Invalid model. It should be a typeorm repository');
	}

	/**
	 * Connects to database.
	 * It will be called in `broker.start()` and is used internally.
	 *
	 * @methods
	 * @public
	 *
	 * @returns {Promise}
	 *
	 */
	async connect(): Promise<any> {
		/**
		 * set connection manager on this.adapter
		 */
		this.connectionManager = new ConnectionManager();

		/**
		 * create connection using this.opts
		 */
		const connectionOpts = cloneDeep(this.opts);
		connectionOpts.entities = isArray(this._entity) ? this._entity : [this._entity];
		this.opts = connectionOpts;
		const db = await this.connectionManager.create(this.opts);

		return await db
			.initialize()
			.then((datasource: any) => {
				this.broker.logger.info(
					`${this.service.name} has connected to ${datasource.name} database`,
				);

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
					const dbRepository = db.getRepository(entity);
					const entityName = dbRepository.metadata.name;
					const methodNames = entityMethods(entity);
					/**
					 * object for entity methods to this.adapter.entityName
					 * getRepository function required for this to work
					 */
					const methodsToAdd: { [key: string]: any } = {
						manager: dbRepository.manager,
						repository: dbRepository,
						getRepository: function getRepository() {
							const dataSource = db;
							if (!dataSource)
								throw new Error(`DataSource is not set for this entity.`);
							return dataSource.getRepository(entity);
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
						'hasId',
						'save',
						'remove',
						'softRemove',
						'recover',
						'reload',
						'useDataSource',
						'target',
						'getId',
						'createQueryBuilder',
						'create',
						'merge',
						'preload',
						'insert',
						'update',
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
					].forEach((method) => {
						index === 0
							? (this[method] = entity[method])
							: (methodsToAdd[method] = entity[method]);
					});
					/**
					 * apply entity methods object to this.adapter.entityName
					 */
					!entity['save']
						? this.broker.logger.warn(
								`Entity class ${entityName} does not extend TypeORM BaseEntity, use data mapping with this.adapter.repository instead of active record methodology.`,
						  )
						: index !== 0
						? (this[entityName] = methodsToAdd)
						: null;
				});

				/**
				 * set entity manager on this.adapter
				 */
				this.manager = db.manager;

				/**
				 * set repository on this.adapter
				 */
				this.repository = db.getRepository(entityArrray[0]);

				/**
				 * set datasource on this.adapter
				 */
				this.dataSource = datasource;
			})
			.catch((err: any) => {
				this.broker.logger.error(`Error initializing database: ${err.message}`);
			});
	}

	/**
	 * Disconnects all connections from database and connection manager.
	 * It will be called in `broker.stop()` and is used internally.
	 *
	 * @methods
	 * @public
	 *
	 * @returns {Promise}
	 */
	async disconnect(): Promise<any> {
		await this.connectionManager!.connections.forEach((connection: DataSource) => {
			this.broker.logger.info(`Attempting to disconnect from database ${connection.name}...`);
			this.connectionManager!.close(connection.name)
				.then((disconnected: boolean) =>
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
	 * Gets current entity's Repository and returns it.
	 * Needed for active record to work from base entity and
	 * Uses this.entity which could be an entity or an array of entities.
	 * If this._entity is an array, uses first entity in array for active record.
	 * Used internally by this.adapter for base conection.
	 *
	 * @methods
	 * @private
	 * @param {T} this
	 * @returns {Repository<Entity>}
	 *
	 */
	getRepository<T extends this>(this: T): Repository<Entity> {
		const dataSource = this.dataSource;
		if (!dataSource) throw new Error(`DataSource is not set for this entity.`);
		return dataSource.getRepository(isArray(this._entity!) ? this._entity[0] : this._entity!);
	}

	/** Moleculer-db methods */

	/**
	 * Convert DB entity to JSON object
	 *
	 * @methods
	 * @public
	 * @param {any} entity
	 * @returns {Object}
	 *
	 */
	entityToObject(entity: any): object {
		return entity;
	}

	/**
	 * Transforms 'idField' into NeDB's '_id'
	 *
	 * @methods
	 * @public
	 * @param {Object} entity
	 * @param {String} idField
	 *
	 * @returns {Object} Modified entity
	 *
	 */
	beforeSaveTransformID(entity: Record<string, any>, idField: string): object {
		let newEntity = cloneDeep(entity);

		if (idField !== '_id' && entity[idField] !== undefined) {
			newEntity._id = newEntity[idField];
			delete newEntity[idField];
		}

		return newEntity;
	}

	/**
	 * Transforms NeDB's '_id' into user defined 'idField'
	 *
	 * @methods
	 * @public
	 * @param {Object} entity
	 * @param {String} idField
	 * @returns {Object} Modified entity
	 *
	 */
	afterRetrieveTransformID(entity: Record<string, any>, idField: string): object {
		if (idField !== '_id') {
			entity[idField] = entity['_id'];
			delete entity._id;
		}
		return entity;
	}
}
