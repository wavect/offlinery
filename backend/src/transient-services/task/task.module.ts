import { UserModule } from "@/entities/user/user.module";
import { forwardRef, Module } from "@nestjs/common";
import { TaskService } from "./task.service";

@Module({
    imports: [forwardRef(() => UserModule)],
    controllers: [],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}
