import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class FeedService {
  constructor(@InjectRepository(PostEntity) private readonly repo: Repository<PostEntity>) {}

  async createPost(authorId: string, content: string, mediaUrl?: string) {
    const p = this.repo.create({ authorId, content, mediaUrl } as any);
    return this.repo.save(p);
  }

  async getFeed(limit = 20) {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
  }
}
