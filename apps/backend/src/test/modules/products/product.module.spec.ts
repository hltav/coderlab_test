import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from '../../../modules/product/product.module';
import { ProductService } from '../../../modules/product/product.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockPrismaService = {
  product: { findMany: jest.fn(), findUnique: jest.fn() },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('ProductModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ProductModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
  });

  it('deve compilar o módulo corretamente', () => {
    expect(module).toBeDefined();
  });

  it('deve prover o ProductService', () => {
    const service = module.get<ProductService>(ProductService);
    expect(service).toBeDefined();
  });
});
