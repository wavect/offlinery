import { CustomParseFilePipe } from "@/pipes/CustomParseFile.pipe";
import { BadRequestException, HttpStatus, ParseFilePipe } from "@nestjs/common";

describe("CustomParseFilePipe", () => {
    let pipe: CustomParseFilePipe;

    beforeEach(() => {
        pipe = new CustomParseFilePipe();
    });

    it("should be defined", () => {
        expect(pipe).toBeDefined();
    });

    it("should successfully transform a valid file", async () => {
        const mockFile = { filename: "test.jpg", buffer: Buffer.from("test") };
        jest.spyOn(ParseFilePipe.prototype, "transform").mockResolvedValue(
            mockFile,
        );

        const result = await pipe.transform(mockFile);
        expect(result).toEqual(mockFile);
    });

    it("should throw BadRequestException with PAYLOAD_TOO_LARGE for file size exceeding limit", async () => {
        const mockFile = { filename: "large.jpg", buffer: Buffer.from("test") };
        jest.spyOn(ParseFilePipe.prototype, "transform").mockRejectedValue(
            new BadRequestException("Max file size"),
        );

        await expect(pipe.transform(mockFile)).rejects.toThrow(
            BadRequestException,
        );
        await expect(pipe.transform(mockFile)).rejects.toMatchObject({
            response: {
                statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
                message: "File size exceeds the maximum limit",
                error: "Payload Too Large",
            },
        });
    });

    it("should throw BadRequestException with UNSUPPORTED_MEDIA_TYPE for invalid file type", async () => {
        const mockFile = { filename: "test.txt", buffer: Buffer.from("test") };
        jest.spyOn(ParseFilePipe.prototype, "transform").mockRejectedValue(
            new BadRequestException("File type"),
        );

        await expect(pipe.transform(mockFile)).rejects.toThrow(
            BadRequestException,
        );
        await expect(pipe.transform(mockFile)).rejects.toMatchObject({
            response: {
                statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                message:
                    "Invalid file type. Only jpg, jpeg, png, and gif are allowed",
                error: "Unsupported Media Type",
            },
        });
    });

    it("should rethrow any other error", async () => {
        const mockFile = { filename: "test.jpg", buffer: Buffer.from("test") };
        const genericError = new Error("Generic error");
        jest.spyOn(ParseFilePipe.prototype, "transform").mockRejectedValue(
            genericError,
        );

        await expect(pipe.transform(mockFile)).rejects.toThrow(genericError);
    });

    // Optional: Test the logger
    it("should log debug message when receiving a file", async () => {
        const mockFile = { filename: "test.jpg", buffer: Buffer.from("test") };
        const loggerSpy = jest.spyOn(pipe["logger"], "debug");
        jest.spyOn(ParseFilePipe.prototype, "transform").mockResolvedValue(
            mockFile,
        );

        await pipe.transform(mockFile);

        expect(loggerSpy).toHaveBeenCalledWith(
            "Received file in CustomParseFilePipe",
        );
    });
});
