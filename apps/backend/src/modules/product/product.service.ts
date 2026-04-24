import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(name?: string) {
    return this.prisma.product.findMany({
      where: name ? { name: { contains: name } } : undefined,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) throw new NotFoundException(`Produto #${id} não encontrado`);
    return product;
  }

  async create(dto: CreateProductDto) {
    if (!dto.categoryIds?.length) {
      throw new BadRequestException(
        'Produto deve ter pelo menos uma categoria',
      );
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

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: productInclude,
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryIds !== undefined && dto.categoryIds.length === 0) {
      throw new BadRequestException(
        'Produto deve ter pelo menos uma categoria',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.categoryIds && {
          categories: {
            deleteMany: {},
            create: dto.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: productInclude,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
