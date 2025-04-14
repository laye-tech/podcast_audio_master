import { Test, TestingModule } from '@nestjs/testing';
import { GedLogsService } from './ged-logs.service';

describe('GedLogsService', () => {
  let service: GedLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GedLogsService],
    }).compile();

    service = module.get<GedLogsService>(GedLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
