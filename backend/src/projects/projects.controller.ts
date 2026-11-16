import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, ParseEnumPipe} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectDto } from './dto/create-project.dto.js';
import { TasksService } from '../tasks/tasks.service.js';
import { CreateTaskDto } from '../tasks/dto/create-task.dto.js';
import { TaskStatus } from '../generated/prisma/enums.js';

@Controller('projects')
export class ProjectsController {
    constructor(
        private readonly projectService: ProjectsService,
        private readonly taskService: TasksService    
    ){}

    @Get(':id/tasks')
    getAllTasks(@Param('id', ParseIntPipe) projectId: number, 
        @Query('status', new ParseEnumPipe(TaskStatus, { optional: true })) status?: TaskStatus)
    {
        return this.taskService.findByProject(projectId, status);
    }
    @Post()
    createProject(@Body() projectData: ProjectDto) {
        return this.projectService.create(projectData);
    }
    @Post(':id/tasks')
    createTask(
        @Param('id', ParseIntPipe) projectId: number, 
        @Body() createTaskDto: CreateTaskDto
    ){
        return this.taskService.create(projectId, createTaskDto)
    }

    @Get(':id')
    getProject(@Param('id', ParseIntPipe) id: number) {
        return this.projectService.findOne(id);
    }
    @Get()
    getAllProjects() {
        return this.projectService.findAll();
    }
}
