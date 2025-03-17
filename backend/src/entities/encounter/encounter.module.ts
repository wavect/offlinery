import { Message } from "@/entities/messages/message.entity";
import { MessageModule } from "@/entities/messages/message.module";
import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { NotificationModule } from "@/transient-services/notification/notification.module";
import { TaskModule } from "@/transient-services/task/task.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EncounterController } from "./encounter.controller";
import { Encounter } from "./encounter.entity";
import { EncounterService } from "./encounter.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Encounter, User, Message]),
        MessageModule,
        forwardRef(() => NotificationModule),
        forwardRef(() => UserModule),
        TaskModule,
    ],
    providers: [EncounterService],
    controllers: [EncounterController],
    exports: [EncounterService],
})
export class EncounterModule {}
