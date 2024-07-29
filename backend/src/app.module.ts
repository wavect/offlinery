import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import {isDevBuild} from "./utils/env.utils";

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    playground: isDevBuild(),
    autoSchemaFile: true,
    sortSchema: true,
  })],
  providers: [AppService, AppResolver],
})
export class AppModule {}
