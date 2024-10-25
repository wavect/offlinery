import { TYPED_ENV } from "@/utils/env.utils";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { ConsoleLogger, Injectable, LoggerService } from "@nestjs/common";

export const PROVIDER_TOKEN_LOGGER = "Logger";

@Injectable()
export class InfluxLogger extends ConsoleLogger implements LoggerService {
    private readonly influx: InfluxDB;
    private readonly org: string;
    private readonly bucket: string;
    private readonly writeApi: any;
    private readonly isProduction: boolean;

    constructor() {
        super();
        // Load configuration from environment variables
        const url = TYPED_ENV.INFLUXDB_URL || "http://localhost:8086";
        const token = TYPED_ENV.INFLUXDB_TOKEN;
        this.org = TYPED_ENV.INFLUXDB_ORG || "offlinery";
        this.bucket = TYPED_ENV.INFLUXDB_BUCKET || "logs";
        this.isProduction = TYPED_ENV.NODE_ENV?.toLowerCase() === "production";

        if (!this.isProduction) {
            super.warn(
                "Not saving logs into InfluxDB as backend not set to production!",
            );
            return;
        }

        // Initialize InfluxDB client
        this.influx = new InfluxDB({ url, token });
        this.writeApi = this.influx.getWriteApi(this.org, this.bucket, "ms");
    }

    private writeLog(
        level: string,
        message: string,
        context?: string,
        trace?: string,
    ) {
        if (this.isProduction) {
            try {
                const point = new Point("log")
                    .tag("level", level)
                    .tag("context", context || "global")
                    .tag("message", message.substring(0, 249)) // InfluxDB tags have a length limit, but are indexable
                    .stringField("message", message);

                if (trace) {
                    point.stringField("trace", trace);
                }

                // Add timestamp
                point.timestamp(new Date());

                // Write to InfluxDB
                this.writeApi.writePoint(point);
                this.writeApi.flush().catch((err: Error) => {
                    super.error("Error writing to InfluxDB:", err);
                });
            } catch (err) {
                super.error(`InfluxDB Logger could not save log to influxDB.`);
            }
        }
    }

    log(message: any, context?: string) {
        this.writeLog("info", this.stringify(message), context);
        super.log(`[${context}] ${message}`); // Keep console logging for development
    }

    error(message: any, trace?: string, context?: string) {
        this.writeLog("error", this.stringify(message), context, trace);
        super.error(`[${context}] ${message}`, trace); // Keep console logging for development
    }

    warn(message: any, context?: string) {
        this.writeLog("warn", this.stringify(message), context);
        super.warn(`[${context}] ${message}`); // Keep console logging for development
    }

    debug(message: any, context?: string) {
        this.writeLog("debug", this.stringify(message), context);
        super.debug(`[${context}] ${message}`); // Keep console logging for development
    }

    verbose(message: any, context?: string) {
        this.writeLog("verbose", this.stringify(message), context);
        super.verbose(`[${context}] ${message}`); // Keep console logging for development
    }

    private stringify(message: any): string {
        if (typeof message === "object") {
            return JSON.stringify(message);
        }
        return String(message);
    }

    // Cleanup method to ensure all logs are written before app shutdown
    async onApplicationShutdown() {
        try {
            await this.writeApi.flush();
            await this.writeApi.close();
        } catch (err) {
            console.error("Error closing InfluxDB connection:", err);
        }
    }
}
