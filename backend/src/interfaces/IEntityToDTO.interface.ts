import { ELanguage } from "@/types/user.types";

export interface IEntityToDTOInterface<T> {
    convertToPublicDTO(): T;
}

export interface ITranslatableEntityToDTOInterface<T> {
    convertToPublicDTO(lang: ELanguage): T;
}
