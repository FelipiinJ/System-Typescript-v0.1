import { Modal } from "#base";
import { icon, isNumeric } from "#functions";
import { settings } from "#settings";
import { createEmbed, createModalInput } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    item1: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item2: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item3: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item4: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
});

type FormSchema = z.infer<typeof formSchema>;

export function setFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/set",
        title: "Farm Semanal",
        components: [
            createModalInput({
                customId: "item1/set/farm",
                label: `${settings.farmitens.item1}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item1}.`,
                style: TextInputStyle.Short,
                value: data.item1,
                required,
            }),
            createModalInput({
                customId: "item2/set/farm",
                label: `${settings.farmitens.item2}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item2}.`,
                style: TextInputStyle.Short,
                value: data.item2,
                required,
            }),
            createModalInput({
                customId: "item3/set/farm",
                label: `${settings.farmitens.item3}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item3}.`,
                style: TextInputStyle.Short,
                value: data.item3,
                required,
            }),
            createModalInput({
                customId: "item4/set/farm",
                label: `${settings.farmitens.item4}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item4}.`,
                style: TextInputStyle.Short,
                value: data.item4,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/set",
    cache: "cached", isFromMessage: true,
    async run(interaction) {

        const { guild } = interaction;

        const setitem1: string = interaction.fields.getTextInputValue("item1/set/farm");
        const setitem2: string = interaction.fields.getTextInputValue("item2/set/farm");
        const setitem3: string = interaction.fields.getTextInputValue("item3/set/farm");
        const setitem4: string = interaction.fields.getTextInputValue("item4/set/farm");

        if (!isNumeric(setitem1) || !isNumeric(setitem2) || !isNumeric(setitem3) || !isNumeric(setitem4)) {
            return interaction.reply({ ephemeral, content: 'Por favor, insira apenas valores numéricos.' });
        }

        const Farm = model('Farm', farmSchema);

        try {
            const rowCount = await Farm.countDocuments();
            if (rowCount > 0) {
                return interaction.reply({ ephemeral, content: 'As metas já foram definidas e não podem ser atualizadas.' });
            }

            const fogueteiro = { farm1: +setitem1, farm2: +setitem2, farm3: +setitem3, farm4: +setitem4, roles: "Fogueteiro", guildId: guild.id };
            const morador = { farm1: +setitem1, farm2: +setitem2, farm3: +setitem3, farm4: +setitem4, roles: "Morador", guildId: guild.id };
            const assinado = { farm1: +setitem1, farm2: +setitem2, farm3: +setitem3, farm4: +setitem4, roles: "Assinado", guildId: guild.id };
            const traficante = { farm1: +setitem1, farm2: +setitem2, farm3: +setitem3, farm4: +setitem4, roles: "Traficante", guildId: guild.id };
            const soldado = { farm1: +setitem1, farm2: +setitem2, farm3: +setitem3, farm4: +setitem4, roles: "Soldado", guildId: guild.id };

            await Promise.all([
                Farm.create(fogueteiro),
                Farm.create(morador),
                Farm.create(assinado),
                Farm.create(traficante),
                Farm.create(soldado),
            ]);

            const embed = createEmbed({
                color: settings.colors.default,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                title: `${icon(":a:info")} Metas Semanais Definidas.`,
                description: `As metas semanais foram definidas para todos os Cargos.`,
                footer: {
                    text: `™ ${settings.server.name} © All rights reserved`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            await interaction.reply({ ephemeral, embeds: [embed] });

        } catch (error) {
            console.error('Erro ao definir metas semanais:', error);
            await interaction.reply({ ephemeral, content: 'Ocorreu um erro ao processar a solicitação.' });
        }
        return;
    },
});