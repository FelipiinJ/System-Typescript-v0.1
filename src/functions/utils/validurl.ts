export function isValidImageUrl(url: string): boolean {

    const expectedPrefixes = [
        "https://cdn.discordapp.com/attachments/",
        "https://media.discordapp.net/attachments/",
        "https://i.imgur.com/"
    ];

    const isValidPrefix = expectedPrefixes.some(prefix => url.startsWith(prefix));
    if (!isValidPrefix) {
        return false;
    }

    if (/\s/.test(url)) {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
