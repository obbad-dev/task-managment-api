import {IsString, IsNotEmpty, IsOptional, IsInt} from 'class-validator';

export class ProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
    
    @IsInt()
    @IsNotEmpty()
    ownerId: number;
}