import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class TypeProduct2 extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number | undefined;

	@Column()
	name!: string;

	@Column()
	quantity!: number;

	@Column()
	price!: number;

	@Column()
	active!: boolean;

	static findByName2(productName: string) {
		// @ts-ignore
		return this._createQueryBuilder('type_product')
			.where('type_product.name = :productName', { productName })
			.getMany();
	}
}
