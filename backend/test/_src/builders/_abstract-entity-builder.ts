/**
 * @DEV
 * - use builders to quickly get an entity-like object for unit tests
 */
export abstract class AbstractEntityBuilder<T> {
    protected entity: T;

    constructor() {
        this.entity = this.createInitialEntity();
    }

    protected abstract createInitialEntity(): T;

    public build(): T {
        return this.entity;
    }
}
