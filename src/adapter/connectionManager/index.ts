/*
 * moleculer-db-typeorm-adapter
 * Copyright (c) 2023 TyrSolutions (https://github.com/Tyrsolution/moleculer-db-typeorm-adapter)
 * MIT Licensed
 */
import { isArray } from 'lodash';
import {
	DataSource,
	DataSourceOptions,
	ConnectionNotFoundError,
	AlreadyHasActiveConnectionError,
} from 'typeorm';
import { Errors } from 'moleculer';

/**
 * ConnectionManager is used to store and manage multiple orm connections.
 * It also provides useful factory methods to simplify connection creation.
 *
 * @name ConnectionManager
 * @module Service
 *
 * @class ConnectionManager
 */
export default class ConnectionManager {
	/**
	 * List of connections registered in this connection manager.
	 *
	 * @public
	 * @returns {DataSource[]} - List of connections
	 *
	 * @connectionmanager
	 */
	get connections(): DataSource[] {
		return Array.from(this.connectionMap.values());
	}

	/**
	 * Internal lookup to quickly get from a connection name to the Connection object.
	 */
	private readonly connectionMap: Map<string, DataSource> = new Map();

	// -------------------------------------------------------------------------
	// Public Methods
	// -------------------------------------------------------------------------

	/**
	 * Checks if connection with the given name exist in the manager.
	 *
	 * @public
	 * @param {string} name - Connection name
	 * @returns {boolean} - True if connection exist, false otherwise
	 *
	 * @connectionmanager
	 */
	has(name: string): boolean {
		return this.connectionMap.has(name);
	}

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
	get(name: string = 'default'): DataSource {
		const connection = this.connectionMap.get(name);
		if (!connection) throw new ConnectionNotFoundError(name);

		return connection;
	}

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
	remove(name: string = 'default'): void {
		const connection = this.connectionMap.get(name);
		if (!connection) throw new ConnectionNotFoundError(name);
		this.connectionMap.delete(name);
	}

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
	async close(name: string | Array<string> = 'default'): Promise<boolean | Promise<boolean>[]> {
		const throwError = (name: string) => {
			throw new ConnectionNotFoundError(name);
		};
		const closeConnection = async (name: string) => {
			const connection: DataSource = this.connectionMap.get(name)!;
			await connection.destroy();
			this.remove(name);
		};
		return !isArray(name) && this.connectionMap.has(name)
			? await closeConnection(name)
					.then(() => {
						return true;
					})
					.catch(() => {
						return false;
					})
			: isArray(name)
			? name.map(async (connectionName: string) => {
					return this.connectionMap.has(connectionName)
						? await closeConnection(connectionName)
								.then(() => {
									return true;
								})
								.catch(() => {
									return false;
								})
						: throwError(connectionName);
			  })
			: throwError(name);
	}

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
	async create(options: DataSourceOptions): Promise<DataSource> {
		// check if such connection is already registered
		const existConnection = this.connectionMap.get(options.name || 'default');
		const throwError = () => {
			const error = new AlreadyHasActiveConnectionError(options.name || 'default');
			throw new Errors.MoleculerServerError(
				error.message,
				500,
				'ERR_CONNECTION_ALREADY_EXIST',
			);
		};
		/**
		 * array of entities
		 */
		// const entityArrray: any = options.entities;
		const dbConnection: any =
			existConnection && existConnection.isInitialized
				? throwError()
				: new DataSource(options);
		const activeConneciton: any = await dbConnection
			.initialize()
			.then((dataConnection: any) => dataConnection)
			.catch((err: any) => {
				throw new Errors.MoleculerServerError(err.message, 500, 'ERR_CONNECTION_CREATE');
			});

		// /**
		//  * get entity methods
		//  *
		//  * @param {Object} obj -- entity object
		//  * @returns {Array<string>}
		//  */
		// const entityMethods = (obj: { [key: string]: any } = {}) => {
		// 	const members = Object.getOwnPropertyNames(obj);
		// 	const methods = members.filter((el) => {
		// 		return typeof obj[el] === 'function';
		// 	});
		// 	return methods;
		// };

		// /**
		//  * add additional entities and methods to adapter
		//  * under entity name this.adapter.entityName
		//  */
		// entityArrray.forEach((entity: any, index: number) => {
		// 	const dbRepository = activeConneciton.getRepository(entity);
		// 	const entityName = dbRepository.metadata.name;
		// 	const methodNames = entityMethods(entity);
		// 	/**
		// 	 * object for entity methods to this.adapter.entityName
		// 	 * getRepository function required for this to work
		// 	 */
		// 	const methodsToAdd: { [key: string]: any } = {
		// 		manager: dbRepository.manager,
		// 		repository: dbRepository,
		// 		getRepository: function getRepository() {
		// 			const dataSource = dbConnection;
		// 			if (!dataSource) throw new Error(`DataSource is not set for this entity.`);
		// 			return dataSource.getRepository(entity);
		// 		},
		// 	};
		// 	/**
		// 	 * add base entity methods to this.adapter
		// 	 * or add additional methods to methods object
		// 	 */
		// 	methodNames.forEach((method) => {
		// 		index === 0
		// 			? (dbConnection[method] = entity[method])
		// 			: (methodsToAdd[method] = entity[method]);
		// 	});
		// 	/**
		// 	 * add entity local methods to this.adapter or methods object
		// 	 */

		// 	[
		// 		'hasId',
		// 		'save',
		// 		'remove',
		// 		'softRemove',
		// 		'recover',
		// 		'reload',
		// 		'useDataSource',
		// 		// 'getRepository', // causing issue with typeormdbadapter class getRepository
		// 		'target',
		// 		'getId',
		// 		'createQueryBuilder',
		// 		'create',
		// 		'merge',
		// 		'preload',
		// 		'insert',
		// 		'update',
		// 		'upsert',
		// 		'delete',
		// 		'count',
		// 		'countBy',
		// 		'sum',
		// 		'average',
		// 		'minimum',
		// 		'maximum',
		// 		'find',
		// 		'findBy',
		// 		'findAndCount',
		// 		'findAndCountBy',
		// 		'findOne',
		// 		'findOneBy',
		// 		'findOneOrFail',
		// 		'findOneByOrFail',
		// 		'query',
		// 		'clear',
		// 	].forEach((method) => {
		// 		/**
		// 		 * add base entity methods to this.adapter if index === 0
		// 		 * or add additional methods to methods object
		// 		 */
		// 		index === 0
		// 			? (dbConnection[method] = entity[method])
		// 			: (methodsToAdd[method] = entity[method]);
		// 	});
		// 	/**
		// 	 * apply entity methods object to this.adapter.entityName
		// 	 */
		// 	/* !entity['save']
		// 		? this.broker.logger.warn(
		// 				`Entity class ${entityName} does not extend TypeORM BaseEntity, use data mapping with this.adapter.repository instead of active record methodology.`,
		// 		  )
		// 		: */ index !== 0 ? (dbConnection[entityName] = { ...methodsToAdd }) : null;
		// });
		// create a new connection
		this.connectionMap.set(dbConnection.name, dbConnection);
		return Promise.resolve(activeConneciton);
	}
}
