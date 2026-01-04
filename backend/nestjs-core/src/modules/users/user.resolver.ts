import { Query, Resolver, Args } from '@nestjs/graphql';

@Resolver('User')
export class UserResolver {
  @Query(() => String)
  helloUser(@Args('id') id: string) {
    return `User ${id}`;
  }
}
