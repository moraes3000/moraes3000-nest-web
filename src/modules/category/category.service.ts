import { Injectable, ConflictException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/infra/database/prisma.service';

import { generateSlug, generateUniqueHash } from 'src/infra/utils/gerador-slug';

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

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
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
