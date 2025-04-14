import { Test, TestingModule } from '@nestjs/testing';
import { GedLogsController } from './ged-logs.controller';

describe('GedLogsController', () => {
  let controller: GedLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GedLogsController],
    }).compile();

    controller = module.get<GedLogsController>(GedLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
