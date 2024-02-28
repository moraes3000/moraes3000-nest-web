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

  // service
  async findAll(
    page = 1,

    itemsPerPage?: number,
    totalPages?: number,
  ) {
    const skip = (page - 1) * itemsPerPage;
    let totalCount: number;

    if (totalPages) {
      totalCount = totalPages * itemsPerPage;
    } else {
      totalCount = await this.prisma.category.count();
    }

    const categories = await this.prisma.category.findMany({
      skip,
      take: +itemsPerPage, // Converte itemsPerPage para um número usando o operador unário '+'
      include: {
        Product: true,
      },
      orderBy: {
        name: 'desc',
      },
    });

    return {
      data: categories,
      page,
      // pageSize,
      totalCount,
      totalPages: totalPages || Math.ceil(totalCount / itemsPerPage),
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

  async getBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
      },
      include: {
        Product: true,
      },
    });
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
