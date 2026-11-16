import * as bcrypt from 'bcrypt';                                                                 
import { JwtService } from '@nestjs/jwt';
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly  prisma: PrismaService,
        private readonly  jwtService: JwtService
    ) {}



    async register(registerDto: RegisterDto) {
        const user = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
        if (user) {
            throw new ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const newUser = await this.prisma.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
            },
            omit: { password: true }
        });
        return newUser;
    }

    async login(dto : LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {sub : user.id, email: user.email};

        return {access_token: await this.jwtService.signAsync(payload)};
    }
}
