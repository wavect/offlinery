import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { ChildEntity, Column } from "typeorm";

@ChildEntity("Event")
export class Event extends TranslatableEntity {
    readonly LBL_TITLE = "title";
    readonly LBL_DESCRIPTION = "description";

    @Column({ nullable: false })
    startDateTime: Date;

    @Column({ nullable: false })
    endDateTime: Date;

    // Getters and setters for translations
    get titles(): MultilingualString[] {
        return this.getTranslations(this.LBL_TITLE);
    }

    set titles(translations: MultilingualString[]) {
        this.setTranslations(this.LBL_TITLE, translations);
    }

    get descriptions(): MultilingualString[] {
        return this.getTranslations(this.LBL_DESCRIPTION);
    }

    set descriptions(translations: MultilingualString[]) {
        this.setTranslations(this.LBL_DESCRIPTION, translations);
    }
}
