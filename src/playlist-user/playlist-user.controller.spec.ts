import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistUserController } from './playlist-user.controller';

describe('PlaylistUserController', () => {
  let controller: PlaylistUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistUserController],
    }).compile();

    controller = module.get<PlaylistUserController>(PlaylistUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
