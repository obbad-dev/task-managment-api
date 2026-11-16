import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [PrismaModule, UsersModule, ProjectsModule, TasksModule, AuthModule],
})
export class AppModule {}
