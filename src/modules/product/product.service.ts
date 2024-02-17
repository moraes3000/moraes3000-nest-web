import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/infra/database/prisma.service';

import { generateSlug, generateUniqueHash } from 'src/infra/utils/gerador-slug';
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    let slug = generateSlug(data.name);

    // Check if the generated slug already exists
    while (await this.isSlugTaken(slug)) {
      const uniqueHash = generateUniqueHash();
      slug = `${generateSlug(data.name)}-${uniqueHash}`;
    }

    return this.prisma.product.create({
      data: { ...data, slug },
    });
  }

  async findAll(page = 1, pageSize = 5) {
    const skip = (page - 1) * pageSize;
    const totalCount = await this.prisma.product.count(); // Obtém o número total de registros

    const products = await this.prisma.product.findMany({
      skip,
      take: pageSize,
      orderBy: {
        slug: 'asc',
      },
    });

    return {
      data: products,
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  private async isSlugTaken(slug: string): Promise<boolean> {
    const existingProduct = await this.prisma.product.findFirst({
      where: { slug },
    });
    return !!existingProduct;
  }
}
