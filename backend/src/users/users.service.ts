import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { User } from '../generated/prisma/client.js'
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    create(createUserDto: CreateUserDto) {
        return this.prismaService.user.create({
            data:createUserDto
        });
    }
    findAll(){
        return this.prismaService.user.findMany();
    }
    async findOne(id : number){
        const user: User | null = await this.prismaService.user.findUnique({where : {id} });
        if (!user){
            throw new NotFoundException(`user with ID ${id} Not Found`);
        }
        return user;
    }
    async update(id: number, updateUserDto: UpdateUserDto) {
        await this.findOne(id);
        return this.prismaService.user.update({
            where: {id},
            data: updateUserDto
        });
    }
    async delete(id: number){
        await this.findOne(id);
        return this.prismaService.user.delete({
            where : {id}
        });
    }
}

