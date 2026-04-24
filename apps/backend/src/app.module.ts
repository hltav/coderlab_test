import { Module } from '@nestjs/common';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, CategoryModule, ProductModule],
})
export class AppModule {}
