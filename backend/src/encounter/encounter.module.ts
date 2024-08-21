import { Module } from '@nestjs/common';
import { EncounterController } from './encounter.controller';

@Module({
  controllers: [EncounterController]
})
export class EncounterModule {}
