# API

# Properties

<!-- AUTO-CONTENT-START:PROPERTIES -->
## `connectionManager` 

Grants access to the connection manager instance which is used to create and manage connections.
Called using this.adapter.connectionManager

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*



## `manager` 

Grants access to the entity manager of the connection.
Called using this.adapter.manager

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*



## `repository` 

Grants access to the entity repository of the connection.
Called using this.adapter.repository

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*


# Methods

<!-- AUTO-CONTENT-START:METHODS -->
## `init` 

Initialize adapter.
It will be called in `broker.start()` and is used internally.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `broker` | `ServiceBroker` | **required** |  |
| `service` | `Service` | **required** |  |


## `connect` 

Connects to database.
It will be called in `broker.start()` and is used internally.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*

### Results
**Type:** `Promise`


## `disconnect` 

Disconnects all connections from database and connection manager.
It will be called in `broker.stop()` and is used internally.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*

### Results
**Type:** `Promise`


## `findByIdWO` 

Gets item by id(s). Can use find options, no where clause.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | request context |
| `key` | `Partial.<T>` | **required** | primary db id column name |
| `id` | `string`, `number`, `Array.<string>`, `Array.<number>` | **required** | id(s) of entity |
| `findOptions` | `Object` | **required** | find options, like relations, order, etc. No where clause |

### Results
**Type:** `Promise.<(T|undefined)>`


## `findById` 

Gets item by id(s). No find options can be provided

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | request context |
| `key` | `Partial.<T>` | **required** | primary db id column name |
| `id` | `string`, `number`, `Array.<string>`, `Array.<number>` | **required** | id(s) of entity |

### Results
**Type:** `Promise.<(T|undefined)>`


## `getPopulations` 

Populates entity(ies) by id(s) of another record.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Context instance. |
| `params` | `Object` | - | Parameters. |

### Results
**Type:** `Object`, `Array.<Object>`

Found entity(ies).


## `findByIds` ![Deprecated action](https://img.shields.io/badge/status-deprecated-orange.svg) 

Gets multiple items by id.
No find options

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | request context |
| `key` | `Partial.<T>` | **required** | primary db id column name |
| `ids` | `Array.<string>`, `Array.<number>` | **required** | ids of entity |

### Results
**Type:** `Promise.<(T|undefined)>`


## `findByIdsWO` ![Deprecated action](https://img.shields.io/badge/status-deprecated-orange.svg) 

Gets multiple items by id.
Can use find options, no where clause.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | request context |
| `key` | `Partial.<T>` | **required** | primary db id column name |
| `ids` | `Array.<string>`, `Array.<number>` | **required** | ids of entity |
| `findOptions` | `Object` | **required** | find options, like relations, order, etc. No where clause |

### Results
**Type:** `Promise.<(T|undefined)>`


## `updateById` 

Update an entity by ID

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | request context |
| `id` | `any` | **required** | ID of record to be updated |
| `update` | `Object` | **required** | Object with update data |

### Results
**Type:** `Promise`

- Updated record


## `list` 

List entities from db using filters and pagination results.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Context instance. |
| `params` | `ListParams.<Object>` | - | Optional parameters. |

### Results
**Type:** `Object`

List of found entities and count.


## `beforeSaveTransformID` 

Transforms user defined idField into expected db id field name.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** | Record to be saved |
| `idField` | `String` | **required** | user defined service idField |

### Results
**Type:** `Object`

- Modified entity


## `afterRetrieveTransformID` 

Transforms db field name into user defined idField service property

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** | = Record retrieved from db |
| `idField` | `String` | **required** | user defined service idField |

### Results
**Type:** `Object`

- Modified entity


## `encodeID` 

Encode ID of entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`


## `toMongoObjectId` 

Convert id to mongodb ObjectId.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`


## `fromMongoObjectId` 

Convert mongodb ObjectId to string.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`


## `beforeQueryTransformID` 

Transform user defined idField service property into the expected id field of db.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `idField` | `any` | **required** | user defined service idField |

### Results
**Type:** `Object`

- Record to be saved


## `decodeID` 

Decode ID of entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`


## `transformDocuments` 

Transform the fetched documents by converting id to user defind idField,
filtering the fields according to the fields service property,
and populating the document with the relations specified in the populate service property.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Context of the request |
| `params` | `Object` | **required** | Params of the request |
| `docs` | `Array`, `Object` | **required** | Records to be transformed |

### Results
**Type:** `Array`, `Object`

- Transformed records


## `beforeEntityChange` 

Call before entity lifecycle events

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `type` | `String` | **required** |  |
| `entity` | `Object` | **required** |  |
| `ctx` | `Context` | **required** |  |

### Results
**Type:** `Promise`


## `entityChanged` 

Clear the cache & call entity lifecycle events

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `type` | `String` | **required** |  |
| `json` | `Object`, `Array.<Object>`, `Number` | **required** |  |
| `ctx` | `Context` | **required** |  |

### Results
**Type:** `Promise`


## `clearCache` 

Clear cached entities

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*

### Results
**Type:** `Promise`


## `filterFields` 

Filter fields in the entity object

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `doc` | `Object` | **required** | Record to be filtered. |
| `fields` | `Array.<String>` | **required** | Filter properties of model. |

### Results
**Type:** `Object`

- Filtered record


## `excludeFields` 

Exclude fields in the entity object

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `doc` | `Object` | **required** | Record to be filtered. |
| `fields` | `Array.<String>` | **required** | Exclude properties of model. |

### Results
**Type:** `Object`

- Recored without excluded fields


## `populateDocs` 

Populate documents for relations.
Used when relations between records between different databases can't be done.
Populates the retreived record by calling service action with the `id` of the relation.
Does not update related document at this time

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Request context |
| `docs` | `Array`, `Object` | **required** | Records to be populated |
| `populateFields` | `Array` | - | Fields to be populated |

### Results
**Type:** `Promise`

- Record with populated fields of relation


## `validateEntity` 

Validate an entity by validator.
Uses the `entityValidator` setting. If no validator function is supplied, returns record.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** | Record to be validated |

### Results
**Type:** `Promise`

- Validated record or unvalitaded record if no validator function is supplied.


## `entityToObject` 

Convert DB entity to JSON object

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `any` | **required** | Record to be converted |

### Results
**Type:** `Object`

- JSON object of record


## `authorizeFields` 

Authorize the required field list. Remove fields which does not exist in the `this.service.settings.fields`

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `askedFields` | `Array` | **required** | List of fields to be authorized |

### Results
**Type:** `Array`

- Authorized list of fields


## `sanitizeParams` 

Sanitize context parameters at `find` action.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Request context |
| `params` | `Object` | **required** | Request parameters |

### Results
**Type:** `Object`

- Sanitized parameters

***

# Connection Manager

<!-- AUTO-CONTENT-START:CONNECTIONMANAGER -->
## `connections` 

List of connections registered in this connection manager.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
*No input parameters.*

### Results
**Type:** `Array.<DataSource>`

- List of connections


## `has` 

Checks if connection with the given name exist in the manager.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `name` | `string` | **required** | Connection name |

### Results
**Type:** `boolean`

- True if connection exist, false otherwise


## `get` 

Gets registered connection with the given name.
If connection name is not given then it will get a default connection.
Throws error if connection with the given name was not found.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `name` | `string` | `"default"` | Connection name |

### Results
**Type:** `DataSource`

- Connection


## `remove` 

Removes registered connection with the given name.
If connection name is not given then it will get a default connection.
Throws error if connection with the given name was not found.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `name` | `string` | `"default"` | Connection name |



## `close` 

closes registered connection with the given name and removes it from
ConnectionManager.
If connection name is not given then it will get a default connection.
Throws error if connection with the given name was not found.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `name` | `string`, `Array.<string>` | `"default"` | Connection name |



## `create` 

Creates a new connection based on the given connection options and registers it in the manager.
Connection won't be established, you'll need to manually call connect method to establish connection.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `options` | `Object` | **required** | TypeORM data source connection options |
| `newConnection` | `boolean` | `false` | Toggle to create a new instance of TypeORMDbAdapter. |

### Results
**Type:** `Promise.<connection>`

- Connection
