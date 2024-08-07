import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

@Injectable()
export class ParseJsonPipe<T extends object> implements PipeTransform<any, Promise<T>> {
    constructor(private readonly classType: ClassConstructor<T>) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<T> {
        if (typeof value === 'string') {
            try {
                const parsedValue = JSON.parse(value);
                return this.validateAndTransform(parsedValue);
            } catch (error) {
                throw new BadRequestException('Invalid JSON string');
            }
        } else if (value instanceof Blob) {
            try {
                const text = await value.text();
                const parsedValue = JSON.parse(text);
                return this.validateAndTransform(parsedValue);
            } catch (error) {
                console.error('ParseJsonBlob error', error);
                throw new BadRequestException('Invalid JSON format or validation failed');
            }
        } else if (typeof value === 'object' && value !== null) {
            return this.validateAndTransform(value);
        }

        throw new BadRequestException('Invalid input: Expected a JSON string, Blob, or object');
    }

    private async validateAndTransform(value: any): Promise<T> {
        const classObject = plainToInstance(this.classType, value);

        const errors = await validate(classObject);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        return classObject;
    }
}