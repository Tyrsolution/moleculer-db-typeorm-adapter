# Relations and Population

Relations and Population is handeled differently and seperately. At this time Relations are only supported for tables in the same database, not acoss different databases. Relations are also not supported with MongoDB. This is due to how TypeORM works. There is, however, the ability to populate returned record with data from other records from other databases using Population. At this time Population is not able to update records pulle for populaton, though this is planned in a future release.

## Relations
As with using TypeORM, relations are handled by passing them to the ```options``` argument of a method. The format for this is the same as used in TypeORM:

```js
{
    ...
    relations: {"createdBy": true,"lastModifiedBy": true}
}
```
For more information on relations plese refere to teh TypeORM [documenttion](https://typeorm.io/relations).
Relations can also be added as query paramater of an api call as well e.g. ```/api/v1/user/list?relations={"createdBy": true,"lastModifiedBy": true}```.

## Population
Population is handled by a customized method ```getPopulations```. It follows the moleculer methodology for population records with other records.  It is basically the same as moleculers popultion system, just customized to support TypeORM. As with the other TypeORM entity and manager methods, ```getPopulations``` is tied to the main entity of the adapter and each additional entity on the same adapter has it's own ```getPopulations``` method.
Population can be used with any entity and along side Relations when records need to be populated from other databases. This gives you the power to use Relations for tables within an sql database, then populate the returned record with records from a different database or database type like MongoDB for instance.

!> The attribute of the record to be populated must contain the ```id``` of the record to be retreived, otherwise population will not happen. Possibly in a future release a ```where``` clause could be used to add more flexability, but for now the ```id``` is a requirement.

```js
...
const result = await this.adapter.getPopulations(ctx, params);
...
```

or for additinal entities (tables) on adapter

```js
...
const result = await this.adapter.UserProfile.getPopulations(ctx, params);
...
```

As with moleculer, a populates object needs to be added to the service settings configuration:

```js
{
    settings: {
        ...
        fields: [
			'id',
			'login',
			'firstName',
			'lastName',
			'email',
			'langKey',
			'roles',
			'verificationToken',
			'active',
			'createdBy.id',
			'createdBy.login',
			'createdBy.firstName',
			'createdBy.lastName',
			'name',
			'quantity',
			'price',
			'createdDate',
			'lastModifiedBy',
			'lastModifiedDate',
		],
		// additional fields added to responses
		populates: {
			createdBy: {
				action: 'v1.user.id',
				params: { fields: ['id', 'login', 'firstName', 'lastName'] },
				// params: { fields: 'id login firstName lastName' },
			},
			lastModifiedBy: {
				action: 'v1.user.id',
				params: { fields: ['id', 'login', 'firstName', 'lastName'] },
			},
		},
    }
}
```

The ```getPopulations``` method will use the populates service settings object to call out to that service and retrieve the requested record, then replace the record to be populated with the retrieved record. For more information on population with moleculer, please refer to thier [documentation](https://moleculer.services/docs/0.14/moleculer-db.html#Populating).
