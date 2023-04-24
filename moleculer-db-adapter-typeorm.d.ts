declare module 'moleculer-db-adapter-typeorm' {
	import type { Context, ServiceBroker, Service } from 'moleculer';
	import {
		DeleteResult,
		RemoveOptions,
		SaveOptions,
		DataSource,
		DeepPartial,
		EntityTarget,
		InsertResult,
		ObjectLiteral,
		Repository,
		SelectQueryBuilder,
		FindOptionsWhere,
		ObjectId,
		UpdateResult,
		FindManyOptions,
		FindOneOptions,
		DataSourceOptions,
		EntityManager,
	} from 'typeorm';
	import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
	import { UpsertOptions } from 'typeorm/repository/UpsertOptions';
	import { PickKeysByType } from 'typeorm/common/PickKeysByType';

	export interface TypeORMAdapter {
		/**
		 * Initialize adapter
		 *
		 * @param {ServiceBroker} broker
		 * @param {Service} service
		 * @memberof TypeORMDbAdapter
		 */
		init(broker: ServiceBroker, service: Service): void;
		/**
		 * Connect to database
		 *
		 * @returns {Promise}
		 * @memberof TypeORMDbAdapter
		 */
		connect(): Promise<void>;
		/**
		 * Disconnect from database
		 *
		 * @returns {Promise}
		 * @memberof TypeORMDbAdapter
		 */
		disconnect(): Promise<void>;

		hasId(entity?: any): boolean;

		/**
		 * Saves current entity in the database.
		 * If entity does not exist in the database then inserts, otherwise updates.
		 */
		save(options?: SaveOptions): Promise<object>;

		/**
		 * Removes current entity from the database.
		 */
		remove(options?: RemoveOptions): Promise<object>;

		/**
		 * Records the delete date of current entity.
		 */
		softRemove(options?: SaveOptions): Promise<object>;

		/**
		 * Recovers a given entity in the database.
		 */
		recover(options?: SaveOptions): Promise<object>;
		/**
		 * Reloads entity data from the database.
		 */
		reload(): Promise<void>;

		// -------------------------------------------------------------------------
		// Public Static Methods
		// -------------------------------------------------------------------------

		/**
		 * Gets current entity's Repository.
		 */
		getRepository<T extends ObjectLiteral>(this: T): Repository<T>;

		/**
		 * Returns object that is managed by this repository.
		 * If this repository manages entity from schema,
		 * then it returns a name of that schema instead.
		 */
		get target(): EntityTarget<any>;

		/**
		 * Gets entity mixed id.
		 */
		getId<T extends ObjectLiteral>(this: T, entity: T): any;

		/**
		 * Creates a new query builder that can be used to build a SQL query.
		 */
		createQueryBuilder<T extends ObjectLiteral>(this: T, alias?: string): SelectQueryBuilder<T>;

		/**
		 * Creates a new entity instance.
		 */
		create<T extends ObjectLiteral>(this: T): T;

		/**
		 * Creates a new entities and copies all entity properties from given objects into their new entities.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityLikeArray: DeepPartial<T>[]): T[];

		/**
		 * Creates a new entity instance and copies all entity properties from this object into a new entity.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityLike: DeepPartial<T>): T;

		/**
		 * Creates a new entity instance and copies all entity properties from this object into a new entity.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityOrEntities?: any): Promise<T | T[]>;

		/**
		 * Merges multiple entities (or entity-like objects) into a given entity.
		 */
		merge<T extends ObjectLiteral>(
			this: T,
			mergeIntoEntity: T,
			...entityLikes: DeepPartial<T>[]
		): T;

		/**
		 * Creates a new entity from the given plain javascript object. If entity already exist in the database, then
		 * it loads it (and everything related to it), replaces all values with the new ones from the given object
		 * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
		 * replaced from the new object.
		 *
		 * Note that given entity-like object must have an entity id / primary key to find entity by.
		 * Returns undefined if entity with given id was not found.
		 */
		preload<T extends ObjectLiteral>(
			this: T,
			entityLike: DeepPartial<T>,
		): Promise<T | undefined>;

		/**
		 * Saves all given entities in the database.
		 * If entities do not exist in the database then inserts, otherwise updates.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entities: DeepPartial<T>[],
			options?: SaveOptions,
		): Promise<T[]>;

		/**
		 * Saves a given entity in the database.
		 * If entity does not exist in the database then inserts, otherwise updates.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entity: DeepPartial<T>,
			options?: SaveOptions,
		): Promise<T>;

		/**
		 * Saves one or many given entities.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: DeepPartial<T> | DeepPartial<T>[],
			options?: SaveOptions,
		): Promise<T | T[]>;

		/**
		 * Removes a given entities from the database.
		 */
		remove<T extends ObjectLiteral>(
			this: T,
			entities: T[],
			options?: RemoveOptions,
		): Promise<T[]>;

		/**
		 * Removes a given entity from the database.
		 */
		remove<T extends ObjectLiteral>(this: T, entity: T, options?: RemoveOptions): Promise<T>;

		/**
		 * Removes one or many given entities.
		 */
		remove<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: T | T[],
			options?: RemoveOptions,
		): Promise<T | T[]>;

		/**
		 * Records the delete date of all given entities.
		 */
		softRemove<T extends ObjectLiteral>(
			this: T,
			entities: T[],
			options?: SaveOptions,
		): Promise<T[]>;

		/**
		 * Records the delete date of a given entity.
		 */
		softRemove<T extends ObjectLiteral>(this: T, entity: T, options?: SaveOptions): Promise<T>;

		/**
		 * Records the delete date of one or many given entities.
		 */
		softRemove<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: T | T[],
			options?: SaveOptions,
		): Promise<T | T[]>;

		/**
		 * Inserts a given entity into the database.
		 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient INSERT query.
		 * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
		 */
		insert<T extends ObjectLiteral>(
			this: T,
			entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
		): Promise<InsertResult>;

		/**
		 * Updates entity partially. Entity can be found by a given conditions.
		 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient UPDATE query.
		 * Does not check if entity exist in the database.
		 */
		update<T extends ObjectLiteral>(
			this: T,
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
		upsert<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
			conflictPathsOrOptions: string[] | UpsertOptions<T>,
		): Promise<InsertResult>;

		/**
		 * Deletes entities by a given criteria.
		 * Unlike remove method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient DELETE query.
		 * Does not check if entity exist in the database.
		 */
		delete<T extends ObjectLiteral>(
			this: T,
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
		 */
		count<T extends ObjectLiteral>(this: T, options?: FindManyOptions<T>): Promise<number>;

		/**
		 * Counts entities that match given WHERE conditions.
		 */
		countBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<number>;

		/**
		 * Return the SUM of a column
		 */
		sum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the AVG of a column
		 */
		average<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the MIN of a column
		 */
		minimum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the MAX of a column
		 */
		maximum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Finds entities that match given options.
		 */
		find<T extends ObjectLiteral>(this: T, options?: FindManyOptions<T>): Promise<T[]>;

		/**
		 * Finds entities that match given WHERE conditions.
		 */
		findBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T[]>;

		/**
		 * Finds entities that match given find options.
		 * Also counts all entities that match given conditions,
		 * but ignores pagination settings (from and take options).
		 */
		findAndCount<T extends ObjectLiteral>(
			this: T,
			options?: FindManyOptions<T>,
		): Promise<[T[], number]>;

		/**
		 * Finds entities that match given WHERE conditions.
		 * Also counts all entities that match given conditions,
		 * but ignores pagination settings (from and take options).
		 */
		findAndCountBy<T extends ObjectLiteral>(
			this: T,
			where: FindOptionsWhere<T>,
		): Promise<[T[], number]>;

		/**
		 * Finds entities by ids.
		 * Optionally find options can be applied.
		 *
		 * @deprecated use `findBy` method instead in conjunction with `In` operator, for example:
		 *
		 * .findBy({
		 *     id: In([1, 2, 3])
		 * })
		 */
		findByIds<T extends ObjectLiteral>(this: T, ids: any[]): Promise<T[]>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOne<T extends ObjectLiteral>(this: T, options: FindOneOptions<T>): Promise<T | null>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T | null>;

		/**
		 * Finds first entity that matches given options.
		 *
		 * @deprecated use `findOneBy` method instead in conjunction with `In` operator, for example:
		 *
		 * .findOneBy({
		 *     id: 1 // where "id" is your primary column name
		 * })
		 */
		findOneById<T extends ObjectLiteral>(
			this: T,
			id: string | number | Date | ObjectId,
		): Promise<T | null>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneOrFail<T extends ObjectLiteral>(this: T, options: FindOneOptions<T>): Promise<T>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneByOrFail<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T>;

		/**
		 * Executes a raw SQL query and returns a raw database results.
		 * Raw query execution is supported only by relational databases (MongoDB is not supported).
		 */
		query<T extends ObjectLiteral>(this: T, query: string, parameters?: any[]): Promise<any>;

		/**
		 * Clears all the data from the given table/collection (truncates/drops it).
		 */
		clear<T extends ObjectLiteral>(this: T): Promise<void>;

		/**
		 * Convert DB entity to JSON object
		 *
		 * @param {any} entity
		 * @returns {Object}
		 * @memberof DbAdapter
		 */
		entityToObject(entity: any): object;

		/**
		 * Transforms 'idField' into NeDB's '_id'
		 * @param {Object} entity
		 * @param {String} idField
		 * @memberof DbAdapter
		 * @returns {Object} Modified entity
		 */
		beforeSaveTransformID(entity: object, idField: string): object;

		/**
		 * Transforms NeDB's '_id' into user defined 'idField'
		 * @param {Object} entity
		 * @param {String} idField
		 * @memberof DbAdapter
		 * @returns {Object} Modified entity
		 */
		afterRetrieveTransformID(entity: object, idField: string): object;
	}

	export default class TypeORMDbAdapter<Entity extends ObjectLiteral> implements TypeORMAdapter {
		constructor(opts?: DataSourceOptions);
		/**
		 * Initialize adapter
		 *
		 * @param {ServiceBroker} broker
		 * @param {Service} service
		 * @memberof DbAdapter
		 */
		init(broker: ServiceBroker, service: Service): void;
		/**
		 * Connect to database
		 *
		 * @returns {Promise}
		 * @memberof DbAdapter
		 */
		connect(): Promise<void>;
		/**
		 * Disconnect from database
		 *
		 * @returns {Promise}
		 * @memberof DbAdapter
		 */
		disconnect(): Promise<void>;

		manager: EntityManager;

		repository: Repository<Entity>;

		hasId(entity?: any): boolean;

		/**
		 * Saves current entity in the database.
		 * If entity does not exist in the database then inserts, otherwise updates.
		 */
		save(options?: SaveOptions): Promise<object>;

		/**
		 * Removes current entity from the database.
		 */
		remove(options?: RemoveOptions): Promise<object>;

		/**
		 * Records the delete date of current entity.
		 */
		softRemove(options?: SaveOptions): Promise<object>;

		/**
		 * Recovers a given entity in the database.
		 */
		recover(options?: SaveOptions): Promise<object>;
		/**
		 * Reloads entity data from the database.
		 */
		reload(): Promise<void>;

		// -------------------------------------------------------------------------
		// Public Static Methods
		// -------------------------------------------------------------------------

		/**
		 * Gets current entity's Repository.
		 */
		getRepository<T extends ObjectLiteral>(this: T): Repository<T>;

		/**
		 * Returns object that is managed by this repository.
		 * If this repository manages entity from schema,
		 * then it returns a name of that schema instead.
		 */
		get target(): EntityTarget<any>;

		/**
		 * Gets entity mixed id.
		 */
		getId<T extends ObjectLiteral>(this: T, entity: T): any;

		/**
		 * Creates a new query builder that can be used to build a SQL query.
		 */
		createQueryBuilder<T extends ObjectLiteral>(this: T, alias?: string): SelectQueryBuilder<T>;

		/**
		 * Creates a new entity instance.
		 */
		create<T extends ObjectLiteral>(this: T): T;

		/**
		 * Creates a new entities and copies all entity properties from given objects into their new entities.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityLikeArray: DeepPartial<T>[]): T[];

		/**
		 * Creates a new entity instance and copies all entity properties from this object into a new entity.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityLike: DeepPartial<T>): T;

		/**
		 * Creates a new entity instance and copies all entity properties from this object into a new entity.
		 * Note that it copies only properties that present in entity schema.
		 */
		create<T extends ObjectLiteral>(this: T, entityOrEntities?: any): Promise<T | T[]>;

		/**
		 * Merges multiple entities (or entity-like objects) into a given entity.
		 */
		merge<T extends ObjectLiteral>(
			this: T,
			mergeIntoEntity: T,
			...entityLikes: DeepPartial<T>[]
		): T;

		/**
		 * Creates a new entity from the given plain javascript object. If entity already exist in the database, then
		 * it loads it (and everything related to it), replaces all values with the new ones from the given object
		 * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
		 * replaced from the new object.
		 *
		 * Note that given entity-like object must have an entity id / primary key to find entity by.
		 * Returns undefined if entity with given id was not found.
		 */
		preload<T extends ObjectLiteral>(
			this: T,
			entityLike: DeepPartial<T>,
		): Promise<T | undefined>;

		/**
		 * Saves all given entities in the database.
		 * If entities do not exist in the database then inserts, otherwise updates.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entities: DeepPartial<T>[],
			options?: SaveOptions,
		): Promise<T[]>;

		/**
		 * Saves a given entity in the database.
		 * If entity does not exist in the database then inserts, otherwise updates.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entity: DeepPartial<T>,
			options?: SaveOptions,
		): Promise<T>;

		/**
		 * Saves one or many given entities.
		 */
		save<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: DeepPartial<T> | DeepPartial<T>[],
			options?: SaveOptions,
		): Promise<T | T[]>;

		/**
		 * Removes a given entities from the database.
		 */
		remove<T extends ObjectLiteral>(
			this: T,
			entities: T[],
			options?: RemoveOptions,
		): Promise<T[]>;

		/**
		 * Removes a given entity from the database.
		 */
		remove<T extends ObjectLiteral>(this: T, entity: T, options?: RemoveOptions): Promise<T>;

		/**
		 * Removes one or many given entities.
		 */
		remove<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: T | T[],
			options?: RemoveOptions,
		): Promise<T | T[]>;

		/**
		 * Records the delete date of all given entities.
		 */
		softRemove<T extends ObjectLiteral>(
			this: T,
			entities: T[],
			options?: SaveOptions,
		): Promise<T[]>;

		/**
		 * Records the delete date of a given entity.
		 */
		softRemove<T extends ObjectLiteral>(this: T, entity: T, options?: SaveOptions): Promise<T>;

		/**
		 * Records the delete date of one or many given entities.
		 */
		softRemove<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: T | T[],
			options?: SaveOptions,
		): Promise<T | T[]>;

		/**
		 * Inserts a given entity into the database.
		 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient INSERT query.
		 * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
		 */
		insert<T extends ObjectLiteral>(
			this: T,
			entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
		): Promise<InsertResult>;

		/**
		 * Updates entity partially. Entity can be found by a given conditions.
		 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient UPDATE query.
		 * Does not check if entity exist in the database.
		 */
		update<T extends ObjectLiteral>(
			this: T,
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
		upsert<T extends ObjectLiteral>(
			this: T,
			entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
			conflictPathsOrOptions: string[] | UpsertOptions<T>,
		): Promise<InsertResult>;

		/**
		 * Deletes entities by a given criteria.
		 * Unlike remove method executes a primitive operation without cascades, relations and other operations included.
		 * Executes fast and efficient DELETE query.
		 * Does not check if entity exist in the database.
		 */
		delete<T extends ObjectLiteral>(
			this: T,
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
		 */
		count<T extends ObjectLiteral>(this: T, options?: FindManyOptions<T>): Promise<number>;

		/**
		 * Counts entities that match given WHERE conditions.
		 */
		countBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<number>;

		/**
		 * Return the SUM of a column
		 */
		sum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the AVG of a column
		 */
		average<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the MIN of a column
		 */
		minimum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Return the MAX of a column
		 */
		maximum<T extends ObjectLiteral>(
			this: T,
			columnName: PickKeysByType<T, number>,
			where: FindOptionsWhere<T>,
		): Promise<number | null>;

		/**
		 * Finds entities that match given options.
		 */
		find<T extends ObjectLiteral>(this: T, options?: FindManyOptions<T>): Promise<T[]>;

		/**
		 * Finds entities that match given WHERE conditions.
		 */
		findBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T[]>;

		/**
		 * Finds entities that match given find options.
		 * Also counts all entities that match given conditions,
		 * but ignores pagination settings (from and take options).
		 */
		findAndCount<T extends ObjectLiteral>(
			this: T,
			options?: FindManyOptions<T>,
		): Promise<[T[], number]>;

		/**
		 * Finds entities that match given WHERE conditions.
		 * Also counts all entities that match given conditions,
		 * but ignores pagination settings (from and take options).
		 */
		findAndCountBy<T extends ObjectLiteral>(
			this: T,
			where: FindOptionsWhere<T>,
		): Promise<[T[], number]>;

		/**
		 * Finds entities by ids.
		 * Optionally find options can be applied.
		 *
		 * @deprecated use `findBy` method instead in conjunction with `In` operator, for example:
		 *
		 * .findBy({
		 *     id: In([1, 2, 3])
		 * })
		 */
		findByIds<T extends ObjectLiteral>(this: T, ids: any[]): Promise<T[]>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOne<T extends ObjectLiteral>(this: T, options: FindOneOptions<T>): Promise<T | null>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneBy<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T | null>;

		/**
		 * Finds first entity that matches given options.
		 *
		 * @deprecated use `findOneBy` method instead in conjunction with `In` operator, for example:
		 *
		 * .findOneBy({
		 *     id: 1 // where "id" is your primary column name
		 * })
		 */
		findOneById<T extends ObjectLiteral>(
			this: T,
			id: string | number | Date | ObjectId,
		): Promise<T | null>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneOrFail<T extends ObjectLiteral>(this: T, options: FindOneOptions<T>): Promise<T>;

		/**
		 * Finds first entity that matches given conditions.
		 */
		findOneByOrFail<T extends ObjectLiteral>(this: T, where: FindOptionsWhere<T>): Promise<T>;

		/**
		 * Executes a raw SQL query and returns a raw database results.
		 * Raw query execution is supported only by relational databases (MongoDB is not supported).
		 */
		query<T extends ObjectLiteral>(this: T, query: string, parameters?: any[]): Promise<any>;

		/**
		 * Clears all the data from the given table/collection (truncates/drops it).
		 */
		clear<T extends ObjectLiteral>(this: T): Promise<void>;

		/**
		 * Convert DB entity to JSON object
		 *
		 * @param {any} entity
		 * @returns {Object}
		 * @memberof DbAdapter
		 */
		entityToObject(entity: any): object;

		/**
		 * Transforms 'idField' into NeDB's '_id'
		 * @param {Object} entity
		 * @param {String} idField
		 * @memberof DbAdapter
		 * @returns {Object} Modified entity
		 */
		beforeSaveTransformID(entity: object, idField: string): object;

		/**
		 * Transforms NeDB's '_id' into user defined 'idField'
		 * @param {Object} entity
		 * @param {String} idField
		 * @memberof DbAdapter
		 * @returns {Object} Modified entity
		 */
		afterRetrieveTransformID(entity: object, idField: string): object;
	}
}
