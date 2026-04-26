import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../modules/product/product.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockCategory = {
  id: 1,
  name: 'Smartphones',
  parentId: null,
  parent: null,
};

const mockProductRaw = {
  id: 1,
  name: 'iPhone 15',
  description: 'Smartphone Apple',
  price: 5999.99,
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [
    {
      categoryId: 1,
      category: { ...mockCategory },
    },
  ],
};

// resultado após mapProduct
const mockProductMapped = {
  ...mockProductRaw,
  categoryIds: [1],
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar produtos paginados sem filtros', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProductRaw]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, lastPage: 1 });
      expect(result.data[0].categoryIds).toEqual([1]);
    });

    it('deve filtrar por nome', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProductRaw]);
      mockPrisma.product.count.mockResolvedValue(1);

      await service.findAll({ name: 'iPhone', page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'iPhone' },
          }),
        }),
      );
    });

    it('deve filtrar por descrição', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProductRaw]);
      mockPrisma.product.count.mockResolvedValue(1);

      await service.findAll({ description: 'Smartphone', page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            description: { contains: 'Smartphone' },
          }),
        }),
      );
    });

    it('deve filtrar por categoryIds', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProductRaw]);
      mockPrisma.product.count.mockResolvedValue(1);

      await service.findAll({ categoryIds: [1, 2], page: 1, limit: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: { some: { categoryId: { in: [1, 2] } } },
          }),
        }),
      );
    });

    it('deve calcular lastPage corretamente', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProductRaw]);
      mockPrisma.product.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.lastPage).toBe(3);
    });
  });

  describe('findOne', () => {
    it('deve retornar produto mapeado pelo id', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.categoryIds).toEqual([1]);
    });

    it('deve lançar NotFoundException se produto não existir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar produto e retornar mapeado', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.product.findFirst.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValue(mockProductRaw);

      const result = await service.create({
        name: 'iPhone 15',
        description: 'Smartphone Apple',
        price: 5999.99,
        stock: 10,
        categoryIds: [1],
      });

      expect(result.categoryIds).toEqual([1]);
    });

    it('deve lançar BadRequestException se categoryIds estiver vazio', async () => {
      await expect(
        service.create({ name: 'Produto', price: 100, categoryIds: [] }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se alguma categoria não existir', async () => {
      // retorna 0 categorias para os ids enviados
      mockPrisma.category.findMany.mockResolvedValue([]);

      await expect(
        service.create({ name: 'Produto', price: 100, categoryIds: [99] }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.product.findFirst).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se produto já existir na categoria', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.product.findFirst.mockResolvedValue(mockProductRaw);

      await expect(
        service.create({
          name: 'iPhone 15',
          description: 'Smartphone Apple',
          price: 5999.99,
          categoryIds: [1],
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar produto e retornar mapeado', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProductRaw,
        price: 4999.99,
      });

      const result = await service.update(1, { price: 4999.99 });

      expect(result.price).toBe(4999.99);
      expect(result.categoryIds).toEqual([1]);
    });

    it('deve lançar NotFoundException ao atualizar produto inexistente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.update(99, { price: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException ao enviar categoryIds vazio', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);
      await expect(service.update(1, { categoryIds: [] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se alguma categoria não existir no update', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);
      mockPrisma.category.findMany.mockResolvedValue([]); // nenhuma encontrada

      await expect(service.update(1, { categoryIds: [99] })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('deve atualizar stock corretamente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProductRaw,
        stock: 50,
      });

      const result = await service.update(1, { stock: 50 });

      expect(result.stock).toBe(50);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ stock: 50 }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('deve remover produto existente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProductRaw);
      mockPrisma.product.delete.mockResolvedValue(mockProductRaw);

      const result = await service.remove(1);

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProductRaw);
    });

    it('deve lançar NotFoundException ao remover produto inexistente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.product.delete).not.toHaveBeenCalled();
    });
  });
});
