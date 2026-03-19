import { Edit2, Trash2, Users } from "lucide-react";

export interface GroupWithCount {
    id: number;
    name: string;
    user_count?: number;
}

interface GroupsTableProps {
    groups: GroupWithCount[];
    onEditGroup: (group: GroupWithCount) => void;
    onDeleteGroup: (group: GroupWithCount) => void;
}

export default function GroupsTable({ groups, onEditGroup, onDeleteGroup }: GroupsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Group Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Members
                        </th>
                        <th className="w-10 px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-brand-blue" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {group.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                    {group.user_count || 0} {group.user_count === 1 ? "user" : "users"}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => onEditGroup(group)}
                                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-blue"
                                        title="Edit group"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteGroup(group)}
                                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Delete group"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
