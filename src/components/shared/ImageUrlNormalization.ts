export function normalizeImageUrl(url?: string) {
    if (!url) return "";

    const match = url.match(/\/d\/([^/]+)/);

    if (match) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    return url;
}