import Link from "next/link";
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
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-8 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Group Name
                            </span>
                        </th>
                        <th className="px-8 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Members
                            </span>
                        </th>
                        <th className="px-8 py-3 text-right">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-brand-blue" />
                                    </div>
                                    <Link
                                        href={`/staff/users/groups/${group.id}`}
                                        className="text-sm font-medium text-brand-blue hover:text-brand-blue/80 hover:underline transition-colors"
                                    >
                                        {group.name}
                                    </Link>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    {group.user_count || 0} {group.user_count === 1 ? 'user' : 'users'}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEditGroup(group)}
                                        className="p-2 text-gray-600 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                                        title="Edit group"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteGroup(group)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
