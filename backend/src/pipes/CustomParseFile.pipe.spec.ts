import { CustomParseFilePipe } from "@/pipes/CustomParseFile.pipe";
import { BadRequestException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("CustomParseFilePipe", () => {
    let pipe: CustomParseFilePipe;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CustomParseFilePipe],
        }).compile();

        pipe = module.get<CustomParseFilePipe>(CustomParseFilePipe);
    });

    it("should be defined", () => {
        expect(pipe).toBeDefined();
    });

    it("should throw BadRequestException with correct error for max file size error", async () => {
        const mockTransform = jest.spyOn(
            CustomParseFilePipe.prototype as any,
            "transform",
        );
        mockTransform.mockRejectedValue(
            new BadRequestException("Max file size"),
        );

        await expect(pipe.transform({} as any)).rejects.toThrow(
            BadRequestException,
        );
        await expect(pipe.transform({} as any)).rejects.toMatchObject({
            response: {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Max file size",
                error: "Bad Request",
            },
        });
    });

    it("should throw BadRequestException with correct error for invalid file type", async () => {
        const mockTransform = jest.spyOn(
            CustomParseFilePipe.prototype as any,
            "transform",
        );
        mockTransform.mockRejectedValue(new BadRequestException("File type"));

        await expect(pipe.transform({} as any)).rejects.toThrow(
            BadRequestException,
        );
        await expect(pipe.transform({} as any)).rejects.toMatchObject({
            response: {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "File type",
                error: "Bad Request",
            },
        });
    });

    it("should rethrow other errors", async () => {
        const mockTransform = jest.spyOn(
            CustomParseFilePipe.prototype as any,
            "transform",
        );
        const customError = new Error("Custom error");
        mockTransform.mockRejectedValue(customError);

        await expect(pipe.transform({} as any)).rejects.toThrow(customError);
    });
});
