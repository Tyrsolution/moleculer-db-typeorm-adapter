/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
('use strict');
import moleculer, { ActionParams, Context } from 'moleculer';
import {
	Put,
	Method,
	Service,
	Post,
	Delete,
	Get,
} from '@ourparentcenter/moleculer-decorators-extended';

import DBService from 'moleculer-db';
import { TypeORMDbAdapter } from '../../src';
import { TypeProduct } from '../entities/product.entity';
import { TypeProduct2 } from '../entities/product2.entity';

const validateRoleBase: ActionParams = {
	name: { type: 'string', optional: true },
	quantity: { type: 'number', optional: true },
	price: { type: 'number', optional: true },
	active: { type: 'boolean', optional: true },
};

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'typeproducts',
	mergeActions: true,
	adapter: new TypeORMDbAdapter({
		// name: 'default',
		type: 'better-sqlite3',
		database: 'temp/test.db',
		synchronize: true,
		// logging: ['query', 'error'],
		entities: [TypeProduct, TypeProduct2],
	}),

	model: [TypeProduct, TypeProduct2],
	/**
	 * Service guard token
	 */
	// authToken: Config.PRODUCTS_AUTH_TOKEN,
	/**
	 * Mixins
	 */
	mixins: [DBService],
	/**
	 * Settings
	 */
	settings: {
		idField: '_id',
		// Available fields in the responses
		fields: ['_id', 'name', 'quantity', 'price', 'active'],
		// additional fields added to responses
		/* populates: {
			createdBy: {
				action: 'v1.user.id',
				params: { fields: ['_id', 'login', 'firstName', 'lastName'] },
				// params: { fields: 'login firstName lastName' },
			},
			lastModifiedBy: {
				action: 'v1.user.id',
				params: { fields: ['_id', 'login', 'firstName', 'lastName'] },
			},
		}, */
		// Base path
		rest: '/',
		// rest: '/v1/products',
		// Validator for the `create` & `insert` actions.
		/* entityValidator: {
			name: 'string|min:3',
			quantity: 'number|positive',
			price: 'number|positive',
			active: 'boolean',
		}, */
	},
	/**
	 * Action Hooks
	 */
	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
			// @ts-ignore
			create: (ctx: Context<{ price: number; quantity: number; active: boolean }>) => {
				if (!ctx.params.price) {
					ctx.params.price = 0;
				}
				if (!ctx.params.quantity) {
					ctx.params.quantity = 0;
				}
				if (!ctx.params.active) {
					ctx.params.active = false;
				}
			},
		},
	},
})
export default class ProductService extends moleculer.Service {
	@Post('/', {
		name: 'create',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		// roles: [UserRoleDefault.SUPERADMIN, UserRoleDefault.ADMIN],
		params: {
			...validateRoleBase,
		},
	})
	async createProduct(ctx: Context<any>) {
		await this.adapter.TypeProduct2.save({ ...ctx.params, name: 'testofotherentity' })
			.then(async (res: any) => {
				this.logger.debug(`♻ Product ${ctx.params.name} created on entity2 successfully.`);
				return res;
			})
			.catch((err: any) => {
				this.logger.debug(`♻ Product ${ctx.params.name} could not be created on entity2.`);
				throw new moleculer.Errors.MoleculerClientError('PRODUCT_NOT_CREATED', 500, err);
			});
		const test2 = await this.adapter.TypeProduct2.findByName2('testofotherentity');
		console.log('test2: ', test2);
		this.logger.debug(`♻ Attempting to create product...`);

		this.logger.debug(`♻ Creating product ${ctx.params.name}`);

		const result = await this.adapter
			.save(ctx.params)
			.then(async (res: any) => {
				this.logger.debug(`♻ Product ${ctx.params.name} created successfully.`);
				return res;
			})
			.catch((err: any) => {
				this.logger.debug(`♻ Product ${ctx.params.name} could not be created.`);
				throw new moleculer.Errors.MoleculerClientError('PRODUCT_NOT_CREATED', 500, err);
			});

		const test = await this.adapter.findByName('test2');
		console.log('test: ', test);

		this.logger.debug('♻ Returning new product: ', result);
		return result;
	}

	@Get('/:id', {
		name: 'get',
		restricted: ['api'],
		// roles: [UserRoleDefault.SUPERADMIN, UserRoleDefault.ADMIN],
		params: {
			id: { type: 'string', min: 3 },
		},
	})
	async getProductById(ctx: Context<any>) {
		const params = this.sanitizeParams(ctx, ctx.params);
		this.logger.debug(`♻ Attempting to get product with id ${params.id}`);
		const product = await this.adapter
			.find(params)
			.then((res: any) => {
				this.logger.debug(`♻ Product with id ${params.id} found`);
				return res;
			})
			.catch((err: any) => {
				this.logger.debug(`♻ Product with id ${params.id} not found`);
				throw new moleculer.Errors.MoleculerClientError('NOT_FOUND', 404, err);
			});
		this.logger.debug('♻ Returning role: ', product);
		return product;
	}

	@Put('/:id/quantity/increase', {
		name: 'increaseQuantity',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			// Id: 'string',
			id: 'string',
			value: ['number|integer|positive'],
		},
	})
	async increaseQuantity(ctx: Context<any>) {
		this.logger.debug('♻ Increasing product quantity to: ', ctx.params.value);
		const doc = await this.adapter.update(ctx.params.id, {
			quantity: ctx.params.value,
		});
		// .then((res: Record<string, unknown>) => res.value);
		const json = await this.transformDocuments(ctx, ctx.params, doc);
		await this.entityChanged('updated', json, ctx);
		return json;
	}
	@Put('/:id/quantity/decrease', {
		name: 'decreaseQuantity',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			id: 'string',
			value: ['number|integer|positive'],
		},
	})
	async decreaseQuantity(ctx: Context<any>) {
		this.logger.debug('♻ Decreasing product quantity to: ', ctx.params.value);
		const doc = await this.adapter.updateById(ctx.params.id, {
			$inc: { quantity: -ctx.params.value },
		});
		const json = await this.transformDocuments(ctx, ctx.params, doc);
		await this.entityChanged('updated', json, ctx);
		return json;
	}

	/**
	 * Fired after database connection establishing.
	 */
	@Method
	async afterConnected() {
		// After db connection
	}

	@Delete('/:id', {
		name: 'remove',
		restricted: ['api'],
		// roles: [UserRoleDefault.SUPERADMIN, UserRoleDefault.ADMIN],
		params: {
			id: { type: 'string', min: 1 },
		},
	})
	async removeProduct(ctx: Context<any>) {
		const { id } = ctx.params;
		console.log('id', id);
		this.logger.debug('♻ Attempting to delete product...');
		return await this.adapter
			.delete(id)
			.then(async (record: any) => {
				this.logger.debug('♻ Product deleted successfully');
				return { recordsDeleted: record };
			})
			.catch((err: any) => {
				this.logger.error('♻ Product deletion error:', err);
				throw new moleculer.Errors.MoleculerClientError('DELETE_FAILED', 500, err);
			});
	}
}
