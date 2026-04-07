// Create shared slugify utility
// utils/slugify.ts
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export const createFetchSlug = (shopName: string, productSlug: string): string => {
    const shopSlug = slugify(shopName);
    return `${shopSlug}--${productSlug}`;
};