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
import TypeORMDbAdapter from '../../adapter';
import { resolve } from 'bluebird';

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
	 * @param {boolean} newConnection - Toggle to create a new instance of TypeORMDbAdapter.
	 * @returns {Promise<connection>} - Connection
	 *
	 * @connectionmanager
	 */
	async create(options: DataSourceOptions, newConnection: boolean = false): Promise<any> {
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

		let activeConneciton: any;
		if (newConnection && !existConnection) {
			return new TypeORMDbAdapter(options) as TypeORMDbAdapter<any>;
		} else {
			const dbConnection: any =
				existConnection && existConnection.isInitialized
					? throwError()
					: new DataSource(options);
			activeConneciton = await dbConnection
				.initialize()
				.then((dataConnection: any) => dataConnection)
				.catch((err: any) => {
					throw new Errors.MoleculerServerError(
						err.message,
						500,
						'ERR_CONNECTION_CREATE',
					);
				});

			// create a new connection
			this.connectionMap.set(dbConnection.name, dbConnection);
		}
		return resolve(activeConneciton);
	}
}
