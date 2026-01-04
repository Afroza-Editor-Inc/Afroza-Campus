import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly repo: Repository<UserEntity>) {}

  // TODO: inject repository via TypeOrmModule.forFeature in module

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
