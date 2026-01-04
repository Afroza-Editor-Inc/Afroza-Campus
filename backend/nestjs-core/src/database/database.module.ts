import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Example TypeORM configuration (placeholder)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: +process.env.POSTGRES_PORT || 5432,
      username: process.env.POSTGRES_USER || 'afroza',
      password: process.env.POSTGRES_PASSWORD || 'afroza',
      database: process.env.POSTGRES_DB || 'afroza',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // never true in production
    }),
  ],
})
export class DatabaseModule {}
