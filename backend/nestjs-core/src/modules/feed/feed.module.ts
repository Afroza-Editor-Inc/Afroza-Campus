import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { FeedService } from './feed.service';
import { FeedResolver } from './feed.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity])],
  providers: [FeedService, FeedResolver],
  exports: [FeedService],
})
export class FeedModule {}
