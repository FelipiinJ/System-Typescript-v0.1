import { Command, Component } from "#base";
import { icon } from "#functions";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { memberSchema } from "database/schemas/member.js";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, ComponentType } from "discord.js";
import { sendFarmModal } from "discord/modals/index.js";
import { model } from "mongoose";

new Command({
    name: "sendfarm",
    description: "Sistema de Farm V2.0",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,

    options: [
        {
            name: "channel",
            description: "Selecione o canal para enviar o sistema de Farm",
            type: ApplicationCommandOptionType.Channel
        }
    ],

    async run(interaction) {

        if (!interaction.member.roles.cache.has(`${settings.server.permission}`)) {
            interaction.reply({ ephemeral, content: "Você não possui permissão para usar este comando" })
        } else {

            const channel = interaction.options.getChannel("channel")

            if (channel?.type != ChannelType.GuildText) {
                interaction.reply({ ephemeral, content: "Selecione um canal de texto" })
            } else {

                const embed = createEmbed({
                    color: settings.colors.default,
                    description: `Sistema ativado com sucesso!\nCanal selecionado: ${channel}`,
                    footer: {
                        text: `™ ${settings.server.name} © All rights reserved`,
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    }
                });

                const embedfarm = createEmbed({
                    color: settings.colors.default,
                    title: `**SISTEMA DE FARM**`,
                    thumbnail: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&",
                    description: `Gerencie o seu farm, utilizando os botões abaixo. #BOPEGGPKRL`,
                    footer: {
                        text: `™ ${settings.server.name} © All rights reserved`,
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    }
                });

                const row = createRow(
                    new ButtonBuilder({
                        customId: "farm/send",
                        label: "Entregar",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/see",
                        label: "Ver Farm",
                        style: ButtonStyle.Secondary
                    })
                );

                interaction.reply({ ephemeral, embeds: [embed], }).then(() => {
                    channel.send({ embeds: [embedfarm], components: [row] })
                })
            }
        }
    }
});

new Component({
    customId: "farm/send",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        interaction.showModal(sendFarmModal());

    },
});

new Component({
    customId: "farm/see",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Member = model('Member', memberSchema);
        const Farm = model('Farm', farmSchema);

        try {
            const memberInfo = await Member.findOne({ discordid: interaction.user.id }).exec();

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
                title: `${icon(":a:info")} **Dados do Seu Farm**`,
                description: `
                ${icon(":a:setabope")} **Nome:** \`${memberInfo.namefarm}\`
                ${icon(":a:setabope")} **Discord:** \`${memberInfo.discordid}\`
                ${icon(":a:setabope")} **Passaporte:** \`${memberInfo.idfarm}\`
                ${icon(":a:setabope")} **Cargo:** \`${memberInfo.rolefac}\`
                ${icon(":a:setabope")} **${settings.farmitens.item1}:** \`${memberInfo.farm1}/${farmInfo.farm1}\`
                ${icon(":a:setabope")} **${settings.farmitens.item2}:** \`${memberInfo.farm2}/${farmInfo.farm2}\`
                ${icon(":a:setabope")} **${settings.farmitens.item3}:** \`${memberInfo.farm3}/${farmInfo.farm3}\`
                ${icon(":a:setabope")} **${settings.farmitens.item4}:** \`${memberInfo.farm4}/${farmInfo.farm4}\`
                ${icon(":a:setabope")} **Status:** \`${memberInfo.status}\` ${memberInfo.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`
            });

            await interaction.reply({ ephemeral, embeds: [embed] });

        } catch (error) {
            console.error('Erro ao buscar informações do membro:', error);
            await interaction.reply({ ephemeral, content: `${icon(":a:load")} Ocorreu um erro ao processar a solicitação.` });
        }
        return;
    },
});