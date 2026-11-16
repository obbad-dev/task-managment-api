import { Controller, Patch, ParseIntPipe, Body, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService){}

    @Patch(':id')
    update (@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto){
        return this.taskService.update(id, updateTaskDto);
    }
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number)
    {
        return this.taskService.remove(id);
    }
}

