import { Modal } from "#base";
import { settings } from "#settings";
import { createEmbed, createModalInput } from "@magicyan/discord";
import { memberSchema } from "database/schemas/member.js";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    idfarm: z.coerce.number({ invalid_type_error: "O id deve conter apenas números!" }).min(1, "ID informado inválido")
});

type FormSchema = z.infer<typeof formSchema>;

export function removeFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/remove",
        title: "Remoção de Membro",
        components: [
            createModalInput({
                customId: "id/remove/farm",
                label: "Informe o passaporte:",
                placeholder: "Informe o passaporte: (4466)",
                style: TextInputStyle.Short,
                value: data.idfarm,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/remove",
    cache: "cached", isFromMessage: true,
    async run(interaction) {

        const idremovefarm: string = interaction.fields.getTextInputValue('id/remove/farm');

        const Member = model('Member', memberSchema);

        try {
            const result = await Member.deleteOne({ idfarm: idremovefarm });

            if (result.deletedCount > 0) {
                const embed = createEmbed({
                    color: settings.colors.primary,
                    author: {
                        name: "System | Sistema de Farm",
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    },
                    title: "Membro Removido.",
                    description: `O membro com o passaporte: **${idremovefarm}** foi removido do banco de dados.`,
                    footer: {
                        text: `™ System © All rights reserved`,
                        iconURL: "https://cdn.discordapp.com/attachments/1196698774676963368/1196698805119229982/Gif-Bopegg-PVP.gif?ex=65b8939c&is=65a61e9c&hm=d799877fe632f4eef4401252bbffeffc53c8130ffe588c7a5776647114cd489d&"
                    }
                });


                await interaction.reply({ ephemeral, embeds: [embed], });
            } else {
                await interaction.reply({ ephemeral, content: 'Nenhum membro encontrado com o passaporte fornecido.' });
            }
        } catch (error) {
            console.error('Erro ao excluir no banco de dados:', error);
            await interaction.reply({ ephemeral, content: 'Ocorreu um erro ao processar a solicitação.' });
        }
        return;
    },
});