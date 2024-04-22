import { Modal } from "#base";
import { formatName, isNumeric } from "#functions";
import { createModalInput } from "@magicyan/discord";
import { memberSchema } from "database/schemas/member.js";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    namefarm: z.string().min(2, "O nome deve ter mais que 2 caracteres!"),
    idfarm: z.coerce.number({ invalid_type_error: "O id deve conter apenas números!" }).min(1, "ID informado inválido"),
    rolefac: z.string(),
    discordid: z.coerce.number(({ invalid_type_error: "O discord deve conter apenas números!" })).min(1, "Discord informado inválido"),
});

type FormSchema = z.infer<typeof formSchema>;

export function registerFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/register",
        title: "Registro de Membro",
        components: [
            createModalInput({
                customId: "name/register/farm",
                label: "Informe o nome no jogo:",
                placeholder: "informe o nome no jogo: (Felipe Marshall)",
                style: TextInputStyle.Short,
                value: data.namefarm,
                required,
            }),
            createModalInput({
                customId: "id/register/farm",
                label: "Informe o passaporte:",
                placeholder: "Informe o passaporte: (4466)",
                style: TextInputStyle.Short,
                value: data.idfarm,
                required,
            }),
            createModalInput({
                customId: "role/register/farm",
                label: "Informe o cargo:",
                placeholder: "Informe o cargo: (Morador)",
                style: TextInputStyle.Short,
                value: data.rolefac,
                required,
            }),
            createModalInput({
                customId: "discord/register/farm",
                label: "Informe o ID DO DISCORD:",
                placeholder: "Informe o id do discord: (710898240664502372)",
                style: TextInputStyle.Short,
                value: data.discordid,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/register",
    cache: "cached", isFromMessage: true,
    async run(interaction) {

        const { guild } = interaction;

        const Member = model('Member', memberSchema);

        let namefarm: string = formatName(interaction.fields.getTextInputValue('name/register/farm'));
        let idfarm: string = interaction.fields.getTextInputValue('id/register/farm');
        let rolefac: string = formatName(interaction.fields.getTextInputValue('role/register/farm'));
        let discordid: string = interaction.fields.getTextInputValue('discord/register/farm');

        if (!['fogueteiro', 'morador', 'assinado', 'traficante', 'soldado'].includes(rolefac.toLowerCase())) {
            interaction.reply({ ephemeral, content: 'O cargo tem que ser: fogueteiro/morador/assinado/traficante/soldado' });
            return;
        }

        if (!isNumeric(idfarm) || !isNumeric(discordid)) {
            return interaction.reply({ ephemeral, content: 'Por favor, na area do **Passaporte** e do **ID do Discord** são apenas numeros.' });
        }

        try {
            const existingMember = await Member.findOne({ discordid: discordid });

            if (existingMember) {
                return interaction.reply({ ephemeral, content: 'Este membro já está registrado no sistema.' });
            }

            const existingMemberPassport = await Member.findOne({ idfarm: idfarm });

            if (existingMemberPassport) {
                return interaction.reply({ ephemeral, content: 'Este passaporte já está registrado no sistema.' });
            }

            const newMember = new Member({
                namefarm: namefarm,
                idfarm: idfarm,
                rolefac: rolefac,
                discordid: discordid,
                farm1: 0,
                farm2: 0,
                farm3: 0,
                farm4: 0,
                status: 'INCOMPLETO',
                guildId: guild.id
            });

            await newMember.save();

            await interaction.reply({ ephemeral, content: `Todas as informações do membro **${namefarm}** foram cadastradas no banco de dados.`, });
        } catch (error) {
            console.error('Erro ao inserir no banco de dados:', error);
            await interaction.reply({ ephemeral, content: 'Ocorreu um erro ao processar a solicitação.' });
        }
        return;
    },
});