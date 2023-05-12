# Usage

## Adapter

Usage for the adapter is fairly straight forward. After importing it into your service, use the class `TypeOrmDbAdapter` to pass a data source object to connect to a database

```js
...
name: 'user',
adapter: new TypeORMDbAdapter({
    name: 'default',
    type: 'better-sqlite3',
    database: `temp/dbname_user.db`,
    synchronize: true,
    logging: ['query', 'error'],
}), 
model: UserEntity,
...
```
The `model:` property is only needed if the `entities:` property array is not specified in the data source. The `model:` property accepts a non-array value or an array value. When dealing with entities on the adapter connection the thing to remember is that multiple entities on the data source are considered tables within that particular database. If you are wanting to connect to a different database, then use the conenction manager to create a new connection to that database instead of adding it to the data source of the current connetion.

To use the adapter in service, simply use `this.adapter` for the example above. If additional entities (tables) are included in the connection, each entity can be used by adding teh suffix of the entity name to the adapter `this.adapter.<entity>`. TypeORM methods for Active Record (TypeORM [BaseEntity](https://github.com/typeorm/typeorm/blob/d4607a86723eef07e62e6d7321a07f3ae5ed1f90/src/repository/BaseEntity.ts) methods) are mapped to the adapter for each entity and adhear to that entity context. Methods added to entities are also mapped to that entity context so methods for entity A will not be accessable on entity B. Entity methods can be called as `this.adapter.<entity>.<entity method>`. The adapter also maps `Repository`, `Entity Manager` and `connectionManager` to the entities. These are called in a similar way `this.adapter.<repository|manager|connectionManager>`. Configured connections start and stop with the service as long as `moleculer-db` mixin is used. If `moleculer-db` isn't used in the project, the connection will need to be manually initialized, connected, and closed.

```js
const productsConnection = await this.adapter.connectionManager?.create(
    {
        name: 'products',
        type: 'better-sqlite3',
        database: `temp/dbname_product.db`,
        synchronize: true,
        logging: [/* 'query', */ 'error'],
        entities: [ProductEntity],
    },
    true,
)!;
await productsConnection.init(this.broker, this);
await productsConnection.connect();
this.products = productsConnection;
```
!> Note that when manually using the adapter `broker` and `service` need to be passed to the init method `init(this.broker, this)` for the adapter to function correctly. Be sure to use `.close()` to close teh connection. If there are multiple entities configured in the datasource, pass the name or array of names to `.close()` and the connections will be closed.

## Connection Manager
The connection manager creates, gets, removes, lists, and closes connections. The connection store is service specific and static, so each service has and manages its own connections.

### List connections
To list alll connections on the current service use `this.adapter.connectionMamaner.get()`. This will produce an array of current connections on teh service both active and inactive.

### Get Connection
To get a connection on the current service use `this.adapter.connectionManager.get(<name of connection as string>)`. The connection returned will be the full connection that will need to be initialized and then connected if it is not alerady active.
```js
const usersConnection = this.adapter.connectionManager.get('UsersConnection');
usersConnection.findById('id', '5ec51b3d5b96f9b098655bda');
```

### Close connection
To close a connection, pass the connection name or an array of names to the `.close()` method.
```js
this.adapter.connectionManager.close('UsersConnection');
or
this.adapter.connectionManager.close(['UsersConnection', 'ProductsConenction']); 
```

### Has connection
You can check for a connection in the connection store by using the `.has()` method passing a connection name.
```js
this.adapter.connectionManager.has('UsersConnection');
```

### Remove connection
To remove a conneciton from the connectino store use `.remove()` method passing a conneciton name.
```js
this.adapter.connectionManager.remove('UsersConnection');
```

### Create connection
Create a new connection by using the `.create()` method that recieve 2 paramaters; data source object and boolean value;
```js
const productsConnection = await this.adapter.connectionManager?.create(
    {
        name: 'UsersConnection',
        type: 'better-sqlite3',
        database: `temp/dbname_users.db`,
        synchronize: true,
        logging: [/* 'query', */ 'error'],
        entities: [UserEntity],
    },
    true,
)!;
await productsConnection.init(this.broker, this);
await productsConnection.connect();
this.products = productsConnection;
```
The boolean value is used to tell the adapter that this is a new connection to a different database and whether or not to create a new instance of this adapter. The default value is `false` when the boolean value is not present and will create a connection that one would expect from using vanilla TypeORM without this adapter and all that it provides.

Adding `true` will create a new instance of this adapter with moleculer configuration and adapter class methods included.

?> When `true` is absent the adapter will still map additional entities to the connection to be used with `connction.<entity name>`, however connection manager is not present on the conneciton. The created connection is initialized for you, though closing the connection will require TypeORMs datasource `.destroy()` method found [here](https://typeorm.io/data-source-api).

The differences in connection objects are depicted below:

+ With `false` added: +
  
    ```js
    {
        '@instanceof': Symbol(DataSource),
        migrations: [],
        subscribers: [],
        entityMetadatas: [
            EntityMetadata {
            '@instanceof': Symbol(EntityMetadata),
            childEntityMetadatas: [],
            inheritanceTree: [Array],
            tableType: 'regular',
            withoutRowid: false,
            synchronize: true,
            hasNonNullableRelations: false,
            isJunction: false,
            isAlwaysUsingConstructor: true,
            isClosureJunction: false,
            hasMultiplePrimaryKeys: false,
            hasUUIDGeneratedColumns: true,
            ownColumns: [Array],
            columns: [Array],
            ancestorColumns: [],
            descendantColumns: [],
            nonVirtualColumns: [Array],
            ownerColumns: [],
            inverseColumns: [],
            generatedColumns: [Array],
            primaryColumns: [Array],
            ownRelations: [],
            relations: [],
            eagerRelations: [],
            lazyRelations: [],
            oneToOneRelations: [],
            ownerOneToOneRelations: [],
            oneToManyRelations: [],
            manyToOneRelations: [],
            manyToManyRelations: [],
            ownerManyToManyRelations: [],
            relationsWithJoinColumns: [],
            relationIds: [],
            relationCounts: [],
            foreignKeys: [],
            embeddeds: [],
            allEmbeddeds: [],
            ownIndices: [Array],
            indices: [Array],
            uniques: [],
            ownUniques: [],
            checks: [],
            exclusions: [],
            ownListeners: [],
            listeners: [],
            afterLoadListeners: [],
            beforeInsertListeners: [],
            afterInsertListeners: [],
            beforeUpdateListeners: [],
            afterUpdateListeners: [],
            beforeRemoveListeners: [],
            beforeSoftRemoveListeners: [],
            beforeRecoverListeners: [],
            afterRemoveListeners: [],
            afterSoftRemoveListeners: [],
            afterRecoverListeners: [],
            connection: [Circular *1],
            inheritancePattern: undefined,
            treeType: undefined,
            treeOptions: undefined,
            parentClosureEntityMetadata: undefined,
            tableMetadataArgs: [Object],
            target: [Function],
            expression: undefined,
            dependsOn: undefined,
            engine: undefined,
            database: undefined,
            givenTableName: 'products',
            targetName: 'ProductEntity',
            tableNameWithoutPrefix: 'products',
            tableName: 'products',
            name: 'ProductEntity',
            tablePath: 'products',
            orderBy: undefined,
            discriminatorValue: 'ProductEntity',
            treeParentRelation: undefined,
            treeChildrenRelation: undefined,
            createDateColumn: [ColumnMetadata],
            updateDateColumn: [ColumnMetadata],
            deleteDateColumn: [ColumnMetadata],
            versionColumn: undefined,
            discriminatorColumn: undefined,
            treeLevelColumn: undefined,
            nestedSetLeftColumn: undefined,
            nestedSetRightColumn: undefined,
            materializedPathColumn: undefined,
            objectIdColumn: undefined,
            propertiesMap: [Object]
            }
        ],
        entityMetadatasMap: Map(1) {
            [class ProductEntity extends BaseEntity] {
            dataSource: [Circular *1]
            } => EntityMetadata {
            '@instanceof': Symbol(EntityMetadata),
            childEntityMetadatas: [],
            inheritanceTree: [Array],
            tableType: 'regular',
            withoutRowid: false,
            synchronize: true,
            hasNonNullableRelations: false,
            isJunction: false,
            isAlwaysUsingConstructor: true,
            isClosureJunction: false,
            hasMultiplePrimaryKeys: false,
            hasUUIDGeneratedColumns: true,
            ownColumns: [Array],
            columns: [Array],
            ancestorColumns: [],
            descendantColumns: [],
            nonVirtualColumns: [Array],
            ownerColumns: [],
            inverseColumns: [],
            generatedColumns: [Array],
            primaryColumns: [Array],
            ownRelations: [],
            relations: [],
            eagerRelations: [],
            lazyRelations: [],
            oneToOneRelations: [],
            ownerOneToOneRelations: [],
            oneToManyRelations: [],
            manyToOneRelations: [],
            manyToManyRelations: [],
            ownerManyToManyRelations: [],
            relationsWithJoinColumns: [],
            relationIds: [],
            relationCounts: [],
            foreignKeys: [],
            embeddeds: [],
            allEmbeddeds: [],
            ownIndices: [Array],
            indices: [Array],
            uniques: [],
            ownUniques: [],
            checks: [],
            exclusions: [],
            ownListeners: [],
            listeners: [],
            afterLoadListeners: [],
            beforeInsertListeners: [],
            afterInsertListeners: [],
            beforeUpdateListeners: [],
            afterUpdateListeners: [],
            beforeRemoveListeners: [],
            beforeSoftRemoveListeners: [],
            beforeRecoverListeners: [],
            afterRemoveListeners: [],
            afterSoftRemoveListeners: [],
            afterRecoverListeners: [],
            connection: [Circular *1],
            inheritancePattern: undefined,
            treeType: undefined,
            treeOptions: undefined,
            parentClosureEntityMetadata: undefined,
            tableMetadataArgs: [Object],
            target: [Function],
            expression: undefined,
            dependsOn: undefined,
            engine: undefined,
            database: undefined,
            givenTableName: 'products',
            targetName: 'ProductEntity',
            tableNameWithoutPrefix: 'products',
            tableName: 'products',
            name: 'ProductEntity',
            tablePath: 'products',
            orderBy: undefined,
            discriminatorValue: 'ProductEntity',
            treeParentRelation: undefined,
            treeChildrenRelation: undefined,
            createDateColumn: [ColumnMetadata],
            updateDateColumn: [ColumnMetadata],
            deleteDateColumn: [ColumnMetadata],
            versionColumn: undefined,
            discriminatorColumn: undefined,
            treeLevelColumn: undefined,
            nestedSetLeftColumn: undefined,
            nestedSetRightColumn: undefined,
            materializedPathColumn: undefined,
            objectIdColumn: undefined,
            propertiesMap: [Object]
            }
        },
        name: 'products',
        options: {
            name: 'products',
            type: 'better-sqlite3',
            database: 'temp/dbname_product.db',
            synchronize: true,
            logging: [ 'error' ],
            entities: [ [Function] ]
        },
        logger: AdvancedConsoleLogger { options: [ 'error' ] },
        driver: <ref *2> BetterSqlite3Driver {
            isReplicated: false,
            treeSupport: true,
            transactionSupport: 'nested',
            supportedDataTypes: [
            'int',               'integer',
            'tinyint',           'smallint',
            'mediumint',         'bigint',
            'unsigned big int',  'int2',
            'int8',              'integer',
            'character',         'varchar',
            'varying character', 'nchar',
            'native character',  'nvarchar',
            'text',              'clob',
            'text',              'blob',
            'real',              'double',
            'double precision',  'float',
            'real',              'numeric',
            'decimal',           'boolean',
            'date',              'time',
            'datetime',          'json'
            ],
            supportedUpsertTypes: [ 'on-conflict-do-update' ],
            withLengthColumnTypes: [
            'character',
            'varchar',
            'varying character',
            'nchar',
            'native character',
            'nvarchar',
            'text',
            'blob',
            'clob'
            ],
            spatialTypes: [],
            withPrecisionColumnTypes: [
            'real',
            'double',
            'double precision',
            'float',
            'real',
            'numeric',
            'decimal',
            'date',
            'time',
            'datetime'
            ],
            withScaleColumnTypes: [
            'real',
            'double',
            'double precision',
            'float',
            'real',
            'numeric',
            'decimal'
            ],
            mappedDataTypes: {
            createDate: 'datetime',
            createDateDefault: "datetime('now')",
            updateDate: 'datetime',
            updateDateDefault: "datetime('now')",
            deleteDate: 'datetime',
            deleteDateNullable: true,
            version: 'integer',
            treeLevel: 'integer',
            migrationId: 'integer',
            migrationName: 'varchar',
            migrationTimestamp: 'bigint',
            cacheId: 'int',
            cacheIdentifier: 'varchar',
            cacheTime: 'bigint',
            cacheDuration: 'int',
            cacheQuery: 'text',
            cacheResult: 'text',
            metadataType: 'varchar',
            metadataDatabase: 'varchar',
            metadataSchema: 'varchar',
            metadataTable: 'varchar',
            metadataName: 'varchar',
            metadataValue: 'text'
            },
            cteCapabilities: { enabled: true, requiresRecursiveHint: true },
            attachedDatabases: {},
            connection: [Circular *1],
            options: {
            name: 'products',
            type: 'better-sqlite3',
            database: 'temp/dbname_product.db',
            synchronize: true,
            logging: [Array],
            entities: [Array]
            },
            database: 'temp/dbname_product.db',
            sqlite: [Function: Database] { SqliteError: [Function: SqliteError] },
            databaseConnection: Database {
            name: 'temp/dbname_product.db',
            open: true,
            inTransaction: false,
            readonly: false,
            memory: false
            },
            queryRunner: BetterSqlite3QueryRunner {
            isReleased: false,
            isTransactionActive: false,
            data: {},
            loadedTables: [],
            loadedViews: [],
            sqlMemoryMode: false,
            sqlInMemory: [SqlInMemory],
            transactionDepth: 0,
            cachedTablePaths: {},
            transactionPromise: null,
            stmtCache: [Map],
            driver: [Circular *2],
            connection: [Circular *1],
            broadcaster: [Broadcaster],
            cacheSize: 100,
            manager: [EntityManager]
            }
        },
        manager: EntityManager {
            '@instanceof': Symbol(EntityManager),
            repositories: Map(0) {},
            treeRepositories: [],
            plainObjectToEntityTransformer: PlainObjectToNewEntityTransformer {},
            connection: [Circular *1]
        },
        namingStrategy: DefaultNamingStrategy {
            nestedSetColumnNames: { left: 'nsleft', right: 'nsright' },
            materializedPathColumnName: 'mpath'
        },
        metadataTableName: 'typeorm_metadata',
        queryResultCache: undefined,
        relationLoader: RelationLoader { connection: [Circular *1] },
        relationIdLoader: RelationIdLoader { connection: [Circular *1] },
        isInitialized: true
    }
    ```

+ With `true` added +
    ```js
    {
    connectionManager: ConnectionManager {
        connectionMap: Map(1) { 'products' => [DataSource] }
    },
    _entity: [
        [class ProductEntity extends BaseEntity] {
        dataSource: [DataSource]
        }
    ],
    dataSource: <ref *1> DataSource {
        '@instanceof': Symbol(DataSource),
        migrations: [],
        subscribers: [],
        entityMetadatas: [ [EntityMetadata] ],
        entityMetadatasMap: Map(1) { [Function] => [EntityMetadata] },
        name: 'products',
        options: {
        name: 'products',
        type: 'better-sqlite3',
        database: 'temp/dbname_product.db',
        synchronize: true,
        logging: [Array],
        entities: [Array]
        },
        logger: AdvancedConsoleLogger { options: [Array] },
        driver: BetterSqlite3Driver {
        isReplicated: false,
        treeSupport: true,
        transactionSupport: 'nested',
        supportedDataTypes: [Array],
        supportedUpsertTypes: [Array],
        withLengthColumnTypes: [Array],
        spatialTypes: [],
        withPrecisionColumnTypes: [Array],
        withScaleColumnTypes: [Array],
        mappedDataTypes: [Object],
        cteCapabilities: [Object],
        attachedDatabases: {},
        connection: [Circular *1],
        options: [Object],
        database: 'temp/dbname_product.db',
        sqlite: [Function],
        databaseConnection: [Database],
        queryRunner: [BetterSqlite3QueryRunner]
        },
        manager: EntityManager {
        '@instanceof': Symbol(EntityManager),
        repositories: [Map],
        treeRepositories: [],
        plainObjectToEntityTransformer: PlainObjectToNewEntityTransformer {},
        connection: [Circular *1]
        },
        namingStrategy: DefaultNamingStrategy {
        nestedSetColumnNames: [Object],
        materializedPathColumnName: 'mpath'
        },
        metadataTableName: 'typeorm_metadata',
        queryResultCache: undefined,
        relationLoader: RelationLoader { connection: [Circular *1] },
        relationIdLoader: RelationIdLoader { connection: [Circular *1] },
        isInitialized: true
    },
    manager: <ref *2> EntityManager {
        '@instanceof': Symbol(EntityManager),
        repositories: Map(1) { [Function] => [Repository] },
        treeRepositories: [],
        plainObjectToEntityTransformer: PlainObjectToNewEntityTransformer {},
        connection: <ref *1> DataSource {
        '@instanceof': Symbol(DataSource),
        migrations: [],
        subscribers: [],
        entityMetadatas: [Array],
        entityMetadatasMap: [Map],
        name: 'products',
        options: [Object],
        logger: [AdvancedConsoleLogger],
        driver: [BetterSqlite3Driver],
        manager: [Circular *2],
        namingStrategy: [DefaultNamingStrategy],
        metadataTableName: 'typeorm_metadata',
        queryResultCache: undefined,
        relationLoader: [RelationLoader],
        relationIdLoader: [RelationIdLoader],
        isInitialized: true
        }
    },
    repository: Repository {
        target: [class ProductEntity extends BaseEntity] {
        dataSource: [DataSource]
        },
        manager: <ref *2> EntityManager {
        '@instanceof': Symbol(EntityManager),
        repositories: [Map],
        treeRepositories: [],
        plainObjectToEntityTransformer: PlainObjectToNewEntityTransformer {},
        connection: [DataSource]
        },
        queryRunner: undefined
    },
    opts: {
        name: 'products',
        type: 'better-sqlite3',
        database: 'temp/dbname_product.db',
        synchronize: true,
        logging: [ 'error' ],
        entities: [ [Function] ]
    },
    broker: <ref *3> ServiceBroker {
        options: {
        namespace: 'testdevrepotemplate-dev',
        nodeID: 'atlas-development',
        metadata: {},
        logger: [Array],
        logLevel: 'info',
        transporter: null,
        cacher: null,
        serializer: 'JSON',
        requestTimeout: 10000,
        retryPolicy: false,
        maxCallLevel: 100,
        heartbeatInterval: 10,
        heartbeatTimeout: 30,
        contextParamsCloning: false,
        tracking: [Object],
        disableBalancer: false,
        registry: [Object],
        circuitBreaker: [Object],
        bulkhead: [Object],
        validator: true,
        metrics: [Object],
        tracing: [Object],
        middlewares: [Array],
        errorRegenerator: null,
        transit: [Object],
        uidGenerator: null,
        errorHandler: null,
        internalServices: true,
        internalMiddlewares: true,
        dependencyInterval: 1000,
        dependencyTimeout: 0,
        hotReload: true,
        replCommands: null,
        replDelimiter: null,
        skipProcessEventRegistration: false,
        maxSafeObjectSize: null
        },
        Promise: [Function: Promise] {
        method: [Function (anonymous)],
        delay: [Function (anonymous)],
        TimeoutError: [class TimeoutError extends ExtendableError],
        mapSeries: [Function (anonymous)]
        },
        started: true,
        stopping: false,
        ServiceFactory: [class Service],
        ContextFactory: [class Context],
        namespace: 'testdevrepotemplate-dev',
        metadata: {},
        nodeID: 'atlas-development',
        instanceID: 'c61a0c2a-bba6-49d5-a5c6-99ad880a5c3c',
        services: [
        [Service],
        [ApiService],
        [AuthService],
        [GreeterService],
        [GuardService],
        [ProductService],
        [UserService]
        ],
        localBus: EventEmitter {
        _events: {},
        _newListener: false,
        _removeListener: false,
        verboseMemoryLeak: false,
        _conf: [Object],
        _maxListeners: 100,
        wildcard: true,
        listenerTree: {}
        },
        loggerFactory: LoggerFactory {
        broker: [Circular *3],
        appenders: [Array],
        cache: [Map],
        opts: [Array]
        },
        logger: {
        fatal: [Function (anonymous)],
        error: [Function (anonymous)],
        warn: [Function (anonymous)],
        info: [Function (anonymous)],
        debug: [Function (anonymous)],
        trace: [Function (anonymous)],
        appenders: [Array]
        },
        metrics: MetricRegistry {
        broker: [Circular *3],
        logger: [Object],
        dirty: true,
        opts: [Object],
        store: [Map],
        reporter: [Array],
        collectTimer: Timeout {
            _idleTimeout: 5000,
            _idlePrev: [Timeout],
            _idleNext: [Timeout],
            _idleStart: 94390,
            _onTimeout: [Function (anonymous)],
            _timerArgs: undefined,
            _repeat: 5000,
            _destroyed: false,
            [Symbol(refed)]: false,
            [Symbol(kHasPrimitive)]: false,
            [Symbol(asyncId)]: 12,
            [Symbol(triggerId)]: 0
        }
        },
        middlewares: MiddlewareHandler {
        broker: [Circular *3],
        list: [Array],
        registeredHooks: [Object]
        },
        registry: Registry {
        broker: [Circular *3],
        metrics: [MetricRegistry],
        logger: [Object],
        opts: [Object],
        StrategyFactory: [class RoundRobinStrategy extends BaseStrategy],
        discoverer: [LocalDiscoverer],
        localNodeInfoInvalidated: 'seq',
        nodes: [NodeCatalog],
        services: [ServiceCatalog],
        actions: [ActionCatalog],
        events: [EventCatalog]
        },
        cacher: null,
        serializer: JSONSerializer { broker: [Circular *3] },
        errorRegenerator: Regenerator { broker: [Circular *3] },
        validator: FastestValidator {
        opts: [Object],
        validator: [Validator],
        broker: [Circular *3]
        },
        tracer: Tracer {
        broker: [Circular *3],
        logger: [Object],
        opts: [Object],
        sampleCounter: 0,
        defaultTags: null,
        exporter: [Array]
        },
        createService: [Function (anonymous)],
        registerLocalService: [Function: registerLocalService],
        destroyService: [Function: destroyService],
        call: [Function: bound ],
        callWithoutBalancer: [Function: bound ],
        mcall: [Function: mcall],
        emit: [Function: metricsMiddleware],
        broadcast: [Function: metricsMiddleware],
        broadcastLocal: [Function: metricsMiddleware],
        localServiceChanged: [Function: debounced] {
        cancel: [Function: cancel],
        flush: [Function: flush]
        },
        _trackedContexts: [],
        CircuitBreakerStore: Map(0) {},
        _closeFn: [Function (anonymous)],
        runner: MoleculerRunner {
        watchFolders: [],
        flags: [Object],
        configFile: [Object],
        config: [Object],
        servicePaths: [],
        broker: [Circular *3],
        worker: undefined
        }
    },
    service: <ref *4> UserService {
        broker: <ref *3> ServiceBroker {
        options: [Object],
        Promise: [Function],
        started: true,
        stopping: false,
        ServiceFactory: [class Service],
        ContextFactory: [class Context],
        namespace: 'testdevrepotemplate-dev',
        metadata: {},
        nodeID: 'atlas-development',
        instanceID: 'c61a0c2a-bba6-49d5-a5c6-99ad880a5c3c',
        services: [Array],
        localBus: [EventEmitter],
        loggerFactory: [LoggerFactory],
        logger: [Object],
        metrics: [MetricRegistry],
        middlewares: [MiddlewareHandler],
        registry: [Registry],
        cacher: null,
        serializer: [JSONSerializer],
        errorRegenerator: [Regenerator],
        validator: [FastestValidator],
        tracer: [Tracer],
        createService: [Function (anonymous)],
        registerLocalService: [Function: registerLocalService],
        destroyService: [Function: destroyService],
        call: [Function: bound ],
        callWithoutBalancer: [Function: bound ],
        mcall: [Function: mcall],
        emit: [Function: metricsMiddleware],
        broadcast: [Function: metricsMiddleware],
        broadcastLocal: [Function: metricsMiddleware],
        localServiceChanged: [Function],
        _trackedContexts: [],
        CircuitBreakerStore: Map(0) {},
        _closeFn: [Function (anonymous)],
        runner: [MoleculerRunner]
        },
        Promise: [Function: Promise] {
        method: [Function (anonymous)],
        delay: [Function (anonymous)],
        TimeoutError: [class TimeoutError extends ExtendableError],
        mapSeries: [Function (anonymous)]
        },
        originalSchema: {
        name: 'user',
        constructOverride: true,
        skipHandler: false,
        mergeActions: true,
        version: 1,
        model: [Array],
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoidXNlciIsImlhdCI6MTYxNTA1NzgxMX0.R08mZex9AeiDQ9uJ1hdUoBtGJ2AJw-a27WUBeTQhghQ',
        mixins: [Array],
        settings: [Object],
        Promise: [Function],
        created: [Function: created],
        actions: [Object],
        started: [Function: startedService],
        stopped: [Function: serviceStopped]
        },
        name: 'user',
        version: 1,
        settings: {
        idField: '_id',
        pageSize: 10,
        rest: '/',
        JWT_SECRET: 'FF9912A0D4C13F32C1E7831DE21B409120EDC35EFEA236D633B42485DFA004C8',
        fields: [Array],
        populates: [Object],
        excludeFields: null,
        maxPageSize: 100,
        maxLimit: -1,
        entityValidator: null,
        useDotNotation: false,
        cacheCleanEventType: 'broadcast'
        },
        metadata: {
        '$category': 'database',
        '$description': 'Official Data Access service',
        '$official': true,
        '$package': [Object]
        },
        schema: {
        events: [Object],
        name: 'user',
        metadata: [Object],
        adapter: [TypeORMDbAdapter],
        settings: [Object],
        actions: [Object],
        methods: [Object],
        created: [Array],
        started: [Array],
        stopped: [Array],
        MemoryAdapter: [class MemoryDbAdapter],
        mixins: [Array],
        model: [Array],
        constructOverride: true,
        skipHandler: false,
        mergeActions: true,
        version: 1,
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoidXNlciIsImlhdCI6MTYxNTA1NzgxMX0.R08mZex9AeiDQ9uJ1hdUoBtGJ2AJw-a27WUBeTQhghQ',
        Promise: [Function]
        },
        fullName: 'v1.user',
        logger: {
        fatal: [Function (anonymous)],
        error: [Function (anonymous)],
        warn: [Function (anonymous)],
        info: [Function (anonymous)],
        debug: [Function (anonymous)],
        trace: [Function (anonymous)],
        appenders: [Array]
        },
        actions: {
        find: [Function (anonymous)],
        count: [Function (anonymous)],
        list: [Function (anonymous)],
        create: [Function (anonymous)],
        insert: [Function (anonymous)],
        get: [Function (anonymous)],
        update: [Function (anonymous)],
        remove: [Function (anonymous)],
        getUserId: [Function (anonymous)],
        activateUser: [Function (anonymous)],
        registerUser: [Function (anonymous)],
        loginUser: [Function (anonymous)],
        logout: [Function (anonymous)],
        createUser: [Function (anonymous)],
        getMe: [Function (anonymous)],
        getUser: [Function (anonymous)],
        updateUser: [Function (anonymous)],
        deleteUser: [Function (anonymous)],
        deleteManyUsers: [Function (anonymous)],
        listAllUsers: [Function (anonymous)]
        },
        events: { 'cache.clean.dbname.user': [Function (anonymous)] },
        connect: [Function: bound connect],
        disconnect: [Function: bound disconnect],
        sanitizeParams: [Function: bound sanitizeParams],
        getById: [Function: bound getById],
        beforeEntityChange: [Function: bound beforeEntityChange],
        entityChanged: [Function: bound entityChanged],
        clearCache: [Function: bound clearCache],
        transformDocuments: [Function: bound transformDocuments],
        filterFields: [Function: bound filterFields],
        excludeFields: [Function: bound excludeFields],
        _excludeFields: [Function: bound _excludeFields],
        authorizeFields: [Function: bound authorizeFields],
        populateDocs: [Function: bound populateDocs],
        validateEntity: [Function: bound validateEntity],
        encodeID: [Function: bound encodeID],
        decodeID: [Function: bound decodeID],
        _find: [Function: bound _find],
        _count: [Function: bound _count],
        _list: [Function: bound _list],
        _create: [Function: bound _create],
        _insert: [Function: bound _insert],
        _get: [Function: bound _get],
        _update: [Function: bound _update],
        _remove: [Function: bound _remove],
        _serviceSpecification: {
        name: 'user',
        version: 1,
        fullName: 'v1.user',
        settings: [Object],
        metadata: [Object],
        actions: [Object],
        events: [Object]
        },
        adapter: TypeORMDbAdapter {
        connectionManager: [ConnectionManager],
        _entity: [Array],
        dataSource: [DataSource],
        manager: [EntityManager],
        repository: [Repository],
        opts: [Object],
        broker: [ServiceBroker],
        service: [Circular *4],
        findByLogin: [Function: findByLogin],
        hasId: [Function: hasId],
        save: [Function: save],
        remove: [Function: remove],
        softRemove: [Function: softRemove],
        recover: undefined,
        reload: undefined,
        useDataSource: [Function: useDataSource],
        target: [Function],
        getId: [Function: getId],
        createQueryBuilder: [Function: createQueryBuilder],
        create: [Function: create],
        merge: [Function: merge],
        preload: [Function: preload],
        insert: [Function: insert],
        update: [Function: update],
        upsert: [Function: upsert],
        delete: [Function: delete],
        count: [Function: count],
        countBy: [Function: countBy],
        sum: [Function: sum],
        average: [Function: average],
        minimum: [Function: minimum],
        maximum: [Function: maximum],
        find: [Function: find],
        findBy: [Function: findBy],
        findAndCount: [Function: findAndCount],
        findAndCountBy: [Function: findAndCountBy],
        findOne: [Function: findOne],
        findOneBy: [Function: findOneBy],
        findOneOrFail: [Function: findOneOrFail],
        findOneByOrFail: [Function: findOneByOrFail],
        query: [Function: query],
        clear: [Function: clear]
        },
        __filename: 'E:\\typeormtestptoject\\server\\services\\userService\\index.ts',
        _trackedContexts: [],
        products: [Circular *5]
    },
    hasId: [Function: hasId],
    save: [Function: save],
    remove: [Function: remove],
    softRemove: [Function: softRemove],
    recover: undefined,
    reload: undefined,
    useDataSource: [Function: useDataSource],
    target: [class ProductEntity extends BaseEntity] {
        dataSource: <ref *1> DataSource {
        '@instanceof': Symbol(DataSource),
        migrations: [],
        subscribers: [],
        entityMetadatas: [Array],
        entityMetadatasMap: [Map],
        name: 'products',
        options: [Object],
        logger: [AdvancedConsoleLogger],
        driver: [BetterSqlite3Driver],
        manager: [EntityManager],
        namingStrategy: [DefaultNamingStrategy],
        metadataTableName: 'typeorm_metadata',
        queryResultCache: undefined,
        relationLoader: [RelationLoader],
        relationIdLoader: [RelationIdLoader],
        isInitialized: true
        }
    },
    getId: [Function: getId],
    createQueryBuilder: [Function: createQueryBuilder],
    create: [Function: create],
    merge: [Function: merge],
    preload: [Function: preload],
    insert: [Function: insert],
    update: [Function: update],
    upsert: [Function: upsert],
    delete: [Function: delete],
    count: [Function: count],
    countBy: [Function: countBy],
    sum: [Function: sum],
    average: [Function: average],
    minimum: [Function: minimum],
    maximum: [Function: maximum],
    find: [Function: find],
    findBy: [Function: findBy],
    findAndCount: [Function: findAndCount],
    findAndCountBy: [Function: findAndCountBy],
    findOne: [Function: findOne],
    findOneBy: [Function: findOneBy],
    findOneOrFail: [Function: findOneOrFail],
    findOneByOrFail: [Function: findOneByOrFail],
    query: [Function: query],
    clear: [Function: clear]
    }
    ```
