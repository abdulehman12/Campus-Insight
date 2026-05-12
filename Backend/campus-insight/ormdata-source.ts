
import { DataSource } from "typeorm";
import ormconfig from "./src/ormconfig";

// Change 'export default' to 'export const ...'
export const connectionSource = new DataSource(ormconfig);
