import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { ChildEntity, Column } from "typeorm";

@ChildEntity("Event")
export class Event extends TranslatableEntity {
    readonly LBL_VENUE_WITH_ARTICLE_IF_NEEDED = "venueWithArticleIfNeeded";
    readonly LBL_ADDRESS = "address";

    /** @dev Used to re-address the event and avoiding duplicates */
    @Column({ nullable: false, unique: true })
    eventKey: string;

    @Column({ nullable: false })
    eventStartDateTime: Date;

    @Column({ nullable: false })
    eventEndDateTime: Date;

    @Column({ nullable: false })
    mapsLink: string;

    // Getters and setters for translations
    get venueWithArticleIfNeeded(): MultilingualString[] {
        return this.getTranslations(this.LBL_VENUE_WITH_ARTICLE_IF_NEEDED);
    }

    set venueWithArticleIfNeeded(translations: MultilingualString[]) {
        this.setTranslations(
            this.LBL_VENUE_WITH_ARTICLE_IF_NEEDED,
            translations,
        );
    }

    get address(): MultilingualString[] {
        return this.getTranslations(this.LBL_ADDRESS);
    }

    set address(translations: MultilingualString[]) {
        this.setTranslations(this.LBL_ADDRESS, translations);
    }
}
