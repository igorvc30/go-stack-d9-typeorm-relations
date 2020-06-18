import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';

@Entity('orders_products')
class OrdersProducts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => Order, order => order.order_products)
  @JoinColumn()
  order: Order;

  @ManyToOne(type => Product, product => product.order_products)
  @JoinColumn()
  product: Product;

  @RelationId((ordersProducts: OrdersProducts) => ordersProducts.product)
  product_id: string;

  @RelationId((ordersProducts: OrdersProducts) => ordersProducts.order)
  order_id: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}

export default OrdersProducts;
