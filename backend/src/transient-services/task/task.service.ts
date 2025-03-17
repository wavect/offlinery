import { BaseEntity } from "@/entities/base.entity";
import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(private schedulerRegistry: SchedulerRegistry) {}

    public generateUniqueDeterministicTaskId = (entity: BaseEntity) => {
        return `task-${entity.id}-${entity.created.toISOString()}`;
    };

    public async createOneTimeTask(
        taskId: string,
        task: () => Promise<void>,
        runInMs: number,
    ) {
        if (runInMs <= 0) {
            throw new Error(
                `Invalid value for runInMs, must be greater than 0: ${runInMs}`,
            );
        }
        const timeout = setTimeout(async () => {
            try {
                await task();
            } catch (error) {
                this.logger.error(
                    `Could not execute one time task with id ${taskId} because of: ${error?.message ?? JSON.stringify(error)}`,
                );
            }
        }, runInMs);
        this.schedulerRegistry.addTimeout(taskId, timeout);
    }

    /** @dev Abort one time task.
     * @returns boolean: true = task aborted, false = error or no task with taskId found. */
    public async abortOneTimeTask(taskId: string): Promise<boolean> {
        try {
            this.schedulerRegistry.deleteTimeout(taskId);
            this.logger.debug(`Aborting task with id ${taskId}`);
            return true;
        } catch (error) {
            // Handle case where timeout doesn't exist
            this.logger.error(`No task found to cancel with taskId ${taskId}`);
            return false;
        }
    }
}
