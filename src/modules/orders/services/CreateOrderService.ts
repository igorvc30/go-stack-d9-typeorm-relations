import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError("The customer wasn't found.");
    }
    const foundProducts = await this.productsRepository.findAllById(products);
    let p = [];
    products.forEach(product => {
      foundProducts.forEach(o => {
        if (product.id === o.id) {
          p.push({
            ...o,
            quantity: product.quantity,
          });
        }
      });
    });
    // console.log(`ACHOU PRODUTOS: ${JSON.stringify(foundProducts)}`);
    const order = this.ordersRepository.create({
      customer,
      products: p,
    });

    return order;
  }
}

export default CreateOrderService;
