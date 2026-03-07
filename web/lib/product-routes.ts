export const STAFF_PRODUCTS_BASE_PATH = "/staff/products" as const;
export const PRODUCTION_PRODUCTS_BASE_PATH = "/staff/production/products" as const;
export const PRODUCTION_TEAM_PRODUCTS_BASE_PATH = "/production-team/products" as const;

export type ProductsBasePath =
    | typeof STAFF_PRODUCTS_BASE_PATH
    | typeof PRODUCTION_PRODUCTS_BASE_PATH
    | typeof PRODUCTION_TEAM_PRODUCTS_BASE_PATH;

export function resolveProductsBasePath(pathname: string): ProductsBasePath {
    if (pathname.startsWith(PRODUCTION_TEAM_PRODUCTS_BASE_PATH)) {
        return PRODUCTION_TEAM_PRODUCTS_BASE_PATH;
    }

    if (pathname.startsWith(PRODUCTION_PRODUCTS_BASE_PATH)) {
        return PRODUCTION_PRODUCTS_BASE_PATH;
    }

    return STAFF_PRODUCTS_BASE_PATH;
}