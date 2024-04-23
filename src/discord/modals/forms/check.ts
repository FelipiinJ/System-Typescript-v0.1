import { Modal } from "#base";
import { icon, isNumeric } from "#functions";
import { settings } from "#settings";
import { createEmbed, createModalInput } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { memberSchema } from "database/schemas/member.js";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    id: z.coerce.number({ invalid_type_error: "O id deve conter apenas números!" }).min(1, "ID informado inválido"),
});

type FormSchema = z.infer<typeof formSchema>;

export function checkFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/check",
        title: "Andamento do Farm",
        components: [
            createModalInput({
                customId: "id/check/farm",
                label: "Informe o passaporte:",
                placeholder: "Informe o passaporte: (4466)",
                style: TextInputStyle.Short,
                value: data.id,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/check",
    cache: "cached", isFromMessage: true,
    async run(interaction) {
        const searchmember: string = interaction.fields.getTextInputValue('id/check/farm');

        if (!isNumeric(searchmember)) {
            return interaction.reply({ ephemeral, content: 'Por favor, insira um número válido.' });
        }

        const Member = model('Member', memberSchema);
        const Farm = model('Farm', farmSchema);

        try {
            const memberInfo = await Member.findOne({ idfarm: searchmember }).exec();

            if (!memberInfo) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Membro não encontrado.` });
            }

            const userRole = memberInfo.rolefac;

            const farmInfo = await Farm.findOne({ roles: userRole }).exec();

            if (!farmInfo) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de buscar as informações.` });
            }

            const embed = createEmbed({
                color: settings.colors.default,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                title: `${icon(":a:info")} **Dados do Usuário**`,
                description: `
                ${icon(":a:setabope")} **Nome:** \`${memberInfo.namefarm}\`
                ${icon(":a:setabope")} **Discord:** \`${memberInfo.discordid}\`
                ${icon(":a:setabope")} **Passaporte:** \`${memberInfo.idfarm}\`
                ${icon(":a:setabope")} **Cargo:** \`${memberInfo.rolefac}\`
                ${icon(":a:setabope")} **${settings.farmitens.item1}:** \`${memberInfo.farm1}/${farmInfo.farm1}\`
            	${icon(":a:setabope")} **${settings.farmitens.item2}:** \`${memberInfo.farm2}/${farmInfo.farm2}\`
                ${icon(":a:setabope")} **${settings.farmitens.item3}:** \`${memberInfo.farm3}/${farmInfo.farm3}\`
                ${icon(":a:setabope")} **${settings.farmitens.item4}:** \`${memberInfo.farm4}/${farmInfo.farm4}\`
                ${icon(":a:setabope")} **Status:** \`${memberInfo.status}\` ${memberInfo.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`,

                footer: {
                    text: `™ ${settings.server.name} © All rights reserved`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            await interaction.reply({ ephemeral, embeds: [embed] });

        } catch (error) {
            console.error('Erro ao buscar informações do membro:', error);
            await interaction.reply({ ephemeral, content: `${icon(":a:load")} Ocorreu um erro ao processar a solicitação.` });
        }
        return;
    },
});