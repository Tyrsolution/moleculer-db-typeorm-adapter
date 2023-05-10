/*
 * moleculer-db-typeorm-adapter
 * Copyright (c) 2023 TyrSolutions (https://github.com/Tyrsolution/moleculer-db-typeorm-adapter)
 * MIT Licensed
 */
import { Service, ServiceBroker } from 'moleculer';
import {
	DataSource,
	DataSourceOptions,
	DeepPartial,
	DeleteResult,
	EntityManager,
	EntityTarget,
	FindManyOptions,
	FindOneOptions,
	FindOptionsWhere,
	InsertResult,
	ObjectId,
	ObjectLiteral,
	QueryRunner,
	RemoveOptions,
	Repository,
	SaveOptions,
	SelectQueryBuilder,
	UpdateResult,
} from 'typeorm';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

declare class ConnectionManager {
	/**
	 * List of connections registered in this connection manager.
	 *
	 * @public
	 * @returns {DataSource[]} - List of connections
	 *
	 * @connectionmanager
	 */
	get connections(): DataSource[];
	/**
	 * Internal lookup to quickly get from a connection name to the Connection object.
	 */
	private readonly connectionMap;
	/**
	 * Checks if connection with the given name exist in the manager.
	 *
	 * @public
	 * @param {string} name - Connection name
	 * @returns {boolean} - True if connection exist, false otherwise
	 *
	 * @connectionmanager
	 */
	has(name: string): boolean;
	/**
	 * Gets registered connection with the given name.
	 * If connection name is not given then it will get a default connection.
	 * Throws error if connection with the given name was not found.
	 *
	 * @public
	 * @param {string} name - Connection name
	 * @returns {DataSource} - Connection
	 *
	 * @connectionmanager
	 */
	get(name?: string): DataSource;
	/**
	 * Removes registered connection with the given name.
	 * If connection name is not given then it will get a default connection.
	 * Throws error if connection with the given name was not found.
	 *
	 * @public
	 * @param {string} name - Connection name
	 *
	 * @connectionmanager
	 */
	remove(name?: string): void;
	/**
	 * closes registered connection with the given name and removes it from
	 * ConnectionManager.
	 * If connection name is not given then it will get a default connection.
	 * Throws error if connection with the given name was not found.
	 *
	 * @public
	 * @param {string | Array<string>} name - Connection name
	 *
	 * @connectionmanager
	 */
	close(name?: string | Array<string>): Promise<boolean | Promise<boolean>[]>;
	/**
	 * Creates a new connection based on the given connection options and registers it in the manager.
	 * Connection won't be established, you'll need to manually call connect method to establish connection.
	 *
	 * @public
	 * @param {Object} options - TypeORM data source connection options
	 * @returns {Promise<connection>} - Connection
	 *
	 * @connectionmanager
	 */
	create(options: DataSourceOptions): Promise<DataSource>;
}

export interface DbAdapter<Entity extends ObjectLiteral> {
	[key: string]: any;
	/**
	 * TypeORM Entity Repository
	 */
	repository: Repository<Entity> | undefined;
	/**
	 * TypeORM Entity Manager
	 */
	manager: EntityManager | undefined;
	/**
	 * TypeORM Adapter Connection Manager
	 */
	connectionManager: ConnectionManager | undefined;
	/**
	 * Checks if entity has an id.
	 * If entity composite compose ids, it will check them all.
	 */
	hasId(entity: Entity): boolean;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Saves a given entity in the database.
	 * If entity does not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Saves a given entity in the database.
	 * If entity does not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>;
	/**
	 * Removes a given entities from the database.
	 */
	remove<T extends Entity>(entities: T[], options?: RemoveOptions): Promise<T[]>;
	/**
	 * Removes a given entity from the database.
	 */
	remove<T extends Entity>(entity: T, options?: RemoveOptions): Promise<T>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Records the delete date of a given entity.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Records the delete date of a given entity.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entity: T,
		options?: SaveOptions,
	): Promise<T & Entity>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Recovers a given entity in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Recovers a given entity in the database.
	 */
	recover<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>;
	/**
	 * Reloads entity data from the database.
	 */
	reload(): Promise<void>;
	/**
	 * Sets DataSource to be used by entity.
	 */
	useDataSource(dataSource: DataSource | null): void;
	/**
	 * Gets current entity's Repository.
	 */
	getRepository<T extends Entity>(this: T): Repository<T>;
	/**
	 * Returns object that is managed by this repository.
	 * If this repository manages entity from schema,
	 * then it returns a name of that schema instead.
	 */
	get target(): EntityTarget<any>;
	/**
	 * Gets entity mixed id.
	 */
	getId<T extends Entity>(entity: T): any;
	/**
	 * Creates a new query builder that can be used to build a SQL query.
	 */
	createQueryBuilder<T extends Entity>(
		alias?: string,
		queryRunner?: QueryRunner,
	): SelectQueryBuilder<T>;
	/**
	 * Creates a new entity instance.
	 */
	create<T extends Entity>(this: { new (): T }): T;
	/**
	 * Creates new entities and copies all entity properties from given objects into their new entities.
	 * Note that it copies only properties that are present in entity schema.
	 */
	create<T extends Entity>(entityLikeArray: DeepPartial<T>[]): T[];
	/**
	 * Creates a new entity instance and copies all entity properties from this object into a new entity.
	 * Note that it copies only properties that are present in entity schema.
	 */
	create<T extends Entity>(entityLike: DeepPartial<T>): T;
	/**
	 * Merges multiple entities (or entity-like objects) into a given entity.
	 */
	merge<T extends Entity>(mergeIntoEntity: T, ...entityLikes: DeepPartial<T>[]): T;
	/**
	 * Creates a new entity from the given plain javascript object. If entity already exist in the database, then
	 * it loads it (and everything related to it), replaces all values with the new ones from the given object
	 * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
	 * replaced from the new object.
	 *
	 * Note that given entity-like object must have an entity id / primary key to find entity by.
	 * Returns undefined if entity with given id was not found.
	 */
	preload<T extends Entity>(entityLike: DeepPartial<T>): Promise<T | undefined>;
	/**
	 * Inserts a given entity into the database.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT query.
	 * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
	 */
	insert<T extends Entity>(
		entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
	): Promise<InsertResult>;
	/**
	 * Updates entity partially. Entity can be found by a given conditions.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient UPDATE query.
	 * Does not check if entity exist in the database.
	 */
	update<T extends Entity>(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>,
		partialEntity: QueryDeepPartialEntity<T>,
	): Promise<UpdateResult>;
	/**
	 * Inserts a given entity into the database, unless a unique constraint conflicts then updates the entity
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT ... ON CONFLICT DO UPDATE/ON DUPLICATE KEY UPDATE query.
	 */
	upsert<T extends Entity>(
		entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
		conflictPathsOrOptions: string[] | UpsertOptions<T>,
	): Promise<InsertResult>;
	/**
	 * Deletes entities by a given criteria.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient DELETE query.
	 * Does not check if entity exist in the database.
	 */
	delete<T extends Entity>(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>,
	): Promise<DeleteResult>;
	/**
	 * Counts entities that match given options.
	 * Useful for pagination.
	 */
	count<T extends Entity>(options?: FindManyOptions<T>): Promise<number>;
	/**
	 * Counts entities that match given conditions.
	 * Useful for pagination.
	 */
	countBy<T extends Entity>(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number>;
	/**
	 * Return the SUM of a column
	 */
	sum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the AVG of a column
	 */
	average<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the MIN of a column
	 */
	minimum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the MAX of a column
	 */
	maximum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Finds entities that match given find options.
	 */
	find<T extends Entity>(options?: FindManyOptions<T>): Promise<T[]>;
	/**
	 * Finds entities that match given find options.
	 */
	findBy<T extends Entity>(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]>;
	/**
	 * Finds entities that match given find options.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCount<T extends Entity>(options?: FindManyOptions<T>): Promise<[T[], number]>;
	/**
	 * Finds entities that match given WHERE conditions.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCountBy<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<[T[], number]>;
	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - returns null.
	 */
	findOne<T extends Entity>(options: FindOneOptions<T>): Promise<T | null>;
	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - returns null.
	 */
	findOneBy<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<T | null>;
	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - rejects with error.
	 */
	findOneOrFail<T extends Entity>(options: FindOneOptions<T>): Promise<T>;
	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - rejects with error.
	 */
	findOneByOrFail<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<T>;
	/**
	 * Executes a raw SQL query and returns a raw database results.
	 * Raw query execution is supported only by relational databases (MongoDB is not supported).
	 */
	query<T extends Entity>(query: string, parameters?: any[]): Promise<any>;
	/**
	 * Clears all the data from the given table/collection (truncates/drops it).
	 *
	 * Note: this method uses TRUNCATE and may not work as you expect in transactions on some platforms.
	 * @see https://stackoverflow.com/a/5972738/925151
	 */
	clear<T extends Entity>(this: { new (): T }): Promise<void>;
	/** additional custom methods */
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
	findByIdWO<T extends Entity>(
		key?: string,
		id?: string | number,
		findOptions?: FindOneOptions<T>,
	): Promise<T | undefined>;

	/**
	 * Gets item by id. No find options
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	findById<T extends Entity>(key: string, id: string | number): Promise<T | undefined>;
	/**
	 * Gets items by id.
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	findByIds<T extends Entity>(key: string, ids: any[]): Promise<T | undefined>;
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
	list(ctx: any, params: any): Promise<any>;

	/**
	 * Transforms NeDB's '_id' into user defined 'idField'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	afterRetrieveTransformID(entity: any, idField: string): any;

	/**
	 * Encode ID of entity.
	 *
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 */
	encodeID(id: any): any;

	/**
	 * Decode ID of entity.
	 *
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 */
	decodeID(id: any): any;

	/**
	 * Transform the fetched documents
	 * @methods
	 * @param {Context} ctx
	 * @param {Object} 	params
	 * @param {Array|Object} docs
	 * @returns {Array|Object}
	 */
	transformDocuments(ctx: any, params: any, docs: any): any;

	/**
	 * Call before entity lifecycle events
	 *
	 * @methods
	 * @param {String} type
	 * @param {Object} entity
	 * @param {Context} ctx
	 * @returns {Promise}
	 */
	beforeEntityChange(type: string | undefined, entity: any, ctx: any): Promise<any>;

	/**
	 * Clear the cache & call entity lifecycle events
	 *
	 * @methods
	 * @param {String} type
	 * @param {Object|Array<Object>|Number} json
	 * @param {Context} ctx
	 * @returns {Promise}
	 */
	entityChanged(type: string | undefined, json: any, ctx: any): Promise<any>;
	/**
	 * Clear cached entities
	 *
	 * @methods
	 * @returns {Promise}
	 */
	clearCache(): Promise<any>;
	/**
	 * Filter fields in the entity object
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Filter properties of model.
	 * @returns	{Object}
	 */
	filterFields(doc: any, fields: any[]): any;
	/**
	 * Exclude fields in the entity object
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Exclude properties of model.
	 * @returns	{Object}
	 */
	excludeFields(doc: any, fields: string | any[]): any;

	/**
	 * Exclude fields in the entity object. Internal use only, must ensure `fields` is an Array
	 */
	_excludeFields(doc: any, fields: any[]): any;

	/**
	 * Populate documents.
	 *
	 * @param {Context} 		ctx
	 * @param {Array|Object} 	docs
	 * @param {Array?}			populateFields
	 * @returns	{Promise}
	 */
	populateDocs(ctx: any, docs: any, populateFields?: any[]): Promise<any>;
	/**
	 * Validate an entity by validator.
	 * @methods
	 * @param {Object} entity
	 * @returns {Promise}
	 */
	validateEntity(entity: any): Promise<any>;

	/**
	 * Convert DB entity to JSON object
	 *
	 * @param {any} entity
	 * @returns {Object}
	 * @memberof MemoryDbAdapter
	 */
	entityToObject(entity: any): any;

	/**
	 * Transforms 'idField' into NeDB's '_id'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	beforeSaveTransformID(entity: any, idField: string): any;
	/**
	 * Authorize the required field list. Remove fields which is not exist in the `this.settings.fields`
	 *
	 * @param {Array} askedFields
	 * @returns {Array}
	 */
	authorizeFields(askedFields: any[]): any[];
	/**
	 * Update an entity by ID
	 *
	 * @param {any} id
	 * @param {Object} update
	 * @returns {Promise}
	 * @memberof MemoryDbAdapter
	 */
	updateById(id: any, update: any): Promise<any>;
}

export default class TypeORMDbAdapter<Entity extends ObjectLiteral> implements DbAdapter<Entity> {
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
	private _entity;
	private dataSource;
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
	constructor(opts?: DataSourceOptions);
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
	init(broker: ServiceBroker, service: Service): void;
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
	connect(): Promise<any>;
	/**
	 * Disconnects all connections from database and connection manager.
	 * It will be called in `broker.stop()` and is used internally.
	 *
	 * @methods
	 * @public
	 *
	 * @returns {Promise}
	 */
	disconnect(): Promise<any>;
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
	getRepository<T extends this>(this: T): Repository<Entity>;
	/**
	 * Checks if entity has an id.
	 * If entity composite compose ids, it will check them all.
	 */
	hasId(entity: Entity): boolean;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Saves a given entity in the database.
	 * If entity does not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Saves a given entity in the database.
	 * If entity does not exist in the database then inserts, otherwise updates.
	 */
	save<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>;
	/**
	 * Removes a given entities from the database.
	 */
	remove<T extends Entity>(entities: T[], options?: RemoveOptions): Promise<T[]>;
	/**
	 * Removes a given entity from the database.
	 */
	remove<T extends Entity>(entity: T, options?: RemoveOptions): Promise<T>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Records the delete date of a given entity.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Records the delete date of a given entity.
	 */
	softRemove<T extends DeepPartial<Entity>>(
		entity: T,
		options?: SaveOptions,
	): Promise<T & Entity>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entities: T[],
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T[]>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entities: T[],
		options?: SaveOptions,
	): Promise<(T & Entity)[]>;
	/**
	 * Recovers a given entity in the database.
	 */
	recover<T extends DeepPartial<Entity>>(
		entity: T,
		options: SaveOptions & {
			reload: false;
		},
	): Promise<T>;
	/**
	 * Recovers a given entity in the database.
	 */
	recover<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity>;
	/**
	 * Reloads entity data from the database.
	 */
	reload(): Promise<void>;
	/**
	 * Sets DataSource to be used by entity.
	 */
	useDataSource(dataSource: DataSource | null): void;
	/**
	 * Gets current entity's Repository.
	 */
	getRepository<T extends Entity>(this: T): Repository<T>;
	/**
	 * Returns object that is managed by this repository.
	 * If this repository manages entity from schema,
	 * then it returns a name of that schema instead.
	 */
	get target(): EntityTarget<any>;
	/**
	 * Gets entity mixed id.
	 */
	getId<T extends Entity>(entity: T): any;
	/**
	 * Creates a new query builder that can be used to build a SQL query.
	 */
	createQueryBuilder<T extends Entity>(
		alias?: string,
		queryRunner?: QueryRunner,
	): SelectQueryBuilder<T>;
	/**
	 * Creates a new entity instance.
	 */
	create<T extends Entity>(this: { new (): T }): T;
	/**
	 * Creates new entities and copies all entity properties from given objects into their new entities.
	 * Note that it copies only properties that are present in entity schema.
	 */
	create<T extends Entity>(entityLikeArray: DeepPartial<T>[]): T[];
	/**
	 * Creates a new entity instance and copies all entity properties from this object into a new entity.
	 * Note that it copies only properties that are present in entity schema.
	 */
	create<T extends Entity>(entityLike: DeepPartial<T>): T;
	/**
	 * Merges multiple entities (or entity-like objects) into a given entity.
	 */
	merge<T extends Entity>(mergeIntoEntity: T, ...entityLikes: DeepPartial<T>[]): T;
	/**
	 * Creates a new entity from the given plain javascript object. If entity already exist in the database, then
	 * it loads it (and everything related to it), replaces all values with the new ones from the given object
	 * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
	 * replaced from the new object.
	 *
	 * Note that given entity-like object must have an entity id / primary key to find entity by.
	 * Returns undefined if entity with given id was not found.
	 */
	preload<T extends Entity>(entityLike: DeepPartial<T>): Promise<T | undefined>;
	/**
	 * Inserts a given entity into the database.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT query.
	 * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
	 */
	insert<T extends Entity>(
		entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
	): Promise<InsertResult>;
	/**
	 * Updates entity partially. Entity can be found by a given conditions.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient UPDATE query.
	 * Does not check if entity exist in the database.
	 */
	update<T extends Entity>(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>,
		partialEntity: QueryDeepPartialEntity<T>,
	): Promise<UpdateResult>;
	/**
	 * Inserts a given entity into the database, unless a unique constraint conflicts then updates the entity
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT ... ON CONFLICT DO UPDATE/ON DUPLICATE KEY UPDATE query.
	 */
	upsert<T extends Entity>(
		entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
		conflictPathsOrOptions: string[] | UpsertOptions<T>,
	): Promise<InsertResult>;
	/**
	 * Deletes entities by a given criteria.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient DELETE query.
	 * Does not check if entity exist in the database.
	 */
	delete<T extends Entity>(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>,
	): Promise<DeleteResult>;
	/**
	 * Counts entities that match given options.
	 * Useful for pagination.
	 */
	count<T extends Entity>(options?: FindManyOptions<T>): Promise<number>;
	/**
	 * Counts entities that match given conditions.
	 * Useful for pagination.
	 */
	countBy<T extends Entity>(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number>;
	/**
	 * Return the SUM of a column
	 */
	sum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the AVG of a column
	 */
	average<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the MIN of a column
	 */
	minimum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Return the MAX of a column
	 */
	maximum<T extends Entity>(
		columnName: PickKeysByType<T, number>,
		where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<number | null>;
	/**
	 * Finds entities that match given find options.
	 */
	find<T extends Entity>(options?: FindManyOptions<T>): Promise<T[]>;
	/**
	 * Finds entities that match given find options.
	 */
	findBy<T extends Entity>(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]>;
	/**
	 * Finds entities that match given find options.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCount<T extends Entity>(options?: FindManyOptions<T>): Promise<[T[], number]>;
	/**
	 * Finds entities that match given WHERE conditions.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCountBy<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<[T[], number]>;
	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - returns null.
	 */
	findOne<T extends Entity>(options: FindOneOptions<T>): Promise<T | null>;
	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - returns null.
	 */
	findOneBy<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<T | null>;
	/**
	 * Finds first entity by a given find options.
	 * If entity was not found in the database - rejects with error.
	 */
	findOneOrFail<T extends Entity>(options: FindOneOptions<T>): Promise<T>;
	/**
	 * Finds first entity that matches given where condition.
	 * If entity was not found in the database - rejects with error.
	 */
	findOneByOrFail<T extends Entity>(
		where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	): Promise<T>;
	/**
	 * Executes a raw SQL query and returns a raw database results.
	 * Raw query execution is supported only by relational databases (MongoDB is not supported).
	 */
	query<T extends Entity>(query: string, parameters?: any[]): Promise<any>;
	/**
	 * Clears all the data from the given table/collection (truncates/drops it).
	 *
	 * Note: this method uses TRUNCATE and may not work as you expect in transactions on some platforms.
	 * @see https://stackoverflow.com/a/5972738/925151
	 */
	clear<T extends Entity>(this: { new (): T }): Promise<void>;
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
	entityToObject(entity: any): object;
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
	beforeSaveTransformID(entity: Record<string, any>, idField: string): object;
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
	afterRetrieveTransformID(entity: Record<string, any>, idField: string): object;
	/** additional custom methods */
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
	findByIdWO<T extends Entity>(
		key?: string,
		id?: string | number,
		findOptions?: FindOneOptions<T>,
	): Promise<T | undefined>;

	/**
	 * Gets item by id. No find options
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {string | number} id - id of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	findById<T extends Entity>(key: string, id: string | number): Promise<T | undefined>;
	/**
	 * Gets items by id.
	 *
	 * @methods
	 * @param {Partial<T>} key - primary column name
	 * @param {Array<string> | Array<number>} ids - ids of entity
	 * @returns {Promise<T | undefined>}
	 *
	 */
	findByIds<T extends Entity>(key: string, ids: any[]): Promise<T | undefined>;
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
	list(ctx: any, params: any): Promise<any>;

	/**
	 * Transforms NeDB's '_id' into user defined 'idField'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	afterRetrieveTransformID(entity: any, idField: string): any;

	/**
	 * Encode ID of entity.
	 *
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 */
	encodeID(id: any): any;

	/**
	 * Decode ID of entity.
	 *
	 * @methods
	 * @param {any} id
	 * @returns {any}
	 */
	decodeID(id: any): any;

	/**
	 * Transform the fetched documents
	 * @methods
	 * @param {Context} ctx
	 * @param {Object} 	params
	 * @param {Array|Object} docs
	 * @returns {Array|Object}
	 */
	transformDocuments(ctx: any, params: any, docs: any): any;

	/**
	 * Call before entity lifecycle events
	 *
	 * @methods
	 * @param {String} type
	 * @param {Object} entity
	 * @param {Context} ctx
	 * @returns {Promise}
	 */
	beforeEntityChange(type: string | undefined, entity: any, ctx: any): Promise<any>;

	/**
	 * Clear the cache & call entity lifecycle events
	 *
	 * @methods
	 * @param {String} type
	 * @param {Object|Array<Object>|Number} json
	 * @param {Context} ctx
	 * @returns {Promise}
	 */
	entityChanged(type: string | undefined, json: any, ctx: any): Promise<any>;
	/**
	 * Clear cached entities
	 *
	 * @methods
	 * @returns {Promise}
	 */
	clearCache(): Promise<any>;
	/**
	 * Filter fields in the entity object
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Filter properties of model.
	 * @returns	{Object}
	 */
	filterFields(doc: any, fields: any[]): any;
	/**
	 * Exclude fields in the entity object
	 *
	 * @param {Object} 	doc
	 * @param {Array<String>} 	fields	Exclude properties of model.
	 * @returns	{Object}
	 */
	excludeFields(doc: any, fields: string | any[]): any;

	/**
	 * Exclude fields in the entity object. Internal use only, must ensure `fields` is an Array
	 */
	_excludeFields(doc: any, fields: any[]): any;

	/**
	 * Populate documents.
	 *
	 * @param {Context} 		ctx
	 * @param {Array|Object} 	docs
	 * @param {Array?}			populateFields
	 * @returns	{Promise}
	 */
	populateDocs(ctx: any, docs: any, populateFields?: any[]): Promise<any>;
	/**
	 * Validate an entity by validator.
	 * @methods
	 * @param {Object} entity
	 * @returns {Promise}
	 */
	validateEntity(entity: any): Promise<any>;

	/**
	 * Convert DB entity to JSON object
	 *
	 * @param {any} entity
	 * @returns {Object}
	 * @memberof MemoryDbAdapter
	 */
	entityToObject(entity: any): any;

	/**
	 * Transforms 'idField' into NeDB's '_id'
	 * @param {Object} entity
	 * @param {String} idField
	 * @memberof MemoryDbAdapter
	 * @returns {Object} Modified entity
	 */
	beforeSaveTransformID(entity: any, idField: string): any;
	/**
	 * Authorize the required field list. Remove fields which is not exist in the `this.settings.fields`
	 *
	 * @param {Array} askedFields
	 * @returns {Array}
	 */
	authorizeFields(askedFields: any[]): any[];
	/**
	 * Update an entity by ID
	 *
	 * @param {any} id
	 * @param {Object} update
	 * @returns {Promise}
	 * @memberof MemoryDbAdapter
	 */
	updateById(id: any, update: any): Promise<any>;
}
