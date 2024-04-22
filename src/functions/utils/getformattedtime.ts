export function getFormattedTime(): string {
    const currentTime: Date = new Date();
    return `${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`;
}