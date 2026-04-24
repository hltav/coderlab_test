import { Test, TestingModule } from '@nestjs/testing';
import { CategoryModule } from '../../../modules/category/category.module';
import { CategoryService } from '../../../modules/category/category.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockPrismaService = {
  category: { findMany: jest.fn(), findUnique: jest.fn() },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('CategoryModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CategoryModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
  });

  it('deve compilar o módulo corretamente', () => {
    expect(module).toBeDefined();
  });

  it('deve prover o CategoryService', () => {
    const service = module.get<CategoryService>(CategoryService);
    expect(service).toBeDefined();
  });
});
