import { GuildSchema } from "#database";
import { formatedChannelMention, icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder } from "discord.js";
import { settingsNav } from "./nav.js";

export const settingsChannelsOptions = [
    { emoji: "📄", label: "Logs", value: "logs", description: "Canal de Logs" },
    { emoji: "💬", label: "Bate-papo", value: "general", description: "Bate Papo Geral" },
] as const;

export function settingsChannelsMenu(guildData: GuildSchema) {
    const channels = guildData.channels ?? {};

    const display = settingsChannelsOptions.map(({ emoji, label, value }) =>
        `- ${emoji} ${label} ${formatedChannelMention(channels[value]?.id, "`Não Definido`")}`
    );

    const embed = createEmbed({
        color: settings.colors.primary,
        description: brBuilder(
            `${icon(":a:setawhite")} Configurar Canais`,
            "",
            display
        )
    });

    const row = createRow(
        new StringSelectMenuBuilder({
            customId: "menu/settings/channels/select",
            placeholder: "Seelecione o canal que deseja",
            options: Array.from(settingsChannelsOptions)
        })
    );

    const navRow = createRow(settingsNav.main);

    return { ephemeral, embeds: [embed], components: [row, navRow] }
}

export function settingsChannelMenu(guildData: GuildSchema, selected: string) {
    const channels = (guildData.channels ?? {}) as Record<string, { id: string }>;

    const { emoji, label } = settingsChannelsOptions.find(({ value }) => value === selected)!;

    const embed = createEmbed({
        color: settings.colors.warning,
        description: brBuilder(
            `${icon(":a:setawhite")} Alterar o canal ${emoji} ${label}`,
            `Atual: ${formatedChannelMention(channels[selected]?.id, "`Não Definido`")}`
        )
    });

    const selectRow = createRow(
        new ChannelSelectMenuBuilder({
            customId: `menu/settings/channel/${selected}`,
            placeholder: "Selecione o canal que deseja definir",
            channelTypes: [ChannelType.GuildText]
        })
    );

    const navRow = createRow(
        settingsNav.back("channels"),
        settingsNav.main,
    );

    return { ephemeral, embeds: [embed], components: [selectRow, navRow] }
}