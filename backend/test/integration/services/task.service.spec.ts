import { TaskService } from "@/transient-services/task/task.service";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("Task Service Integration Tests ", () => {
    let taskService: TaskService;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;

    beforeAll(async () => {
        const { module, dataSource } = await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        taskService = module.get(TaskService);
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
    });

    describe("createOneTimeTask", () => {
        it("should create and execute a one-time task successfully", async () => {
            // Arrange
            const taskId = "test-task-1";
            let taskExecuted = false;
            const task = async () => {
                taskExecuted = true;
            };
            const runInMs = 100;

            // Act
            await taskService.createOneTimeTask(taskId, task, runInMs);

            // Assert
            expect(taskExecuted).toBeFalsy(); // Task shouldn't execute immediately

            // Wait for task execution
            await new Promise((resolve) => setTimeout(resolve, runInMs + 50));
            expect(taskExecuted).toBeTruthy();

            taskExecuted = false; // reset
            await new Promise((resolve) => setTimeout(resolve, runInMs + 101));
            expect(taskExecuted).toBeFalsy(); // should not have been executed again
        });

        it("should throw error when runInMs is less than or equal to 0", async () => {
            // Arrange
            const taskId = "test-task-2";
            const task = async () => {};
            const runInMs = 0;

            // Act & Assert
            await expect(
                taskService.createOneTimeTask(taskId, task, runInMs),
            ).rejects.toThrow(
                "Invalid value for runInMs, must be greater than 0: 0",
            );
        });

        it("should handle task execution errors gracefully", async () => {
            // Arrange
            const taskId = "test-task-3";
            const task = async () => {
                throw new Error("Task execution failed");
            };
            const runInMs = 100;

            // Act
            await taskService.createOneTimeTask(taskId, task, runInMs);

            // Assert - should not throw error
            await new Promise((resolve) => setTimeout(resolve, runInMs + 50));
        });
    });

    describe("abortOneTimeTask", () => {
        it("should successfully abort a scheduled task", async () => {
            // Arrange
            const taskId = "test-task-4";
            let taskExecuted = false;
            const task = async () => {
                taskExecuted = true;
            };
            const runInMs = 200;

            // Act
            await taskService.createOneTimeTask(taskId, task, runInMs);

            // Wait a bit but not enough for task execution
            await new Promise((resolve) => setTimeout(resolve, 50));

            const abortResult = await taskService.abortOneTimeTask(taskId);

            // Wait to ensure task doesn't execute
            await new Promise((resolve) => setTimeout(resolve, runInMs + 50));

            // Assert
            expect(abortResult).toBeTruthy();
            expect(taskExecuted).toBeFalsy();
        });

        it("should return false when trying to abort non-existent task", async () => {
            // Arrange
            const nonExistentTaskId = "non-existent-task";

            // Act
            const result =
                await taskService.abortOneTimeTask(nonExistentTaskId);

            // Assert
            expect(result).toBeFalsy();
        });

        it("should allow creating new task after aborting previous one with same id", async () => {
            // Arrange
            const taskId = "test-task-5";
            let taskExecutionCount = 0;
            const task = async () => {
                taskExecutionCount++;
            };
            const runInMs = 200;

            // Act
            await taskService.createOneTimeTask(taskId, task, runInMs);
            await taskService.abortOneTimeTask(taskId);
            await taskService.createOneTimeTask(taskId, task, 100);

            // Wait for second task execution
            await new Promise((resolve) => setTimeout(resolve, 150));

            // Assert
            expect(taskExecutionCount).toBe(1);
        });
    });
});
