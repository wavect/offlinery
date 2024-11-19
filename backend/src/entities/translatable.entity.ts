import { BaseEntity } from "@/entities/base.entity";
import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { Column, Entity, OneToMany, TableInheritance, Unique } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
@Unique(["id", "entityType"])
@TableInheritance({ column: { type: "varchar", name: "entityType" } })
export abstract class TranslatableEntity extends BaseEntity {
    @Column({ update: false })
    entityType: string;

    constructor() {
        super();
        this.entityType = this.constructor.name;
        if (!this.id) {
            // @dev already create ID before saving into db, for translation strings to access id
            this.id = uuidv4();
        }
    }

    protected getTranslations(fieldName: string): MultilingualString[] {
        return (
            this.allTranslations?.filter((t) => t.fieldName === fieldName) ?? []
        );
    }

    protected setTranslations(
        fieldName: string,
        translations: MultilingualString[],
    ): void {
        translations.forEach((t) => {
            t.fieldName = fieldName;
            t.parentEntityType = this.entityType;
            t.parentEntityId = this.id;
        });

        // Remove old translations for this field
        this.allTranslations = [
            ...(this.allTranslations?.filter(
                (t) => t.fieldName !== fieldName,
            ) ?? []),
            ...translations,
        ];
    }

    @OneToMany(
        () => MultilingualString,
        (translation) => translation.parentEntity,
        {
            cascade: true,
            eager: true,
        },
    )
    protected allTranslations: MultilingualString[];
}
