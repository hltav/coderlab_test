import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../modules/product/product.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockProduct = {
  id: 1,
  name: 'iPhone 15',
  description: 'Smartphone Apple',
  price: 5999.99,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [{ category: { id: 1, name: 'Smartphones', parentId: null } }],
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
    it('deve retornar todos os produtos', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
    });

    it('deve filtrar produtos por nome', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      await service.findAll('iPhone');
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'iPhone' } },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto pelo id', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se produto não existir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar um produto com categorias', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValue(mockProduct);
      const result = await service.create({
        name: 'iPhone 15',
        description: 'Smartphone Apple',
        price: 5999.99,
        categoryIds: [1],
      });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar BadRequestException se não houver categorias', async () => {
      await expect(
        service.create({ name: 'Produto', price: 100, categoryIds: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ConflictException se produto já existir na categoria', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      await expect(
        service.create({
          name: 'iPhone 15',
          description: 'Smartphone Apple',
          price: 5999.99,
          categoryIds: [1],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('deve atualizar um produto', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        price: 4999.99,
      });
      const result = await service.update(1, { price: 4999.99 });
      expect(result.price).toBe(4999.99);
    });

    it('deve lançar NotFoundException ao atualizar produto inexistente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.update(99, { price: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException ao remover todas as categorias', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      await expect(service.update(1, { categoryIds: [] })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um produto', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.delete.mockResolvedValue(mockProduct);
      const result = await service.remove(1);
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException ao remover produto inexistente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
