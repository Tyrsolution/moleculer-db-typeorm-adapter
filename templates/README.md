![Moleculer logo](http://moleculer.services/images/banner.png)

<!-- [![Build Status](https://travis-ci.org/tyrsolution/moleculer-db-typeorm-adapter.svg?branch=master)](https://travis-ci.org/tyrsolution/moleculer-db-typeorm-adapter) -->
[![Coverage Status](https://coveralls.io/repos/github/tyrsolution/moleculer-db-typeorm-adapter/badge.svg?branch=master)](https://coveralls.io/github/tyrsolution/moleculer-db-typeorm-adapter?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/tyrsolution/moleculer-db-typeorm-adapter/badge.svg)](https://snyk.io/test/github/tyrsolution/moleculer-db-typeorm-adapter)

# @tyrsolutions/moleculer-db-typeorm-adapter [![NPM version](https://img.shields.io/npm/v/@tyrsolutions/moleculer-db-typeorm-adapter.svg)](https://www.npmjs.com/package/@tyrsolutions/moleculer-db-typeorm-adapter)
A TypeORM adapter for moleculer


## Features

- All supported TypeORM databases
- Active Record methodology for entities or data mapping methodology if entity class doesn't extend TypeORM BaseEntity built in
- Connection Manager - manage your existing connections or create new ones to different database systems on the same service.
- All entities added to TypeORMDbAdapter and model array are added to this.adapter
  - Base entity ```this.adapter```
  - any aditional entity ```this.adapter.<entity name>```
- Repository and entityManager surfaced for ```this.adapter``` and additional entities ```this.adapter.<entity name>``` if more advanced TypeORM features are required
- Database connection starts and stops when service does

## Install
#### NPM
```
npm install moleculer-db @tyrsolutions/moleculer-db-typeorm-adapter --save
```
#### Yarn
```
yarn add moleculer-db @tyrsolutions/moleculer-db-typeorm-adapter
```

## Usage

In service schema:
```js
service: {
    ...
    adapter: new TypeORMDbAdapter({
        name: 'default',
        type: 'better-sqlite3',
        database: 'temp/test.db',
        synchronize: true,
        logging: ['query', 'error'],
        // entities: [TypeProduct], no longer needed entities are pulled from model and added
    }),

    model: TypeProduct || [TypeProduct, TypeProduct2], // accepts single entity or array of entities. Must be added to entities in TypeORMDbAdapter object
    ...
}
```

### Active Record
Entity:
```js
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User extends BaseEntity { // class extending BaseEntity
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean

    static findByName(firstName: string, lastName: string) {
        return this.createQueryBuilder("user")
            .where("user.firstName = :firstName", { firstName })
            .andWhere("user.lastName = :lastName", { lastName })
            .getMany()
    }
}
```
In service actions, methods, etc. (anywhere this.adapter can be used):
```js
const user = {
    "firstName": "John",
    "lastName": "Doe",
    "active": true
}
// no need to create new object with entity, just pass one
this.adapter.create(user)

// use static method functions from entity, no additional setup needed
this.adapter.findByName("John", "Doe")
```

### Data Mapping
Entity:
```js
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User { // class not extending BaseEntity
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}
```
In service actions, methods, etc. (anywhere this.adapter can be used):
```js
const user = new User()
user.firstName = "John";
user.lastName = "Doe";
user.active = true;

// no need to create new object with entity, just pass one
this.adapter.User.repository.create(user);
```

## Test
#### NPM
```
$ npm test
```
#### Yarn
```
yarn test
```

In development with watching

```
$ npm run ci
```

# Properties

<!-- AUTO-CONTENT-START:PROPERTIES -->

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

<!-- AUTO-CONTENT-END:CONNECTIONMANAGER -->

<!-- AUTO-CONTENT-TEMPLATE:CONNECTIONMANAGER
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



## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2023 Tyr Soluitons

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
