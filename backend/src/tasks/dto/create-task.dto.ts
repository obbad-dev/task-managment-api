import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client.js';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;
    
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsInt()
    @IsOptional()
    assigneeId?: number;
}