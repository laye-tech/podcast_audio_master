import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistUserService } from './playlist-user.service';

describe('PlaylistUserService', () => {
  let service: PlaylistUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistUserService],
    }).compile();

    service = module.get<PlaylistUserService>(PlaylistUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
