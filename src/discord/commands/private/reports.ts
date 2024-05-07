import { Command, Component } from "#base";
import { icon, splitArrayIntoChunks } from "#functions";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { memberSchema } from "database/schemas/member.js";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelType, ComponentType } from "discord.js";
import { model } from "mongoose";

new Command({
    name: "reportsystem",
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
                    description: `Visualize os relatório de farm dos membros da facção, utilizando os botões abaixo. #BOPEGGPKRL`,
                    footer: {
                        text: `™ ${settings.server.name} © All rights reserved`,
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    }
                });

                const row = createRow(
                    new ButtonBuilder({
                        customId: "farm/report/soldado",
                        label: "Soldados",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/report/traficante",
                        label: "Traficantes",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/report/assinado",
                        label: "Assinados",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/report/morador",
                        label: "Moradores",
                        style: ButtonStyle.Secondary
                    }),
                    new ButtonBuilder({
                        customId: "farm/report/fogueteiro",
                        label: "Fogueteiros",
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
    customId: "farm/report/soldado",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

            if (!members || members.length === 0) {
                console.log('Nenhum membro encontrado.');
                return;
            }

            const soldiers2 = members.filter((member: any) => member.rolefac === 'Soldado');

            const soldiers2Info = soldiers2.map((member: any) => `${icon(":a:setabope")} **Nome:** \`${member.namefarm}\` | **(${member.idfarm})** | **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

            const embedChunks: string[][] = [
                soldiers2Info,
            ];

            for (const chunk of embedChunks) {
                const formattedChunk = splitArrayIntoChunks(chunk, 30);
                for (const subChunk of formattedChunk) {
                    const logMessage = createEmbed({
                        color: settings.colors.default,
                        author: {
                            name: `${settings.server.name} | Sistema de Farm`,
                            iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                        },
                        title: `${icon(":a:info")} RELATÓRIO ${icon(":a:info")} \n`,
                        description: `${icon(":a:setabope")} **SOLDADOS**\n\n${subChunk.join('\n')}`,
                        footer: {
                            text: `Relatório finalizado por: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    });

                    await interaction.reply({ ephemeral: true, embeds: [logMessage] });
                }
            }
        } catch (error) {
            console.error('Erro ao processar a interação "farm/report":', error);
        }
        return;
    },
});

new Component({
    customId: "farm/report/traficante",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

            if (!members || members.length === 0) {
                console.log('Nenhum membro encontrado.');
                return;
            }

            const soldiers2 = members.filter((member: any) => member.rolefac === 'Traficante');

            const soldiers2Info = soldiers2.map((member: any) => `${icon(":a:setabope")} **Nome:** \`${member.namefarm}\` | **(${member.idfarm})** | **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

            const embedChunks: string[][] = [
                soldiers2Info,
            ];

            for (const chunk of embedChunks) {
                const formattedChunk = splitArrayIntoChunks(chunk, 30);
                for (const subChunk of formattedChunk) {
                    const logMessage = createEmbed({
                        color: settings.colors.default,
                        author: {
                            name: `${settings.server.name} | Sistema de Farm`,
                            iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                        },
                        title: `${icon(":a:info")} RELATÓRIO ${icon(":a:info")} \n`,
                        description: `${icon(":a:setabope")} **TRAFICANTES**\n\n${subChunk.join('\n')}`,
                        footer: {
                            text: `Relatório finalizado por: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    });

                    await interaction.reply({ ephemeral: true, embeds: [logMessage] });
                }
            }
        } catch (error) {
            console.error('Erro ao processar a interação "farm/report":', error);
        }
        return;
    },
});

new Component({
    customId: "farm/report/assinado",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

            if (!members || members.length === 0) {
                console.log('Nenhum membro encontrado.');
                return;
            }

            const soldiers2 = members.filter((member: any) => member.rolefac === 'Assinado');

            const soldiers2Info = soldiers2.map((member: any) => `${icon(":a:setabope")} **Nome:** \`${member.namefarm}\` | **(${member.idfarm})** | **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

            const embedChunks: string[][] = [
                soldiers2Info,
            ];

            for (const chunk of embedChunks) {
                const formattedChunk = splitArrayIntoChunks(chunk, 30);
                for (const subChunk of formattedChunk) {
                    const logMessage = createEmbed({
                        color: settings.colors.default,
                        author: {
                            name: `${settings.server.name} | Sistema de Farm`,
                            iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                        },
                        title: `${icon(":a:info")} RELATÓRIO ${icon(":a:info")} \n`,
                        description: `${icon(":a:setabope")} **ASSINADOS**\n\n${subChunk.join('\n')}`,
                        footer: {
                            text: `Relatório finalizado por: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    });

                    await interaction.reply({ ephemeral: true, embeds: [logMessage] });
                }
            }
        } catch (error) {
            console.error('Erro ao processar a interação "farm/report":', error);
        }
        return;
    },
});

new Component({
    customId: "farm/report/morador",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

            if (!members || members.length === 0) {
                console.log('Nenhum membro encontrado.');
                return;
            }

            const soldiers2 = members.filter((member: any) => member.rolefac === 'Morador');

            const soldiers2Info = soldiers2.map((member: any) => `${icon(":a:setabope")} **Nome:** \`${member.namefarm}\` | **(${member.idfarm})** | **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

            const embedChunks: string[][] = [
                soldiers2Info,
            ];

            for (const chunk of embedChunks) {
                const formattedChunk = splitArrayIntoChunks(chunk, 30);
                for (const subChunk of formattedChunk) {
                    const logMessage = createEmbed({
                        color: settings.colors.default,
                        author: {
                            name: `${settings.server.name} | Sistema de Farm`,
                            iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                        },
                        title: `${icon(":a:info")} RELATÓRIO ${icon(":a:info")} \n`,
                        description: `${icon(":a:setabope")} **MORADORES**\n\n${subChunk.join('\n')}`,
                        footer: {
                            text: `Relatório finalizado por: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    });

                    await interaction.reply({ ephemeral: true, embeds: [logMessage] });
                }
            }
        } catch (error) {
            console.error('Erro ao processar a interação "farm/report":', error);
        }
        return;
    },
});

new Component({
    customId: "farm/report/fogueteiro",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Farm = model('Farm', farmSchema);
        const Member = model('Member', memberSchema);

        try {
            const farmRows = await Farm.find();

            if (farmRows.length === 0) {
                return interaction.reply({ ephemeral, content: `${icon(":a:load")} Por favor, defina as metas semanais antes de tentar finalizar o farm.` });
            }

            const members = await Member.find({ rolefac: { $in: ['Fogueteiro', 'Morador', 'Assinado', 'Traficante', 'Soldado'] } });

            if (!members || members.length === 0) {
                console.log('Nenhum membro encontrado.');
                return;
            }

            const soldiers2 = members.filter((member: any) => member.rolefac === 'Fogueteiro');

            const soldiers2Info = soldiers2.map((member: any) => `${icon(":a:setabope")} **Nome:** \`${member.namefarm}\` | **(${member.idfarm})** | **Farm:** \`${member.status}\` ${member.status === 'Incompleto' ? `${icon(":a:load")}` : `${icon(":a:verifypurple")}`}`);

            const embedChunks: string[][] = [
                soldiers2Info,
            ];

            for (const chunk of embedChunks) {
                const formattedChunk = splitArrayIntoChunks(chunk, 30);
                for (const subChunk of formattedChunk) {
                    const logMessage = createEmbed({
                        color: settings.colors.default,
                        author: {
                            name: `${settings.server.name} | Sistema de Farm`,
                            iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                        },
                        title: `${icon(":a:info")} RELATÓRIO ${icon(":a:info")} \n`,
                        description: `${icon(":a:setabope")} **FOGUETEIROS**\n\n${subChunk.join('\n')}`,
                        footer: {
                            text: `Relatório finalizado por: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    });

                    await interaction.reply({ ephemeral: true, embeds: [logMessage] });
                }
            }
        } catch (error) {
            console.error('Erro ao processar a interação "farm/report":', error);
        }
        return;
    },
});