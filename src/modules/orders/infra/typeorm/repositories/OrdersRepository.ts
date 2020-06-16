import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;
  private orderProductsRepository: Repository<OrdersProducts>;

  constructor() {
    this.ormRepository = getRepository(Order);
    this.orderProductsRepository = getRepository(OrdersProducts);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const p: Array<OrdersProducts> = [];
    products.forEach(product => {
      p.push(
        this.orderProductsRepository.create({
          product,
          quantity: product.quantity,
          price: product.price,
        }),
      );
    });

    await this.orderProductsRepository.save(p);

    const order = this.ormRepository.create({
      customer,
      order_products: p,
    });

    await this.ormRepository.save(order);
    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.find({
      where: {
        id,
      },
    });
    return order[0] || undefined;
  }
}

export default OrdersRepository;
