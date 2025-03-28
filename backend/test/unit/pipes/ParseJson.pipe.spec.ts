import { ParseValidateJsonPipe } from "@/pipes/parse-validate-json.pipe";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { IsString } from "class-validator";

class TestDto {
    @IsString()
    name: string;
}

describe("ParseJsonPipe", () => {
    let pipe: ParseValidateJsonPipe<TestDto>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ParseValidateJsonPipe,
                    useValue: new ParseValidateJsonPipe(TestDto),
                },
            ],
        }).compile();

        pipe = module.get<ParseValidateJsonPipe<TestDto>>(
            ParseValidateJsonPipe,
        );
    });

    it("should be defined", () => {
        expect(pipe).toBeDefined();
    });

    it("should parse and validate JSON string", async () => {
        const jsonString = '{"name": "Test"}';
        const result = await pipe.transform(jsonString);
        expect(result).toBeInstanceOf(TestDto);
        expect(result.name).toBe("Test");
    });

    it("should parse and validate object", async () => {
        const obj = { name: "Test" };
        const result = await pipe.transform(obj);
        expect(result).toBeInstanceOf(TestDto);
        expect(result.name).toBe("Test");
    });

    it("should throw BadRequestException for invalid JSON string", async () => {
        const invalidJson = "{invalid json}";
        await expect(pipe.transform(invalidJson)).rejects.toThrow(
            BadRequestException,
        );
    });

    it("should throw BadRequestException for invalid object", async () => {
        const invalidObj = { name: 123 };
        await expect(pipe.transform(invalidObj)).rejects.toThrow(
            BadRequestException,
        );
    });

    it("should parse and validate Blob", async () => {
        const jsonString = '{"name": "Test"}';
        const blob = new Blob([jsonString], { type: "application/json" });
        const result = await pipe.transform(blob);
        expect(result).toBeInstanceOf(TestDto);
        expect(result.name).toBe("Test");
    });

    it("should throw BadRequestException for invalid Blob content", async () => {
        const invalidJson = "{invalid json}";
        const blob = new Blob([invalidJson], { type: "application/json" });
        await expect(pipe.transform(blob)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid input type", async () => {
        await expect(pipe.transform(123)).rejects.toThrow(BadRequestException);
    });
});
