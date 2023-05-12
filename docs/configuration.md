# Configuration

## Data Source

The data source object is what tells the adapter what database to use, can have conneciton details and entity information contained in it. This object is passed to TypeORM to create the database configuration. Details on database configurations for different systems can be foudn on the TypreORM project documentation [here](https://typeorm.io/data-source-options).

Below is an example of a data source object for better-sqlite3:
```js
{
    name: 'default',
    type: 'better-sqlite3',
    database: `temp/dbname_user.db`,
    synchronize: true,
    logging: ['query', 'error'],
}
```
The data source starts with a name property `default`. The name property can be what ever you choose, however it must be unique from the other connections in the connections store. The name property is how connections are selected from the connections store and when a name property is not added to the data source object a name of `default` is given. It is perfectly fine to leave the name property out of the object for your base connection of the moleculer service, though you will need to remember to name each new connection created that service otherwise the new connection will not be created and throw an error.

The `type` property tells the adapter which database driver to use. In the example we are using `better-sqlite3` as our driver which has a requirement to specify the `database` file location. For more information on data source see the TypeORm [documentation](https://typeorm.io/data-source) for it, though the majority of the usage explained on the documentation is already handled for you by the adapter.
