import UsersTable from "@/components/admin/users-table";
import UsersTableFilters from "@/components/admin/users-table-filters";
import Pagination from "@/components/admin/pagination";
import TableSkeleton from "@/components/admin/table-skeleton";
import EmptyState from "@/components/admin/empty-state";
import type { User, UsersListResponse } from "@/types/user";

interface UsersTabProps {
    usersData: UsersListResponse | undefined;
    isLoading: boolean;
    page: number;
    searchTerm: string;
    activeFilter: boolean | undefined;
    superuserFilter: boolean | undefined;
    onSearchChange: (value: string) => void;
    onActiveFilterChange: (value: boolean | undefined) => void;
    onSuperuserFilterChange: (value: boolean | undefined) => void;
    onNextPage: () => void;
    onPreviousPage: () => void;
    onViewUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    calculateTotalPages: (totalCount: number) => number;
}

export default function UsersTab({
    usersData,
    isLoading,
    page,
    searchTerm,
    activeFilter,
    superuserFilter,
    onSearchChange,
    onActiveFilterChange,
    onSuperuserFilterChange,
    onNextPage,
    onPreviousPage,
    onViewUser,
    onDeleteUser,
    calculateTotalPages,
}: UsersTabProps) {
    return (
        <>
            <UsersTableFilters
                searchTerm={searchTerm}
                activeFilter={activeFilter}
                superuserFilter={superuserFilter}
                onSearchChange={onSearchChange}
                onActiveFilterChange={onActiveFilterChange}
                onSuperuserFilterChange={onSuperuserFilterChange}
            />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white mt-6">
                {isLoading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : usersData && usersData.results.length > 0 ? (
                    <>
                        <UsersTable
                            users={usersData.results}
                            onViewUser={onViewUser}
                            onDeleteUser={onDeleteUser}
                        />
                        <Pagination
                            currentPage={page}
                            totalPages={calculateTotalPages(usersData.count)}
                            hasNext={!!usersData.next}
                            hasPrevious={!!usersData.previous}
                            onNext={onNextPage}
                            onPrevious={onPreviousPage}
                        />
                    </>
                ) : (
                    <div className="px-8">
                        <EmptyState message="Try adjusting your search or filter criteria" />
                    </div>
                )}
            </div>
        </>
    );
}
