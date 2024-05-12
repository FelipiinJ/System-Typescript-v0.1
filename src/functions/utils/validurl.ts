export function isValidImageUrl(url: string): boolean {
    // Verifica se a URL começa com o prefixo esperado
    const expectedPrefix = "https://cdn.discordapp.com/attachments/";
    if (!url.startsWith(expectedPrefix)) {
        return false;
    }

    // Verifica se não há espaços em branco na URL
    if (/\s/.test(url)) {
        return false;
    }

    // Verifica se a extensão do arquivo é uma imagem com uma lista de extensões comuns
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp"];
    const fileExtension = url.substring(url.lastIndexOf(".")).toLowerCase();
    if (!imageExtensions.includes(fileExtension)) {
        return false;
    }

    // Verifica se a URL é bem formada
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
