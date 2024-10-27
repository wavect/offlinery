import { Module } from "@nestjs/common";
import { MailchimpService } from "./mailchimp.service";

@Module({
    imports: [],
    controllers: [],
    providers: [MailchimpService],
    exports: [MailchimpService],
})
export class MailchimpModule {}
