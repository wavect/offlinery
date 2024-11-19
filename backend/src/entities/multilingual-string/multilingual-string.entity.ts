import { MultiLingStringDTO } from "@/DTOs/multi-ling-string.dto";
import { BaseEntity } from "@/entities/base.entity";
import { TranslatableEntity } from "@/entities/translatable.entity";
import { ELanguage } from "@/types/user.types";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";

@Entity()
@Unique(["language", "parentEntityId", "parentEntityType", "fieldName"])
@Index(["language", "parentEntityType", "fieldName"])
export class MultilingualString extends BaseEntity {
    @Column({
        type: "enum",
        enum: ELanguage,
    })
    language: ELanguage;

    @Column()
    text: string;

    @Column()
    parentEntityId: string;

    @Column()
    parentEntityType: string;

    @Column()
    fieldName: string;

    @ManyToOne(() => TranslatableEntity, {
        onDelete: "CASCADE",
    })
    @JoinColumn([
        { name: "parentEntityId", referencedColumnName: "id" },
        { name: "parentEntityType", referencedColumnName: "entityType" },
    ])
    parentEntity: TranslatableEntity;

    // Static methods for conversion
    static fromMultilingualStringDTO(
        map: MultiLingStringDTO,
        fieldName: string,
        parentEntityType: string,
        parentEntityId: string,
    ): MultilingualString[] {
        return Object.entries(map.translations).map(([lang, text]) => {
            const translation = new MultilingualString();
            translation.language = lang as ELanguage;
            translation.text = text;
            translation.fieldName = fieldName;
            translation.parentEntityType = parentEntityType;
            translation.parentEntityId = parentEntityId;
            return translation;
        });
    }

    static toMultilingualStringDTO(
        translations: MultilingualString[],
    ): MultiLingStringDTO {
        return {
            translations: translations.reduce<
                Partial<Record<ELanguage, string>>
            >(
                (map, translation) => ({
                    ...map,
                    [translation.language]: translation.text,
                }),
                {},
            ),
        };
    }
}
