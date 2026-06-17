if(process.env.IS_TS_NODE){
  require('module-alias/register');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://campus-insight-3qtwp666h-abdul-rehman-siddiqui-s-projects.vercel.app', 
      'http://localhost:5175', 
      'http://localhost:3000',
      "https://campus-insight.vercel.app"
    ], // Allow all origins (you can specify specific origins if needed)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Accept, Authorization', // Allowed headers
    credentials: true, // Allow cookies to be sent with requests
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
