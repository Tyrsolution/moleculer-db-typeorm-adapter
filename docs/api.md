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



<!-- AUTO-CONTENT-END:PROPERTIES -->

<!-- AUTO-CONTENT-TEMPLATE:PROPERTIES
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

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




## `getRepository` 

Gets current entity's Repository and returns it.
Needed for active record to work from base entity and
Uses this.entity which could be an entity or an array of entities.
If this._entity is an array, uses first entity in array for active record.
Used internally by this.adapter for base conection.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `this` | `T` | **required** |  |

### Results
**Type:** `Repository.<Entity>`




## `findByIdWO` 

Gets item by id. Can use find options

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `key` | `Partial.<T>` | **required** | primary column name |
| `id` | `string`, `number` | **required** | id of entity |
| `findOptions` | `Object` | **required** | find options, like relations, order, etc. No where clause |

### Results
**Type:** `Promise.<(T|undefined)>`




## `findById` 

Gets item by id. No find options

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `key` | `Partial.<T>` | **required** | primary column name |
| `id` | `string`, `number` | **required** | id of entity |

### Results
**Type:** `Promise.<(T|undefined)>`




## `findByIds` 

Gets items by id.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `key` | `Partial.<T>` | **required** | primary column name |
| `ids` | `Array.<string>`, `Array.<number>` | **required** | ids of entity |

### Results
**Type:** `Promise.<(T|undefined)>`




## `list` 

List entities by filters and pagination results.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** | Context instance. |
| `params` | `FindManyOptions.<Object>` | - | Optional parameters. |

### Results
**Type:** `Object`

List of found entities and count.


## `beforeSaveTransformID` 

Transforms 'idField' into expected db id field.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** |  |
| `idField` | `String` | **required** |  |

### Results
**Type:** `Object`

Modified entity


## `afterRetrieveTransformID` 

Transforms db field into user defined 'idField'

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** |  |
| `idField` | `String` | **required** |  |

### Results
**Type:** `Object`

Modified entity


## `encodeID` 

Encode ID of entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`




## `beforeQueryTransformID` 

Transform idField into the name of the id field in db

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `idField` | `any` | **required** |  |

### Results
**Type:** `any`




## `decodeID` 

Decode ID of entity.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |

### Results
**Type:** `any`




## `transformDocuments` 

Transform the fetched documents

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** |  |
| `params` | `Object` | **required** |  |
| `docs` | `Array`, `Object` | **required** |  |

### Results
**Type:** `Array`, `Object`




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
| `doc` | `Object` | **required** |  |
| `fields` | `Array.<String>` | **required** | Filter properties of model. |

### Results
**Type:** `Object`




## `excludeFields` 

Exclude fields in the entity object

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `doc` | `Object` | **required** |  |
| `fields` | `Array.<String>` | **required** | Exclude properties of model. |

### Results
**Type:** `Object`




## `populateDocs` 

Populate documents.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** |  |
| `docs` | `Array`, `Object` | **required** |  |
| `populateFields` | `Array` | - |  |

### Results
**Type:** `Promise`




## `validateEntity` 

Validate an entity by validator.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `Object` | **required** |  |

### Results
**Type:** `Promise`




## `entityToObject` 

Convert DB entity to JSON object

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `entity` | `any` | **required** |  |

### Results
**Type:** `Object`




## `authorizeFields` 

Authorize the required field list. Remove fields which is not exist in the `this.service.settings.fields`

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `askedFields` | `Array` | **required** |  |

### Results
**Type:** `Array`




## `updateById` 

Update an entity by ID

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `id` | `any` | **required** |  |
| `update` | `Object` | **required** |  |

### Results
**Type:** `Promise`




## `sanitizeParams` 

Sanitize context parameters at `find` action.

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `ctx` | `Context` | **required** |  |
| `params` | `Object` | **required** |  |

### Results
**Type:** `Object`




<!-- AUTO-CONTENT-END:METHODS -->

<!-- AUTO-CONTENT-TEMPLATE:METHODS
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

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
