import GroupsTable, { GroupWithCount } from "@/components/admin/groups-table";
import TableSkeleton from "@/components/admin/table-skeleton";
import EmptyState from "@/components/admin/empty-state";

interface GroupsTabProps {
    groups: GroupWithCount[];
    isLoading: boolean;
    onEditGroup: (group: GroupWithCount) => void;
    onDeleteGroup: (group: GroupWithCount) => void;
}

export default function GroupsTab({ groups, isLoading, onEditGroup, onDeleteGroup }: GroupsTabProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {isLoading ? (
                <TableSkeleton rows={5} columns={3} />
            ) : groups.length > 0 ? (
                <GroupsTable
                    groups={groups}
                    onEditGroup={onEditGroup}
                    onDeleteGroup={onDeleteGroup}
                />
            ) : (
                <div className="px-8">
                    <EmptyState message="No groups created yet. Click 'Create Group' to add one." />
                </div>
            )}
        </div>
    );
}
