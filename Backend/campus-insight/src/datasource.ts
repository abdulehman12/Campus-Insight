import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from "typeorm";
import ormconfig from "./ormconfig";

// Change 'export default' to 'export const ...'
export const connectionSource = new DataSource(ormconfig);
