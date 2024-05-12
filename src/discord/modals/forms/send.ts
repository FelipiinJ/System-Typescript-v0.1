import { Modal } from "#base";
import { getFormattedTime, icon, isNumeric, isValidImageUrl } from "#functions";
import { settings } from "#settings";
import { createEmbed, createModalInput, createRow } from "@magicyan/discord";
import { farmSchema } from "database/schemas/farm.js";
import { memberSchema } from "database/schemas/member.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelSelectMenuInteraction, ChannelType, InteractionCollector, MentionableSelectMenuInteraction, ModalBuilder, RoleSelectMenuInteraction, StringSelectMenuInteraction, TextChannel, TextInputStyle, UserSelectMenuInteraction } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    item1: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item2: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item3: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    item4: z.coerce.number({ invalid_type_error: "A quantidade deve conter apenas números!" }).min(1, "Quantidade informado inválido"),
    print: z.string().min(2, "O nome deve ter mais que 2 caracteres!"),
});

type FormSchema = z.infer<typeof formSchema>;

export function sendFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/send",
        title: "Andamento do Farm",
        components: [
            createModalInput({
                customId: "item1/send/farm",
                label: `${settings.farmitens.item1}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item1}.`,
                style: TextInputStyle.Short,
                value: data.item1,
                required,
            }),
            createModalInput({
                customId: "item2/send/farm",
                label: `${settings.farmitens.item2}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item2}.`,
                style: TextInputStyle.Short,
                value: data.item2,
                required,
            }),
            createModalInput({
                customId: "item3/send/farm",
                label: `${settings.farmitens.item3}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item3}.`,
                style: TextInputStyle.Short,
                value: data.item3,
                required,
            }),
            createModalInput({
                customId: "item4/send/farm",
                label: `${settings.farmitens.item4}`,
                placeholder: `Informe a quantidade de ${settings.farmitens.item4}.`,
                style: TextInputStyle.Short,
                value: data.item4,
                required,
            }),
            createModalInput({
                customId: "print/send/farm",
                label: "Insira a URL:",
                placeholder: "Insira a URL da sua Captura de Tela.",
                style: TextInputStyle.Short,
                value: data.print,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/send",
    cache: "cached", isFromMessage: true,
    async run(interaction) {

        let senditem1 = interaction.fields.getTextInputValue('item1/send/farm');
        let senditem2 = interaction.fields.getTextInputValue('item2/send/farm');
        let senditem3 = interaction.fields.getTextInputValue('item3/send/farm');
        let senditem4 = interaction.fields.getTextInputValue('item4/send/farm');
        let sendpicture = interaction.fields.getTextInputValue('print/send/farm');

        const Member = model('Member', memberSchema);
        const Farm = model('Farm', farmSchema);

        if (!isNumeric(senditem1) || !isNumeric(senditem2) || !isNumeric(senditem3)) {
            return interaction.reply({ ephemeral, content: 'Por favor, insira apenas valores numéricos.' });
        }

        if (!isValidImageUrl(sendpicture)) {

            const invalidUrlMessage = createEmbed({
                color: settings.colors.danger,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                title: "**VALIDAÇÃO URL**",
                description: `A URL fornecida para a imagem não é válida.`,

                footer: {
                    text: `™ ${settings.server.name} © All rights reserved`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            await interaction.reply({ ephemeral, embeds: [invalidUrlMessage] });

            return;
        }

        const specialCharsRegex = /[./@#]/;

        if (specialCharsRegex.test(senditem1) || specialCharsRegex.test(senditem2) || specialCharsRegex.test(senditem3)) {
            return interaction.reply({ ephemeral, content: 'Por favor, evite usar caracteres especiais como ".", "/", "@", ou "#".' });
        }

        const channelName = `farm-${interaction.user.username}`;

        const logChannelId = `${settings.server.sendFarmReport}`;

        const collectorsArray: InteractionCollector<StringSelectMenuInteraction<CacheType> | UserSelectMenuInteraction<CacheType> | RoleSelectMenuInteraction<CacheType> | MentionableSelectMenuInteraction<CacheType> | ChannelSelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>>[] = [];

        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);

        if (existingChannel) {
            await interaction.reply({ ephemeral, content: 'Você já tem um canal de farm em andamento.' });
        } else {
            const createdChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: `${settings.server.farmCategory}`,
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel"],
                    },
                    {
                        id: `${settings.server.permission}`,
                        allow: ["ViewChannel"],
                    },
                ],
            });

            const userDiscordId = interaction.user.id;

            const existingMember = await Member.findOne({ discordid: userDiscordId });
            if (!existingMember) {
                await interaction.reply({ ephemeral, content: 'Você não está cadastrado no nosso sistema.' });
                return;
            }

            const embedsource = createEmbed({
                color: settings.colors.default,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                title: `${icon(":a:info")} Registro de Farm Enviado.`,
                description: '\n' +
                    `Seus registros de farm foram enviados. Aguarde a resposta de algum responsável.`,

                footer: {
                    text: `™ ${settings.server.name} © All rights reserved`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            await interaction.reply({ ephemeral, embeds: [embedsource] });

            const formattedTime = getFormattedTime();


            const embed = createEmbed({
                color: settings.colors.default,
                author: {
                    name: `${settings.server.name} | Sistema de Farm`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                },
                thumbnail: interaction.user?.displayAvatarURL({ size: 4096 }),
                title: `${icon(":a:info")} Registro de Farm Enviado.`,
                description:
                    `${icon(":a:setabope")} **Usuário:** <@${interaction.user.id}> solicitou a entrega do Farm.\n\n` +
                    `${icon(":a:setabope")} **${settings.farmitens.item1}:**\n \`${senditem1}\`\n` +
                    `${icon(":a:setabope")} **${settings.farmitens.item2}:**\n \`${senditem2}\`\n` +
                    `${icon(":a:setabope")} **${settings.farmitens.item3}:**\n \`${senditem3}\`\n` +
                    `${icon(":a:setabope")} **${settings.farmitens.item4}:**\n \`${senditem4}\``,
                image: sendpicture,
                footer: {
                    text: `Data da entrega: ${formattedTime}`,
                    iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                }
            });

            const actionRow = createRow(
                new ButtonBuilder({
                    customId: "acceptSend",
                    label: "Aceitar",
                    style: ButtonStyle.Secondary
                }),
                new ButtonBuilder({
                    customId: "declineSend",
                    label: "Recusar",
                    style: ButtonStyle.Secondary
                })
            );

            await createdChannel.send({ content: `<@&${settings.server.permission}>`, embeds: [embed], components: [actionRow] });

            const collectorAccept = createdChannel.createMessageComponentCollector({ filter: (i) => i.customId === 'acceptSend', time: 10800000 });
            const collectorDecline = createdChannel.createMessageComponentCollector({ filter: (i) => i.customId === 'declineSend', time: 10800000 });

            collectorsArray.push(collectorAccept, collectorDecline);

            collectorAccept.on('collect', (interaction: ButtonInteraction<CacheType>) => {
                handleAccept(interaction);
            });

            collectorDecline.on('collect', (interaction: ButtonInteraction<CacheType>) => {
                handleDecline(interaction);
            });

            const handleAccept = async (i: any): Promise<void> => {
                try {
                    if (i.customId === 'acceptSend') {
                        const existingMember = await Member.findOne({ discordid: userDiscordId });

                        if (!existingMember) {
                            await interaction.reply({ ephemeral, content: 'Você não está cadastrado no nosso sistema.' });
                            return;
                        }

                        existingMember.farm1 = (existingMember.farm1 || 0) + parseInt(senditem1, 10);
                        existingMember.farm2 = (existingMember.farm2 || 0) + parseInt(senditem2, 10);
                        existingMember.farm3 = (existingMember.farm3 || 0) + parseInt(senditem3, 10);
                        existingMember.farm4 = (existingMember.farm4 || 0) + parseInt(senditem4, 10);

                        await existingMember.save();

                        const members = await Member.find();

                        for (const member of members) {
                            const farm = await Farm.findOne({ roles: member.rolefac });

                            if (farm && (member.farm1 >= farm.farm1 || member.farm2 >= farm.farm2) &&
                                member.farm3 >= farm.farm3 &&
                                member.farm4 >= farm.farm4
                            ) {
                                member.status = "Completo";
                                await member.save();
                            }
                        }

                        const confirmMessage = createEmbed({
                            color: settings.colors.success,
                            author: {
                                name: `${settings.server.name} | Sistema de Farm`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            },
                            thumbnail: interaction.user?.displayAvatarURL({ size: 4096 }),
                            title: `${icon(":a:info")} Registro de Farm Aceito.`,
                            description:
                                `${icon(":a:setabope")} **Usuário:** <@${interaction.user.id}> Farm entregue.\n\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item1}:**\n \`${senditem1}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item2}:**\n \`${senditem2}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item3}:**\n \`${senditem3}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item4}:**\n \`${senditem4}\`\n\n` +
                                `Farm confirmado pelo: <@${i.user.id}>`,
                            image: sendpicture,
                            footer: {
                                text: `Data da entrega: ${formattedTime}`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            }
                        });

                        await i.reply({ ephemeral, content: 'Você aceitou a entrega do farm. Aguarde enquanto o canal é excluído.' });

                        if (!interaction.user.dmChannel) {
                            await interaction.user.createDM();
                        }

                        if (interaction.user.dmChannel) {
                            try {
                                const embedInDM = createEmbed({
                                    color: settings.colors.success,
                                    author: {
                                        name: `${settings.server.name} | Sistema de Farm`,
                                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                                    },
                                    thumbnail: interaction.user?.displayAvatarURL({ size: 4096 }),
                                    title: `${icon(":a:info")} Farm Aceito.`,
                                    description:
                                        `Seu farm foi aceito e registrado no sistema, confira em <#1232186368629932042> (**Ver Farm**).\n\n` +
                                        `Farm confirmado pelo: <@${i.user.id}>`,
                                    image: sendpicture,
                                    footer: {
                                        text: `™ ${settings.server.name} © All rights reserved`,
                                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                                    }
                                });

                                await interaction.user.send({ embeds: [embedInDM] });
                            } catch (error) {
                                console.log(`Erro ao enviar mensagem direta para ${interaction.user.tag}`);
                            }
                        } else {
                            console.log(`O usuário ${interaction.user.tag} bloqueou mensagens diretas.`);
                        }

                        const logChannel = interaction.guild.channels.cache.get(logChannelId) as TextChannel;
                        if (logChannel) {
                            await logChannel.send({ embeds: [confirmMessage] });
                        }

                        setTimeout(async () => {
                            try {
                                const updatedChannel = interaction.guild.channels.cache.get(createdChannel.id);
                                if (updatedChannel) {

                                    if (!i.deferred && !i.replied) {
                                        await i.reply({ ephemeral, content: 'Você aceitou a entrega do farm. Aguarde enquanto o canal é excluído.' });
                                    }

                                    await updatedChannel.delete();
                                } else {
                                    console.error('O canal não existe ou não é acessível para exclusão.');
                                }
                            } catch (error) {
                                console.error('Erro ao excluir o canal:', error);
                            }
                        }, 10000);
                    }
                } catch (error) {
                    console.error('Erro ao processar a interação "acceptSend":', error);
                } finally {
                    collectorAccept.off('collect', handleAccept);

                    collectorsArray.forEach((collector) => collector.stop());
                }
            };

            const handleDecline = async (i: any): Promise<void> => {
                try {
                    if (i.customId === 'declineSend') {

                        const declineMessage = createEmbed({
                            color: settings.colors.danger,
                            author: {
                                name: `${settings.server.name} | Sistema de Farm`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            },
                            thumbnail: interaction.user?.displayAvatarURL({ size: 4096 }),
                            title: `${icon(":a:info")} Registro de Farm Recusado.`,
                            description:
                                `${icon(":a:setabope")} **Usuário:** <@${interaction.user.id}> Tentativa de entrega.\n\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item1}:**\n \`${senditem1}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item2}:**\n \`${senditem2}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item3}:**\n \`${senditem3}\`\n` +
                                `${icon(":a:setabope")} **${settings.farmitens.item4}:**\n \`${senditem4}\`\n\n` +
                                `Farm recusado pelo: <@${i.user.id}>`,
                            image: sendpicture,
                            footer: {
                                text: `Data da entrega: ${formattedTime}`,
                                iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                            }
                        });

                        await i.reply({ ephemeral, content: 'Você recusou a entrega do farm. Aguarde enquanto o canal é excluído.' });

                        if (!interaction.user.dmChannel) {
                            await interaction.user.createDM();
                        }

                        if (interaction.user.dmChannel) {
                            try {

                                const embedInDM = createEmbed({
                                    color: settings.colors.danger,
                                    author: {
                                        name: `${settings.server.name} | Sistema de Farm`,
                                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                                    },
                                    thumbnail: interaction.user?.displayAvatarURL({ size: 4096 }),
                                    title: `${icon(":a:info")} Farm Recusado.`,
                                    description:
                                        `Seu farm foi recusado, confira as informações e refaça o envio.\n\n` +
                                        `Farm recusado pelo(a): <@${i.user.id}>`,
                                    image: sendpicture,
                                    footer: {
                                        text: `™ ${settings.server.name} © All rights reserved`,
                                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                                    }
                                });

                                await interaction.user.send({ embeds: [embedInDM] });

                            } catch (error) {
                                console.log(`Erro ao enviar mensagem direta para ${interaction.user.tag}`);
                            }
                        } else {
                            console.log(`O usuário ${interaction.user.tag} bloqueou mensagens diretas.`);
                        }

                        const logChannel = interaction.guild.channels.cache.get(logChannelId) as TextChannel;
                        if (logChannel) {
                            await logChannel.send({ embeds: [declineMessage] });
                        }

                        setTimeout(async () => {
                            try {
                                const updatedChannel = interaction.guild.channels.cache.get(createdChannel.id);
                                if (updatedChannel) {
                                    if (!i.deferred && !i.replied) {
                                        await i.reply({ ephemeral, content: 'Você recusou a entrega do farm. Aguarde enquanto o canal é excluído.' });
                                    }
                                    await updatedChannel.delete();
                                } else {
                                    console.error('O canal não existe ou não é acessível para exclusão.');
                                }
                            } catch (error) {
                                console.error('Erro ao excluir o canal:', error);
                            }
                        }, 10000);
                    }
                } catch (error) {
                    console.error('Erro ao processar a interação "declineSend":', error);
                } finally {
                    collectorDecline.off('collect', handleDecline);
                    collectorsArray.forEach((collector) => collector.stop());
                }
            };

        }
        return;
    },
});