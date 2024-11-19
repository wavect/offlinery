import { AuthModule } from "@/auth/auth.module";
import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { MultilingualStringModule } from "@/entities/multilingual-string/multilingual-string.module";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { NotificationModule } from "@/transient-services/notification/notification.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventController } from "./event.controller";
import { Event } from "./event.entity";
import { EventService } from "./event.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Event,
            User,
            MultilingualString,
            TranslatableEntity,
        ]),
        forwardRef(() => NotificationModule),
        forwardRef(() => AuthModule),
        forwardRef(() => UserModule),
        MultilingualStringModule,
    ],
    providers: [EventService],
    controllers: [EventController],
    exports: [EventService, TypeOrmModule],
})
export class EventModule {}
