import { MultiLingStringDTO } from "@/DTOs/multi-ling-string.dto";
import { MultilingualString } from "@/entities/multilingual-string/multilingual-string.entity";
import { ELanguage } from "@/types/user.types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MultilingualStringService {
    private readonly logger = new Logger(MultilingualStringService.name);

    constructor(
        @InjectRepository(MultilingualString)
        private multilingualStringRepository: Repository<MultilingualString>,
    ) {}

    public async createTranslations(
        multilingualStringDTO: MultiLingStringDTO,
        fieldName: string,
        parentEntityType: string,
        parentEntityId: string,
    ) {
        const translations = await this.multilingualStringRepository.save(
            MultilingualString.fromMultilingualStringDTO(
                multilingualStringDTO,
                fieldName,
                parentEntityType,
                parentEntityId,
            ),
        );
        this.logger.debug(
            `New dynamic translations created through MultiLingStringDTO.`,
        );
        return translations;
    }

    /** @dev Not all translations are known at deployment such as events which are created dynamically. */
    public async createTranslation(language: ELanguage, text: string) {
        const translation = await this.multilingualStringRepository.save({
            language,
            text,
        });
        this.logger.debug(
            `Created new dynamic translation: ${language} - ${text}`,
        );
        return translation;
    }
}
