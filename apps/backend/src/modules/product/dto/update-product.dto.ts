import { createZodDto } from 'nestjs-zod';
import { CreateProductSchema } from './create-product.dto';

export const UpdateProductSchema = CreateProductSchema.partial().refine(
  (data) => data.categoryIds === undefined || data.categoryIds.length > 0,
  {
    message: 'Produto deve ter pelo menos uma categoria',
    path: ['categoryIds'],
  },
);

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
