import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../../modules/product/product.controller';
import { ProductService } from '../../../modules/product/product.service';

const mockProduct = {
  id: 1,
  name: 'iPhone 15',
  price: 5999.99,
  stock: 0,
  categories: [],
};

const mockPaginatedResult = {
  data: [mockProduct],
  meta: { total: 1, page: 1, lastPage: 1 },
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

  it('findAll deve chamar service.findAll com defaults quando sem query', async () => {
    mockService.findAll.mockResolvedValue(mockPaginatedResult);
    const result = await controller.findAll();
    expect(result).toEqual(mockPaginatedResult);
    expect(mockService.findAll).toHaveBeenCalledWith({
      name: undefined,
      description: undefined,
      categoryIds: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('findAll deve passar name e description ao service', async () => {
    mockService.findAll.mockResolvedValue(mockPaginatedResult);
    await controller.findAll('iPhone', 'Pro Max');
    expect(mockService.findAll).toHaveBeenCalledWith({
      name: 'iPhone',
      description: 'Pro Max',
      categoryIds: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('findAll deve parsear categoryIds separados por vírgula', async () => {
    mockService.findAll.mockResolvedValue(mockPaginatedResult);
    await controller.findAll(undefined, undefined, '1,2,3');
    expect(mockService.findAll).toHaveBeenCalledWith({
      name: undefined,
      description: undefined,
      categoryIds: [1, 2, 3],
      page: 1,
      limit: 10,
    });
  });

  it('findAll deve respeitar page e limit customizados', async () => {
    mockService.findAll.mockResolvedValue(mockPaginatedResult);
    await controller.findAll(undefined, undefined, undefined, '2', '5');
    expect(mockService.findAll).toHaveBeenCalledWith({
      name: undefined,
      description: undefined,
      categoryIds: undefined,
      page: 2,
      limit: 5,
    });
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
