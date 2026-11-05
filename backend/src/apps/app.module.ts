import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
    imports: [PrismaModule, UsersModule, ProjectsModule],
})
export class AppModule {}
