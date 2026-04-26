import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { children: true, parent: true },
    });
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(
          `Categoria pai #${dto.parentId} não encontrada`,
        );
      }
    }

    const exists = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Category name already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
      },
      include: { parent: true, children: true },
    });
  }

  async checkHierarchyLoop(
    categoryId: number,
    newParentId: number,
  ): Promise<void> {
    let current: number | null = newParentId;
    const visited = new Set<number>();

    while (current !== null) {
      if (visited.has(current)) break;
      if (current === categoryId) {
        throw new BadRequestException(
          'Hierarquia circular detectada na categoria',
        );
      }
      visited.add(current);
      const parent: { parentId: number | null } | null =
        await this.prisma.category.findUnique({
          where: { id: current },
          select: { parentId: true },
        });
      current = parent?.parentId ?? null;
    }
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: { take: 1 },
        children: { take: 1 },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria #${id} não encontrada`);
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        'Não é possível remover categoria com produtos vinculados',
      );
    }

    if (category.children.length > 0) {
      throw new BadRequestException(
        'Não é possível remover categoria que possui subcategorias',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
