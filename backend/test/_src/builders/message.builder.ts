import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";
import { UserBuilder } from "./user.builder";

export class MessageBuilder extends AbstractEntityBuilder<Message> {
    protected createInitialEntity(): Message {
        const message = new Message();
        message.id = "00000000-0000-0000-0000-000000000000";
        message.content = "";
        message.sentAt = new Date();
        message.sender = new UserBuilder().build();
        message.encounter = new Encounter();
        return message;
    }

    withId(id: string): this {
        this.entity.id = id;
        return this;
    }

    withContent(content: string): this {
        this.entity.content = content;
        return this;
    }

    withSentAt(sentAt: Date): this {
        this.entity.sentAt = sentAt;
        return this;
    }

    withSender(sender: User): this {
        this.entity.sender = sender;
        return this;
    }

    withEncounter(encounter: Encounter): this {
        this.entity.encounter = encounter;
        return this;
    }
}
