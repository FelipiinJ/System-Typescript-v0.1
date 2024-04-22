import { Schema } from "mongoose";

export const memberSchema = new Schema(
    {
        guildId: { type: String, required: true },
        idfarm: { type: String, required: true },
        namefarm: { type: String, required: true },
        rolefac: { type: String, required: true },
        discordid: { type: String, required: true },
        farm1: { type: Number, default: 0, required: true },
        farm2: { type: Number, default: 0, required: true },
        farm3: { type: Number, default: 0, required: true },
        farm4: { type: Number, default: 0, required: true },
        status: { type: String, required: true },
    },
    {
        timestamps: true,
        statics: {
            async get(member) {
                const query = { idfarm: member.id, guildId: member.guild.id };
                return await this.findOne(query) ?? this.create(query);
            }
        }
    },
);