import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../../modules/product/product.controller';
import { ProductService } from '../../../modules/product/product.service';

const mockProduct = {
  id: 1,
  name: 'iPhone 15',
  price: 5999.99,
  categories: [],
};

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    jest.clearAllMocks();
  });

  it('findAll deve chamar service.findAll sem filtro', async () => {
    mockService.findAll.mockResolvedValue([mockProduct]);
    const result = await controller.findAll();
    expect(result).toEqual([mockProduct]);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll deve chamar service.findAll com filtro de nome', async () => {
    mockService.findAll.mockResolvedValue([mockProduct]);
    await controller.findAll('iPhone');
    expect(mockService.findAll).toHaveBeenCalledWith('iPhone');
  });

  it('findOne deve chamar service.findOne com id correto', async () => {
    mockService.findOne.mockResolvedValue(mockProduct);
    const result = await controller.findOne(1);
    expect(result).toEqual(mockProduct);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('create deve chamar service.create com dto correto', async () => {
    mockService.create.mockResolvedValue(mockProduct);
    const dto = { name: 'iPhone 15', price: 5999.99, categoryIds: [1] };
    const result = await controller.create(dto);
    expect(result).toEqual(mockProduct);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update deve chamar service.update com id e dto corretos', async () => {
    mockService.update.mockResolvedValue({ ...mockProduct, price: 4999.99 });
    const result = await controller.update(1, { price: 4999.99 });
    expect(result.price).toBe(4999.99);
    expect(mockService.update).toHaveBeenCalledWith(1, { price: 4999.99 });
  });

  it('remove deve chamar service.remove com id correto', async () => {
    mockService.remove.mockResolvedValue(mockProduct);
    const result = await controller.remove(1);
    expect(result).toEqual(mockProduct);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
