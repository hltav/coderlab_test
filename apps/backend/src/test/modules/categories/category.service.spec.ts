import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../../modules/category/category.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockCategory = {
  id: 1,
  name: 'Eletrônicos',
  parentId: null,
  parent: null,
  children: [],
};

const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar todas as categorias', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('create', () => {
    it('deve criar categoria sem pai', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null); // name não existe
      mockPrisma.category.create.mockResolvedValue(mockCategory);
      const result = await service.create({ name: 'Eletrônicos' });
      expect(result).toEqual(mockCategory);
    });

    it('deve criar categoria com pai válido', async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce(mockCategory) // pai existe
        .mockResolvedValueOnce(null); // name não existe
      mockPrisma.category.create.mockResolvedValue({
        ...mockCategory,
        id: 2,
        name: 'Smartphones',
        parentId: 1,
      });
      const result = await service.create({ name: 'Smartphones', parentId: 1 });
      expect(result.parentId).toBe(1);
    });

    it('deve lançar BadRequestException se pai não existir', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ name: 'Smartphones', parentId: 99 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ConflictException se nome já existir', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory); // name já existe
      await expect(service.create({ name: 'Eletrônicos' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('checkHierarchyLoop', () => {
    it('não deve lançar erro quando não há loop', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ parentId: null });
      await expect(service.checkHierarchyLoop(1, 2)).resolves.not.toThrow();
    });

    it('deve lançar BadRequestException quando detectar loop direto', async () => {
      await expect(service.checkHierarchyLoop(2, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando detectar loop indireto', async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce({ parentId: 1 })
        .mockResolvedValueOnce({ parentId: 2 });
      await expect(service.checkHierarchyLoop(2, 3)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
