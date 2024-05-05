import { Modal } from "#base";
import { isNumeric } from "#functions";
import { createModalInput } from "@magicyan/discord";
import { memberSchema } from "database/schemas/member.js";
import { ModalBuilder, TextInputStyle } from "discord.js";
import { model } from "mongoose";
import { z } from "zod";

const formSchema = z.object({
    id: z.coerce.number({ invalid_type_error: "O id deve conter apenas números!" }).min(1, "ID informado inválido"),
    rolefac: z.string()
});

type FormSchema = z.infer<typeof formSchema>;

export function changeFarmModal(data: Partial<Record<keyof FormSchema, string>> = {}) {
    return new ModalBuilder({
        customId: "farm/form/change",
        title: "Andamento do Farm",
        components: [
            createModalInput({
                customId: "id/change/farm",
                label: "Informe o passaporte:",
                placeholder: "Informe o passaporte: (4466)",
                style: TextInputStyle.Short,
                value: data.id,
                required,
            }),
            createModalInput({
                customId: "role/change/farm",
                label: "Informe o cargo:",
                placeholder: "Informe o cargo: (Soldado)",
                style: TextInputStyle.Short,
                value: data.rolefac,
                required,
            })
        ]
    });
}

new Modal({
    customId: "farm/form/change",
    cache: "cached", isFromMessage: true,
    async run(interaction) {
        const searchmember: string = interaction.fields.getTextInputValue('id/change/farm');
        const rolemember: string = interaction.fields.getTextInputValue('role/change/farm');

        if (!isNumeric(searchmember)) {
            return interaction.reply({ ephemeral, content: 'Por favor, insira um número válido.' });
        }

        const Member = model('Member', memberSchema);



        return;
    },
});