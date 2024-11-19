import { Event } from "@/entities/event/event.entity";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MultilingualString } from "./multilingual-string.entity";
import { MultilingualStringService } from "./multilingual-string.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Event,
            MultilingualString,
            TranslatableEntity,
        ]),
    ],
    providers: [MultilingualStringService],
    controllers: [],
    exports: [MultilingualStringService, TypeOrmModule],
})
export class MultilingualStringModule {}
