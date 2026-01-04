import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { FeedService } from './feed.service';

@Resolver()
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Query(() => [String])
  async feed(@Args('limit') limit: number) {
    return this.feedService.getFeed(limit || 20);
  }

  @Mutation(() => String)
  async createPost(@Args('authorId') authorId: string, @Args('content') content: string, @Args('mediaUrl') mediaUrl?: string) {
    const p = await this.feedService.createPost(authorId, content, mediaUrl);
    return p.id;
  }
}
