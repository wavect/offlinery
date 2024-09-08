import { User } from "@/entities/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MapService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
}
