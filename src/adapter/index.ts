/*
 * moleculer-db
 * Copyright (c) 2019 MoleculerJS (https://github.com/moleculerjs/moleculer-db)
 * MIT Licensed
 */

'use strict';
import 'reflect-metadata';
import {
	cloneDeep,
	compact,
	flattenDeep,
	get,
	has,
	isArray,
	isFunction,
	isObject,
	isString,
	isUndefined,
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
			: !isUndefined(entityFromService) && !!entityFromService.constructor
			? (this._entity = entityFromService)
			: has(this.opts, 'entities')
			? (this._entity = [...this.opts.entities])
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
		 * set connection opts
		 */
		this.opts = {
			...this.opts,
			entities: isArray(this._entity) ? this._entity : [this._entity],
		};
		/**
		 * create connection using this.opts & initialize db connection
		 */
		const db = await this.connectionManager.create(this.opts);
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
					if (!dataSource) throw new Error(`DataSource is not set for this entity.`);
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
				// 'getRepository', // causing issue with typeormdbadapter class getRepository
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
			].forEach((method) => {
				/**
				 * add base entity methods to this.adapter if index === 0
				 * or add additional methods to methods object
				 */
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
				? (this[entityName] = {
						...methodsToAdd,
						findById: this.findById,
						findByIds: this.findByIds,
						list: this.list,
						transformDocuments: this.transformDocuments,
						filterFields: this.filterFields,
						excludeFields: this.excludeFields,
						_excludeFields: this._excludeFields,
						populateDocs: this.populateDocs,
						validateEntity: this.validateEntity,
						entityToObject: this.entityToObject,
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
		this.repository = db.getRepository(isArray(this._entity) ? this._entity[0] : this._entity!);
		// this.repository = db.getRepository(entityArrray[0]);

		/**
		 * set datasource on this.adapter
		 */
		this.dataSource = db;
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

	/**
	 * Gets item by id. Can use find options
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @param {Object} findOptions - find options, like relations, order, etc. No where clause
	 * @returns {Promise<T | undefined>}
	 *
	 */
	async findByIdWO<T extends Entity>(
		key: string,
		id: string | number,
		findOptions?: FindOneOptions<T>,
	): Promise<T | undefined> {
		return await this['findOne']({ where: { [key]: In([id]) }, ...findOptions });
	}

	/**
	 * Gets item by id. No find options
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	async findById<T extends Entity>(key: string, id: string | number): Promise<T | undefined> {
		return await this['findOneBy']({ [key]: In([id]) });
	}

	/**
	 * Gets items by id.
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	async findByIds<T extends Entity>(key: string, ids: any[]): Promise<T | undefined> {
		return await this['findBy']({ [key]: In([...ids]) });
	}

	/**
	 * List entities by filters and pagination results.
	 *
	 * @methods
	 *
	 * @param {Context} ctx - Context instance.
	 * @param {Object?} params - Parameters.
	 *
	 * @returns {Object} List of found entities and count.
	 */
	list(ctx: any, params: any) {
		let countParams = Object.assign({}, params);
		// Remove pagination params
		if (countParams && countParams.limit) countParams.limit = null;
		if (countParams && countParams.offset) countParams.offset = null;
		if (params.limit == null) {
			if (this.settings.limit > 0 && params.pageSize > this.settings.limit)
				params.limit = this.settings.limit;
			else params.limit = params.pageSize;
		}
		return all([
			// Get rows
			this.adapter.find(params),
			// Get count of all rows
			this.adapter.count(countParams),
		]).then((res) => {
			return this.transformDocuments(ctx, params, res[0]).then((docs: any) => {
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
					totalPages: Math.floor((res[1] + params.pageSize - 1) / params.pageSize),
				};
			});
		});
	}

	/**
	 * Transform the fetched documents
	 * @methods
	 * @param {Context} ctx
	 * @param {Object} 	params
	 * @param {Array|Object} docs
	 * @returns {Array|Object}
	 */
	transformDocuments(ctx: any, params: any, docs: any) {
		let isDoc = false;
		if (!Array.isArray(docs)) {
			if (isObject(docs)) {
				isDoc = true;
				docs = [docs];
			} else return resolve(docs);
		}

		return (
			resolve(docs)
				// Convert entity to JS object
				.then((docs) => docs.map((doc: any) => this.adapter.entityToObject(doc)))

				// Apply idField
				.then((docs) =>
					docs.map((doc: any) =>
						this.adapter.afterRetrieveTransformID(doc, this.settings.idField),
					),
				)
				// Encode IDs
				.then((docs) =>
					docs.map((doc: { [x: string]: any }) => {
						doc[this.settings.idField] = this.encodeID(doc[this.settings.idField]);
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
							this.filterFields(item, this.settings.fields),
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
						this.settings.excludeFields || [],
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
		);
	}

	/**
	 * Filter fields in the entity object
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Filter properties of model.
	 * @returns	{Object}
	 */
	filterFields(doc: any, fields: any[]) {
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
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Exclude properties of model.
	 * @returns	{Object}
	 */
	excludeFields(doc: any, fields: string | any[]) {
		if (Array.isArray(fields) && fields.length > 0) {
			return this._excludeFields(doc, fields);
		}

		return doc;
	}

	/**
	 * Exclude fields in the entity object. Internal use only, must ensure `fields` is an Array
	 */
	_excludeFields(doc: any, fields: any[]) {
		const res = cloneDeep(doc);
		fields.forEach((field) => {
			unset(res, field);
		});
		return res;
	}

	/**
	 * Populate documents.
	 *
	 * @param {Context} 		ctx
	 * @param {Array|Object} 	docs
	 * @param {Array?}			populateFields
	 * @returns	{Promise}
	 */
	populateDocs(ctx: any, docs: any, populateFields?: any[]) {
		if (
			!this.settings.populates ||
			!Array.isArray(populateFields) ||
			populateFields.length == 0
		)
			return resolve(docs);

		if (docs == null || (!isObject(docs) && !Array.isArray(docs))) return resolve(docs);

		const settingPopulateFields = Object.keys(this.settings.populates);

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
			let rule = this.settings.populates[populatesField];
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
	 */
	validateEntity(entity: any) {
		if (!isFunction(this.settings.entityValidator)) return resolve(entity);

		let entities = Array.isArray(entity) ? entity : [entity];
		return all(entities.map((entity) => this.settings.entityValidator.call(this, entity))).then(
			() => entity,
		);
	}

	/**
	 * Convert DB entity to JSON object
	 *
	 * @param {any} entity
	 * @returns {Object}
	 * @memberof MemoryDbAdapter
	 */
	entityToObject(entity: any) {
		return entity;
	}

	/**
	 * Transforms 'idField' into NeDB's '_id'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	beforeSaveTransformID(entity: any, idField: string) {
		let newEntity = cloneDeep(entity);

		if (idField !== '_id' && entity[idField] !== undefined) {
			newEntity._id = newEntity[idField];
			delete newEntity[idField];
		}

		return newEntity;
	}

	/**
	 * Transforms NeDB's '_id' into user defined 'idField'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	afterRetrieveTransformID(entity: any, idField: string) {
		if (idField !== '_id') {
			entity[idField] = entity['_id'];
			delete entity._id;
		}
		return entity;
	}
}
