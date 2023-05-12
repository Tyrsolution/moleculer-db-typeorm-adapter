# Quick Start

## Install

The quickest way to get started with moleculer-db-typeorm-adapter is by installing it.

#### NPM
```
npm install @tyrsolutions/moleculer-db-typeorm-adapter --save
```
#### Yarn
```
yarn add @tyrsolutions/moleculer-db-typeorm-adapter
```
?> Moleculer-db is optional, though it's recomended so that this module will automaticallt start and stop with services. Without it you would need to code this yourself in service lifecycle started or stopped methods.

#### NPM
```
npm install moleculer-db --save
```
#### Yarn
```
yarn add moleculer-db
```
## Create your first connection
1. Add @tyrsolutions/moleculer-db-typeorm-adapter to your project by importing or requiring it:

   ?> The below example is using moleculer-db, moleculer-decorators-extended, TypeScript, tsconfig-paths and the adapter paramater setting

   ```js
    import { Service } from '@ourparentcenter/moleculer-decorators-extended';
    import DbService from 'moleculer-db';
    import TypeORMDbAdapter from '@tyrsolutions/moleculer-db-typeorm-adapter';
    import { UserEntity } from '@Entities';
    @Service({
        name: 'user',
        version: 1,
        mergeActions: true,
        adapter: new TypeORMDbAdapter({
            name: 'default',
            type: 'better-sqlite3',
            database: `temp/dbname_user.db`,
            synchronize: true,
            logging: ['query', 'error'],
        }),
        // model: UserEntity,
        model: [UserEntity],

        mixins: [DbService],
        /**
        * Settings
        */
        settings: {
            // internal id to use
            idField: '_id',
            pageSize: 10,
            // Base path
            rest: '/',
            // Available fields in the responses
            fields: [
                '_id',
                'login',
                'firstName',
                'lastName',
                'email',
                'langKey',
                'roles',
                'verificationToken',
                'active',
                'createdBy._id',
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
                    // params: { fields: 'login firstName lastName' },
                },
                lastModifiedBy: {
                    action: 'v1.user.id',
                    params: { fields: ['id', 'login', 'firstName', 'lastName'] },
                },
            },
        },
    })
   ```

   !> Note the `adapter:` and `model:` fields are used here. If the datasource provided to `TypeORMDbAdapter()` has the `entities:` array specified then `model:` is not required. If a name is not provided in the datasource then it will be given a name of `default`. Each conneciton has a unique name and an error will be thrown if a conneciton is being created that has a name already stored in connection manager. The `idField: '_id'` has been set for internal app entity ID usage, so any results from database will be altered to the specified ID automatically. This means that the `fields:` array must be set for the specified internal ID as well in order for the ID field to show in results.

2. Create your entity
   The example below is a user entity that relates to itself for `createdBy` and `lastModifiedBy` fields.

   user.entity.ts
   ```js
    import {
        Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        DeleteDateColumn,
        Index,
        BaseEntity,
        OneToOne,
        JoinColumn,
        ManyToOne,
    } from 'typeorm';

    export interface IUser {
        id?: string;
        login?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        verificationToken?: string;
        active?: boolean;
        createdBy?: UserEntity;
        createdDate?: Date | null;
        lastModifiedBy?: any;
        lastModifiedDate?: Date | null;
        deletedDate?: Date | null;
    }

    @Entity('users')
    @Index(['login', 'email', 'verificationToken'], { unique: true })
    export class UserEntity extends BaseEntity implements IUser {
        @PrimaryGeneratedColumn('uuid')
        public id?: string;

        @Column()
        public login?: string;

        @Column()
        public password?: string;

        @Column()
        public firstName?: string;

        @Column()
        public lastName?: string;

        @Column()
        public email?: string;

        @Column({ nullable: true })
        public verificationToken?: string;

        @Column({ type: 'boolean', default: false })
        public active?: boolean;

        @ManyToOne('UserEntity', (user: UserEntity) => user.id, { cascade: true /* , eager: true */ })
        @JoinColumn({ name: 'createdBy' })
        public createdBy?: UserEntity;

        @CreateDateColumn()
        public createdDate?: Date;

        @ManyToOne('UserEntity', (user: UserEntity) => user.id, { cascade: true /* , eager: true */ })
        @JoinColumn({ name: 'lastModifiedBy' })
        public lastModifiedBy?: UserEntity;

        @UpdateDateColumn()
        public lastModifiedDate?: Date;

        @DeleteDateColumn()
        public deletedDate?: Date;

        static findByLogin(login: string) {
            return this.createQueryBuilder('users')
                .leftJoinAndSelect('users.createdBy', 'createdBy')
                .leftJoinAndSelect('users.lastModifiedBy', 'lastModifiedBy')
                .where('users.login = :login', { login })
                .getOne();
        }
    }
   ```

3. Use the adapter as you would any other moleculer adapter in a service.
   
   ```js
   this.adapter.findByLogin('JohnDoe')
   ```
   !> Note that in the above example we are referencing a method that we created on the user entity. We are able to do this because we're using Active Record as seen by the entity extending TypeORMs `BaseEntity`. This also means that all methods inherited from the `BaseEntity` are also available on `this.adapter` as well. In addition, Repository and Entity Manager are also available.
