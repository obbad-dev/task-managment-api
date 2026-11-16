import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TaskStatus } from '../generated/prisma/enums.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) {}

    async create(projectId: number, createTaskDto: CreateTaskDto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (createTaskDto.assigneeId !== undefined) {
            const user = await this.prisma.user.findUnique({ where: { id: createTaskDto.assigneeId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${createTaskDto.assigneeId} not found`);
            }
        }
        return this.prisma.task.create(
            {
                data : {
                    ...createTaskDto,
                    dueDate: createTaskDto.dueDate
                        ? new Date(createTaskDto.dueDate)
                        : undefined,
                    projectId,
                },
                include : {
                    project: true,
                    assignee: true
                }
            }
        );
    }
    
   async findByProject(projectId: number, status?: TaskStatus){
        const proj = await this.prisma.project.findUnique({where : { id: projectId } });
        if (!proj)
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        return this.prisma.task.findMany(
            {
                where : { projectId, status},
                include : { assignee: true}
            }
        )
    }

    async findOne(id: number){
        const task = await this.prisma.task.findUnique({
            where :{id}
        })
        if (!task)
            throw new NotFoundException(`Task with ID ${id} not found`);
        return task;
    }

    async update(id : number, updateTaskDto: UpdateTaskDto)
    {
        const task = await this.findOne(id);
        if (updateTaskDto.assigneeId !== undefined)
        {
            const user = await this.prisma.user.findUnique({ where: { id: updateTaskDto.assigneeId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${updateTaskDto.assigneeId} not found`);
            }
        }
        return this.prisma.task.update({
            where: {id},
            data: {
                ...updateTaskDto,
                dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate)
                : undefined,
            },
            include: {
                project: true, 
                assignee: true
            }
        });
    }

    async remove(id: number)
    {
        const task = await this.findOne(id);
        return this.prisma.task.delete({ where : { id } });
    }
}