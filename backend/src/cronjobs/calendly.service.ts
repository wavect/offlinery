import { ELanguage } from "@/types/user.types";
import { TYPED_ENV } from "@/utils/env.utils";
import { Injectable, Logger } from "@nestjs/common";

interface CalendlyEvent {
    uri: string;
    name: string;
    status: string;
    start_time: string;
    end_time: string;
    event_type: string;
    invitee: {
        email: string;
    };
}

interface CalendlyResponse {
    collection: CalendlyEvent[];
    pagination: {
        next_page: string | null;
    };
}

/** @dev Calendly has a rate limit of 500 requests per minute which we can't realistically hit with the current logic, https://developer.calendly.com/api-docs/edca8074633f8-upcoming-changes */
@Injectable()
export class CalendlyService {
    private readonly logger = new Logger(CalendlyService.name);

    private readonly API_KEY = TYPED_ENV.CALENDLY_ACCESS_TOKEN;
    private readonly ORGANIZATION_URI = `https://api.calendly.com/organizations/${TYPED_ENV.CALENDLY_ORGANIZATION_ID}`;
    private readonly BASE_URL = "https://api.calendly.com/v2";

    private async getScheduledEvents(
        minStartTime: string,
    ): Promise<CalendlyEvent[]> {
        try {
            const response = await fetch(
                `${this.BASE_URL}/scheduled_events?` +
                    new URLSearchParams({
                        organization: this.ORGANIZATION_URI,
                        min_start_time: minStartTime,
                        status: "active",
                    }),
                {
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                this.logger.error(
                    `Could not fetch scheduledEvents from Calendly Api.`,
                );
                return [];
            }

            const data = (await response.json()) as CalendlyResponse;
            return data.collection;
        } catch (error) {
            this.logger.error(
                `Caught error when fetching scheduledEvents from Calendly Api: ${error?.message}`,
            );
        }
        return [];
    }

    async getEmailsOfUsersWithoutUpcomingSafetyCall(
        emails: string[],
    ): Promise<Set<string>> {
        try {
            const minStartTime = new Date().toISOString();
            const events = await this.getScheduledEvents(minStartTime);
            if (!events.length) {
                return new Set<string>();
            }

            const normalizedEmails = emails.map((email) => email.toLowerCase());

            const emailsWithCalls = new Set<string>();

            // Check each language's events
            Object.values(ELanguage).forEach((language) => {
                const safetyCallEventType = `safety-call-${language}`;
                const languageEvents = events.filter((event) =>
                    event.event_type.includes(safetyCallEventType),
                );

                // Add emails that have calls for this language
                languageEvents
                    .map((event) => event.invitee.email.toLowerCase())
                    .filter((email) => normalizedEmails.includes(email))
                    .forEach((email) => emailsWithCalls.add(email));
            });

            // Return emails that don't have any safety calls
            return new Set(
                normalizedEmails.filter((email) => !emailsWithCalls.has(email)),
            );
        } catch (error) {
            console.error(
                `Error checking multiple Calendly events: ${error.message}`,
            );
            return new Set();
        }
    }
}
