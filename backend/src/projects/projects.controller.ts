import { Controller, Post, Body, Get, Param, ParseIntPipe} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectDto } from './dto/create-project.dto.js';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectService: ProjectsService){}
    
    @Post()
    createProject(@Body() projectData: ProjectDto) {
        return this.projectService.create(projectData);
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
