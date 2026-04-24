import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  parentId: z.number().int().positive().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
