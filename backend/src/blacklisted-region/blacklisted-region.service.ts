import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedRegion } from './blacklisted-region.entity';

@Injectable()
export class BlacklistedRegionService {
    constructor(
        @InjectRepository(BlacklistedRegion)
        private BlacklistedRegionsRepository: Repository<BlacklistedRegion>,
    ) {}

    findAll(): Promise<BlacklistedRegion[]> {
        return this.BlacklistedRegionsRepository.find();
    }

    findOne(id: number): Promise<BlacklistedRegion | null> {
        return this.BlacklistedRegionsRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.BlacklistedRegionsRepository.delete(id);
    }
}