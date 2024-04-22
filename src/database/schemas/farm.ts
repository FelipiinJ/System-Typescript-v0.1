import { Schema } from "mongoose";

export const farmSchema = new Schema(
    {
        guildId: { type: String, required: true },
        roles: { type: String, required: true },
        farm1: { type: Number, default: 0 },
        farm2: { type: Number, default: 0 },
        farm3: { type: Number, default: 0 },
        farm4: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);