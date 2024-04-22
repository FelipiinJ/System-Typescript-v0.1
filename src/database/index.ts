import { log } from "#settings";
import chalk from "chalk";
import mongoose, { InferSchemaType, model } from "mongoose";
import { farmSchema } from "./schemas/farm.js";
import { guildSchema } from "./schemas/guild.js";
import { memberSchema } from "./schemas/member.js";

mongoose.connect(process.env.MONGO_URI, { dbName: "database" })
   .then(() => {
      log.success(chalk.green("MongoDB connected"));
   })
   .catch((err) => {
      log.error(err);
      process.exit(1);
   });

export const db = {
   guilds: model("guild", guildSchema, "guilds"),
   members: model("member", memberSchema, "members"),
   farms: model("farm", farmSchema, "farms")
};

export type GuildSchema = InferSchemaType<typeof guildSchema>;
export type MemberSchema = InferSchemaType<typeof memberSchema>;
export type FarmSchema = InferSchemaType<typeof farmSchema>;