import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './User/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './User/middlewares/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './Admin/admin.module';
import { InsightModule } from './Insights/insight.module';
import { ProfileModule } from './Profile/profile.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), UserModule, AdminModule,InsightModule,ProfileModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      envFilePath: '.env', // Points to your env file
    }),
    ServeStaticModule.forRoot({
         rootPath: join(__dirname, '..', 'uploads'), // path to your uploads folder
         serveRoot: '/uploads', // this matches the URL prefix
       }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
