export interface IEntityToDTOWithArgumentInterface<A, T> {
    convertToPublicDTO(arg: A): T;
}
