import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getUptime(): string {
        return `Application started ${process.uptime().toFixed(3)} seconds ago.`;
    }
}
