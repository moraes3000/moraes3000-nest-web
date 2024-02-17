import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { PrismaService } from 'src/infra/database/prisma.service';

import { generateSlug, generateUniqueHash } from 'src/infra/utils/gerador-slug';
import { async } from 'rxjs';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    let slug = generateSlug(data.name);

    // Check if the generated slug already exists
    while (await this.isSlugTaken(slug)) {
      const uniqueHash = generateUniqueHash();
      slug = `${generateSlug(data.name)}-${uniqueHash}`;
    }

    return this.prisma.category.create({
      data: { ...data, slug },
    });
  }

  async findAll(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const totalCount = await this.prisma.category.count(); // Obtém o número total de registros

    const categories = await this.prisma.category.findMany({
      skip,
      take: pageSize,
      include: {
        Product: true,
      },
    });

    return {
      data: categories,
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        Product: true,
      },
    });

    // Ordena os produtos pelo nome
    if (category && category.Product) {
      category.Product = category.Product.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  private async isSlugTaken(slug: string): Promise<boolean> {
    const existingCategory = await this.prisma.category.findFirst({
      where: { slug },
    });
    return !!existingCategory;
  }
}
