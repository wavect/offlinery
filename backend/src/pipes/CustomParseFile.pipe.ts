import {
  BadRequestException,
  HttpStatus,
  Logger,
  ParseFilePipe,
} from "@nestjs/common";

/** @dev The sole purpose of this custom file pipe that extends the default one is to provide more precise error messages depending on which file validator failed. */
export class CustomParseFilePipe extends ParseFilePipe {
  private readonly logger = new Logger(CustomParseFilePipe.name);

  async transform(value: any) {
    this.logger.debug("Received file in CustomParseFilePipe");
    try {
      return await super.transform(value);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const originalMessage = error.message;

        if (originalMessage.includes("Max file size")) {
          throw new BadRequestException({
            statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
            message: "File size exceeds the maximum limit",
            error: "Payload Too Large",
          });
        } else if (originalMessage.includes("File type")) {
          throw new BadRequestException({
            statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            message:
              "Invalid file type. Only jpg, jpeg, png, and gif are allowed",
            error: "Unsupported Media Type",
          });
        }
      }
      throw error;
    }
  }
}
