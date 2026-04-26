import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  categories: {
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
  },
};

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProduct(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      categories: product.categories.map((c) => ({
        categoryId: c.categoryId,
        category: c.category,
      })),
      categoryIds: product.categories.map((c) => c.categoryId),
    };
  }

  async findAll(params: {
    name?: string;
    description?: string;
    categoryIds?: number[];
    page?: number;
    limit?: number;
  }) {
    const { name, description, categoryIds, page = 1, limit = 10 } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(name && {
        name: { contains: name },
      }),
      ...(description && {
        description: { contains: description },
      }),
      ...(categoryIds?.length && {
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.mapProduct(p)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }

    return this.mapProduct(product);
  }

  async create(dto: CreateProductDto) {
    if (!dto.categoryIds?.length) {
      throw new BadRequestException(
        'Produto deve ter pelo menos uma categoria',
      );
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: dto.categoryIds } },
    });

    if (categories.length !== dto.categoryIds.length) {
      throw new BadRequestException('Uma ou mais categorias não existem');
    }

    const exists = await this.prisma.product.findFirst({
      where: {
        name: dto.name,
        description: dto.description,
        categories: {
          some: {
            categoryId: { in: dto.categoryIds },
          },
        },
      },
    });

    if (exists) {
      throw new ConflictException(
        'Product already exists in one of the selected categories',
      );
    }

    const product: ProductWithRelations = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock ?? 0,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: productInclude,
    });

    return this.mapProduct(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryIds !== undefined && dto.categoryIds.length === 0) {
      throw new BadRequestException(
        'Produto deve ter pelo menos uma categoria',
      );
    }

    if (dto.categoryIds !== undefined) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('Uma ou mais categorias não existem');
      }
    }

    const product: ProductWithRelations = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: dto.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: productInclude,
    });

    return this.mapProduct(product);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
