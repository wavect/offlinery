import { Message } from "@/entities/messages/message.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    providers: [],
    controllers: [],
    exports: [],
})
export class MessageModule {}
