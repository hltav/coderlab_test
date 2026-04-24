import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './../../../modules/category/category.controller';
import { CategoryService } from './../../../modules/category/category.service';

const mockCategory = {
  id: 1,
  name: 'Eletrônicos',
  parentId: null,
  parent: null,
  children: [],
};

const mockService = {
  findAll: jest.fn(),
  create: jest.fn(),
};

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    jest.clearAllMocks();
  });

  it('findAll deve retornar todas as categorias', async () => {
    mockService.findAll.mockResolvedValue([mockCategory]);
    const result = await controller.findAll();
    expect(result).toEqual([mockCategory]);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('create deve chamar service.create com dto correto', async () => {
    mockService.create.mockResolvedValue(mockCategory);
    const dto = { name: 'Eletrônicos' };
    const result = await controller.create(dto);
    expect(result).toEqual(mockCategory);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });
});
