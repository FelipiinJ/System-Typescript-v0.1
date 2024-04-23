import { Command, Component } from "#base";
import { getFormattedTime, icon, splitArrayIntoChunks } from "#functions";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { memberSchema } from "database/schemas/member.js";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, TextChannel } from "discord.js";
import { checkFarmModal } from "discord/modals/forms/check.js";
import { registerFarmModal } from "discord/modals/forms/register.js";
import { removeFarmModal } from "discord/modals/forms/remove.js";
import { setFarmModal } from "discord/modals/forms/set.js";
import { model } from "mongoose";

new Command({
    name: "farmsystem",
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
                    description: `Gerencie os farms dos  membros da facção, utilizando os botões abaixo. #BOPEGGPKRL`,
                    footer: {
                        text: `™ ${settings.server.name} © All rights reserved`,
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    }
                });

                const row = createRow(
                    new ButtonBuilder({
                        customId: "farm/register",
                        label: "Registrar",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/remove",
                        label: "Remover",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/set",
                        label: "Definir",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/check",
                        label: "Pesquisar",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/finish",
                        label: "Finalizar",
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
    customId: "farm/register",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        interaction.showModal(registerFarmModal());

    },
});

new Component({
    customId: "farm/remove",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        interaction.showModal(removeFarmModal());

    },
});

new Component({
    customId: "farm/set",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        interaction.showModal(setFarmModal());

    },
});

new Component({
    customId: "farm/check",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        interaction.showModal(checkFarmModal());

    },
});

new Component({
    customId: "farm/finish",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const confirmationMessage = createEmbed({
                color: settings.colors.default,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                title: `${icon(":a:info")} Requisição de Finalização.`,
                description: `Você tem certeza que quer finalizar o farm semanal ?`,
                footer: {
                    text: `™ ${settings.server.name} © All rights reserved`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            const buttonRow = createRow(
                new ButtonBuilder({
                    customId: "confirm/finish/farm",
                    label: "Confirmar",
                    style: ButtonStyle.Secondary
                }),
                new ButtonBuilder({
                    customId: "cancel/finish/farm",
                    label: "Cancelar",
                    style: ButtonStyle.Secondary
                })
            );

            await interaction.reply({ ephemeral, embeds: [confirmationMessage], components: [buttonRow] });

            const filter = (i: any) => i.customId === 'confirm/finish/farm' || i.customId === 'cancel/finish/farm';

            const collector = interaction.channel?.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            const handleInteraction = async (i: any) => {
                try {
                    if (i.customId === 'confirm/finish/farm') {
                        const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

                        if (!members || members.length === 0) {
                            console.log('Nenhum membro encontrado.');
                            return;
                        }

                        const soldiers2 = members.filter((member: any) => member.rolefac === 'Soldado');
                        const gerentes = members.filter((member: any) => member.rolefac === 'Traficante');
                        const soldiers = members.filter((member: any) => member.rolefac === 'Assinado');
                        const membersList = members.filter((member: any) => member.rolefac === 'Morador');
                        const scouts = members.filter((member: any) => member.rolefac === 'Fogueteiro');

                        const soldiers2Info = soldiers2.map((member: any) => `**Nome:** \`${member.namefarm}\` **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);
                        const gerentesInfo = gerentes.map((member: any) => `**Nome:** \`${member.namefarm}\` **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);
                        const soldiersInfo = soldiers.map((member: any) => `**Nome:** \`${member.namefarm}\` **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);
                        const membersInfo = membersList.map((member: any) => `**Nome:** \`${member.namefarm}\` **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);
                        const scoutsInfo = scouts.map((member: any) => `**Nome:** \`${member.namefarm}\` **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

                        const formattedTime = getFormattedTime();

                        const sendEmbed = async (info: string[], name: string) => {
                            const logMessage = createEmbed({
                                color: settings.colors.default,
                                author: {
                                    name: `${settings.server.name} | Sistema de Farm`,
                                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                                },
                                title: `${icon(":a:info")} RELATÓRIO SEMANAL ${icon(":a:info")} \nRelatório finalizado em: ${formattedTime}\n`,
                                description: `${icon(":a:setabope")} **${name}**\n${info.join('\n')}`,
                                footer: {
                                    text: `Relatório finalizado por: ${interaction.user.tag}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                }
                            });

                            const channelId = `${settings.server.finishFarmReport}`;

                            const logChannel = interaction.guild.channels.cache.get(channelId) as TextChannel;

                            if (logChannel) {
                                await logChannel.send({ embeds: [logMessage] });
                            }
                        };

                        const chunks5 = splitArrayIntoChunks(soldiers2Info, 30);
                        for (const chunk of chunks5) {
                            await sendEmbed(chunk, 'SOLDADOS');
                        }

                        const chunks = splitArrayIntoChunks(gerentesInfo, 30);
                        for (const chunk of chunks) {
                            await sendEmbed(chunk, 'TRAFICANTES');
                        }

                        const chunks2 = splitArrayIntoChunks(soldiersInfo, 30);
                        for (const chunk of chunks2) {
                            await sendEmbed(chunk, 'ASSINADOS');
                        }

                        const chunks3 = splitArrayIntoChunks(membersInfo, 30);
                        for (const chunk of chunks3) {
                            await sendEmbed(chunk, 'MORADORES');
                        }

                        const chunks4 = splitArrayIntoChunks(scoutsInfo, 30);
                        for (const chunk of chunks4) {
                            await sendEmbed(chunk, 'FOGUETEIROS');
                        }

                        await Farm.deleteMany({});
                        await Member.updateMany({ status: 'Incompleto' });
                        await Member.updateMany({}, { farm1: 0, farm2: 0, farm3: 0, farm4: 0 });

                        const confirmMessage = createEmbed({
                            color: settings.colors.success,
                            author: {
                                name: `${settings.server.name} | Sistema de Farm`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            },
                            title: `${icon(":a:info")} Farm Finalizado com Sucesso.`,
                            description: `Uma log completa foi enviada para o canal <#${settings.server.sendFarmReport}>. Confira lá para mais detalhes.`,
                            footer: {
                                text: `™ ${settings.server.name} © All rights reserved`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            }
                        });

                        await interaction.editReply({ embeds: [confirmMessage], components: [] });

                    } else if (i.customId === 'cancel/finish/farm') {

                        const cancelMessage = createEmbed({
                            color: settings.colors.danger,
                            author: {
                                name: `${settings.server.name} | Sistema de Farm`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            },
                            title: `${icon(":a:info")} Farm não foi finalizado.`,
                            description: `O Farm não foi finalizado, caro queira finalizar basta clicar no botão "Confirmar" da proxima vez.`,
                            footer: {
                                text: `™ ${settings.server.name} © All rights reserved`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            }
                        });

                        await interaction.editReply({ embeds: [cancelMessage], components: [] });
                    }
                } catch (error) {
                    console.error('Erro ao processar a interação "finishfarm":', error);
                } finally {
                    collector?.off('collect', handleInteraction);
                    collector?.stop();
                }
            };

            collector?.on('collect', handleInteraction);

        } catch (error) {
            console.error('Erro ao processar a interação "finishfarm":', error);
        }
        return;
    },
});