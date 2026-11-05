import { Controller, Post, Body, Get,  Param, ParseIntPipe, Patch, Delete} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Post()
    addUser(@Body() expectedData: CreateUserDto)
    {
        return this.usersService.create(expectedData);
    }

    @Get()
    findAll(){
        return this.usersService.findAll();
    }
    @Get(':id')
    findUserById(@Param('id', ParseIntPipe)id : number){
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body()dataUpdate: UpdateUserDto
    ) {
         return this.usersService.update(id, dataUpdate);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id : number){
        return this.usersService.delete(id);
    }

}
