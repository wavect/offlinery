import { TYPED_ENV } from "@/utils/env.utils";
import { IS_DEV_MODE } from "@/utils/misc.utils";
import { InfluxDB, Point, WriteApi } from "@influxdata/influxdb-client";
import { ConsoleLogger, Injectable, LoggerService } from "@nestjs/common";

export const PROVIDER_TOKEN_LOGGER = "Logger";

@Injectable()
export class InfluxLogger extends ConsoleLogger implements LoggerService {
    private readonly influx: InfluxDB;
    private readonly writeApi: WriteApi;
    private readonly isProduction: boolean;
    private flushInterval: NodeJS.Timeout;

    constructor() {
        super();
        this.isProduction = !IS_DEV_MODE;

        if (this.isProduction) {
            this.influx = new InfluxDB({
                url: TYPED_ENV.INFLUXDB_URL || "http://localhost:8086",
                token: TYPED_ENV.INFLUXDB_TOKEN,
            });

            this.writeApi = this.influx.getWriteApi(
                TYPED_ENV.INFLUXDB_ORG || "offlinery",
                TYPED_ENV.INFLUXDB_BUCKET || "logs",
                "ms",
            );

            this.flushInterval = setInterval(() => this.flush(), 10000);
        }
    }

    private normalizeContext(context: any): string {
        if (!context) return "default";
        if (typeof context === "object") {
            return JSON.stringify(context).substring(0, 249);
        }
        return String(context).substring(0, 249);
    }

    private writeLog(
        level: string,
        message: any,
        context?: any,
        trace?: string,
    ) {
        if (!this.isProduction) return;

        try {
            const point = new Point("log")
                .tag("level", level)
                .tag("context", this.normalizeContext(context || this.context))
                .stringField("message", this.stringify(message))
                .timestamp(new Date());

            if (trace) {
                point.stringField("trace", trace);
            }

            this.writeApi.writePoint(point);
        } catch (err) {
            super.error("Failed to write to InfluxDB", err);
        }
    }

    private stringify(message: any): string {
        if (typeof message === "object") {
            return JSON.stringify(message);
        }
        return String(message);
    }

    private async flush(): Promise<void> {
        try {
            await this.writeApi.flush();
        } catch (err) {
            super.error("Flush failed:", err);
        }
    }

    log(message: any, context?: string) {
        this.writeLog("info", message, context);
        super.log(message, context);
    }

    error(message: any, trace?: string, context?: string) {
        this.writeLog("error", message, context, trace);
        super.error(message, trace, context);
    }

    warn(message: any, context?: string) {
        this.writeLog("warn", message, context);
        super.warn(message, context);
    }

    debug(message: any, context?: string) {
        this.writeLog("debug", message, context);
        super.debug(message, context);
    }

    verbose(message: any, context?: string) {
        this.writeLog("verbose", message, context);
        super.verbose(message, context);
    }

    async onApplicationShutdown() {
        if (this.isProduction) {
            clearInterval(this.flushInterval);
            try {
                await this.flush();
                await this.writeApi.close();
            } catch (err) {
                console.error("Error closing InfluxDB:", err);
            }
        }
    }
}
