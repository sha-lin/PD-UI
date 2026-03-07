export const STAFF_PROCESSES_BASE_PATH = "/staff/processes" as const;
export const PRODUCTION_TEAM_PROCESSES_BASE_PATH = "/production-team/processes" as const;

export type ProcessesBasePath =
    | typeof STAFF_PROCESSES_BASE_PATH
    | typeof PRODUCTION_TEAM_PROCESSES_BASE_PATH;

export function resolveProcessesBasePath(pathname: string): ProcessesBasePath {
    if (pathname.startsWith(PRODUCTION_TEAM_PROCESSES_BASE_PATH)) {
        return PRODUCTION_TEAM_PROCESSES_BASE_PATH;
    }

    return STAFF_PROCESSES_BASE_PATH;
}