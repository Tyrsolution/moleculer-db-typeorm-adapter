'use strict';

import { ServiceBroker } from 'moleculer';
import ProductService from '../service/test.service';
import { rimraf } from 'rimraf';
import 'jest-extended';
import 'jest-chain';

describe('Test MyService', () => {
	const broker = new ServiceBroker({ logger: false, metrics: false });
	const service = broker.createService(ProductService);

	beforeAll(() => broker.start());
	afterAll(async () => {
		await broker.stop();
		await rimraf('temp');
	});

	it('should be created', () => {
		expect(service).toBeDefined();
	});

	it('should return with created object', () => {
		return broker
			.call('typeproducts.create', {
				name: 'test2',
				quantity: 5,
				price: 99,
				active: true,
			})
			.then((res) => {
				expect(res)
					.toBeDefined()
					.toBeObject()
					.toContainEntries([
						['name', 'test2'],
						['quantity', 5],
						['price', 99],
						['active', true],
						['id', expect.any(Number)],
					]);
			});
	});
});
