import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';

interface IProduct {
  id: string;
  quantity: number;
  product_id: string;
  price: number;
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
    let foundProducts: Array<Product> = [];
    try {
      foundProducts = await this.productsRepository.findAllById(products);
    } catch (error) {
      throw new AppError('Product not found.');
    }
    if (foundProducts.length !== products.length) {
      throw new AppError('Product not found.');
    }
    let producstOrder: Array<IProduct> = [];
    products.forEach(productOrder => {
      foundProducts.forEach(product => {
        if (productOrder.id === product.id) {
          if (productOrder.quantity > product.quantity) {
            throw new AppError('Insuficient product quantity.');
          }
          producstOrder.push({
            ...product,
            quantity: productOrder.quantity,
            product_id: product.id,
            price: product.price,
          });
          this.productsRepository.updateQuantity([
            {
              id: product.id,
              quantity: product.quantity - productOrder.quantity,
            },
          ]);
        }
      });
    });
    const order = this.ordersRepository.create({
      customer,
      products: producstOrder,
    });

    return order;
  }
}

export default CreateOrderService;
