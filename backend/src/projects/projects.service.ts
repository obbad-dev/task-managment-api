import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectDto } from './dto/create-project.dto.js';
// • Inject PrismaService.
//           • Implement create(createProjectDto: CreateProjectDto). Check that the owner exists in the database first; 
//           if not, throw NotFoundException. Then call this.prismaService.project.create(...).

@Injectable()
export class ProjectsService {
    constructor(private readonly prismaService: PrismaService){}

    async create(createProjectDto: ProjectDto){
        const user = await this.prismaService.user.findUnique({
            where : {id : createProjectDto.ownerId}
        });

        if (!user){
            throw new NotFoundException(`owner with ID ${createProjectDto.ownerId} not found`);
        }

        return this.prismaService.project.create({
            data : createProjectDto,
        });
    }

    async findAll() {
        return this.prismaService.project.findMany({include : {owner : true}});
    }
    async findOne(id: number) {
        const project = await this.prismaService.project.findUnique({
            where : {id},
            include : {owner : true}
        });
        if (!project) {
            throw new NotFoundException(`project with ID ${id} not found`);
        }
        return project;
    }
}