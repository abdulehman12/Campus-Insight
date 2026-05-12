import * as dotenv from 'dotenv';
dotenv.config();
import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'campus_insight',
 entities: [__dirname + '/**/*.entity.{ts,js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*.{ts,js}'],

};

export default config;