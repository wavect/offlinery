export abstract class AbstractEntityBuilder<T> {
    protected entity: T;

    constructor() {
        this.entity = this.createEntity();
    }

    protected abstract createEntity(): T;

    public with<K extends keyof T>(field: K, value: T[K]): this {
        this.entity[field] = value;
        return this;
    }

    public build(): T {
        return this.entity;
    }
}
