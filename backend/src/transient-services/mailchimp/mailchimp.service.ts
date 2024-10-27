import { TYPED_ENV } from "@/utils/env.utils";
import mailchimp from "@mailchimp/mailchimp_marketing";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MailchimpService {
    private readonly logger = new Logger(MailchimpService.name);

    constructor() {
        mailchimp.setConfig({
            apiKey: TYPED_ENV.MAILCHIMP_API_KEY,
            server: TYPED_ENV.MAILCHIMP_SERVER_PREFIX,
        });
        this.logger.debug(`Initialized mailchimp newsletter service.`);
    }

    /** Fails silently as not essential.
     * @returns success boolean*/
    addMailchimpSubscriber = async (email: string) => {
        try {
            await mailchimp.lists.addListMember(
                TYPED_ENV.MAILCHIMP_AUDIENCE_ID,
                {
                    email_address: email,
                    status: "subscribed",
                    merge_fields: {
                        // @dev part of mailchimps audience
                        AFFILIATE: "app",
                    },
                },
            );

            return true;
        } catch (error) {
            this.logger.error("Error subscribing to Mailchimp", error);
            return false;
        }
    };
}
