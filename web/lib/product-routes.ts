export function resolveProductsBasePath(pathname: string): string {
    if (pathname.startsWith("/admin")) return "/admin/products";
    if (pathname.startsWith("/staff/production")) return "/staff/production/products";
    if (pathname.startsWith("/staff")) return "/staff/products";
    return "/admin/products";
}
