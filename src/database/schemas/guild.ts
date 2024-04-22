import { Schema } from "mongoose";
import { t } from "../utils.js";

export const guildSchema = new Schema(
    {
        id: t.string,
        channels: {
            logs: t.channelInfo,
            general: t.channelInfo,
        },
        roles: {
            admin: t.roleInfo,
            mod: t.roleInfo,
            member: t.roleInfo,
        }
    },
    {
        statics: {
            async get(id: string) {
                return await this.findOne({ id }) ?? this.create({ id });
            }
        }
    }
);