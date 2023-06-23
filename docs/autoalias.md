# Auto Alias Schema

Moleculer has an auto alias feature with [moleculer-web](https://github.com/moleculerjs/moleculer-web) and [moleculer-db](https://github.com/moleculerjs/moleculer-db). This adapter builds off that by providing a few different ways to alter the service schema to have this adapters schema be presented by moleculer-web instead of moleculer-db.

## Mixin merging
If using the provided schema ```TAdapterServiceSchemaMixin``` to mix with ```moleculer-db``` then you will want to put this adapters schema in the mixins attribute before moleculer-db schema:

service.js:
```js
{
    ...
    mixins: [TAdapterServiceSchemaMixin(), DBService]
}
```
This will allow moleculer-web to server this adapters default alias rest methods for get, create, insert, update, remove, list out of the box for services when the ```autoAliases``` servie attribute is enabled.

## Schema merging
Schema merging allows you to merge a schema with this adapters schema. To do this, add the schema you would like merged inside of the methods brackets.

service.js:
```js
{
    ...
    mixins: [TAdapterServiceSchemaMixin(DBService)]
}
```

Above we are mering the moleculer-db schema with this adapters schema. This method is great when you would like to add additional methods directly on the service to be called in your actions or methods with ```this.method```.

## Drop in replacement
The schema this adapter provides can be used as a replacement of molecler-db as it is constructed the same and moleculer-db is not a requirement to use this adapter.

service.js:
```js
{
    ...
    mixins: [TAdapterServiceSchemaMixin()]
}
```
!> Note - that when you use this adapters schema, you will no longer have access to moleculer-dbs nedb database.
