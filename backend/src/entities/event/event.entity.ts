import { EventPublicDTO } from "@/DTOs/event-public.dto";
import { BaseEntity } from "@/entities/base.entity";
import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { ITranslatableEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { ELanguage } from "@/types/user.types";
import { formatMultiLanguageDateTimeStringsCET } from "@/utils/date.utils";
import { getTypedCoordinatesFromPoint } from "@/utils/location.utils";
import { Point } from "geojson";
import { ChildEntity, Column, Index } from "typeorm";

@ChildEntity("Event")
export class Event
    extends TranslatableEntity
    implements BaseEntity, ITranslatableEntityToDTOInterface<EventPublicDTO>
{
    readonly LBL_VENUE_WITH_ARTICLE_IF_NEEDED = "venueWithArticleIfNeeded";
    readonly LBL_ADDRESS = "address";

    public convertToPublicDTO(lang: ELanguage): EventPublicDTO {
        const { date: startDate, time: startTime } =
            formatMultiLanguageDateTimeStringsCET(
                this.eventStartDateTime,
                lang,
            );
        const { time: endTime } = formatMultiLanguageDateTimeStringsCET(
            this.eventEndDateTime,
            lang,
        );
        return {
            startDate,
            startTime,
            endTime,
            address: this.address.find((a) => a.language === lang)?.text,
            venueWithArticleIfNeeded: this.venueWithArticleIfNeeded.find(
                (a) => a.language === lang,
            )?.text,
            location: getTypedCoordinatesFromPoint(this.location),
        };
    }

    /** @dev Used to re-address the event and avoiding duplicates */
    @Column({ nullable: false, unique: true })
    eventKey: string;

    @Index({ spatial: true })
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: false,
    })
    location: Point;

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
