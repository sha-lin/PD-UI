import { User } from "@/types/user";
import { Eye } from "lucide-react";

interface UsersTableProps {
    users: User[];
    onViewUser: (user: User) => void;
}

export default function UsersTable({ users, onViewUser }: UsersTableProps) {
    const formatFullName = (firstName: string, lastName: string): string => {
        const name = `${firstName} ${lastName}`.trim();
        return name || "—";
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Username
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Full Name
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-8 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-500">
                                    #{user.id}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-sm font-semibold text-brand-blue">
                                    {user.username}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                    {formatFullName(user.first_name, user.last_name)}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                    {user.email || "—"}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                {user.is_superuser ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                        Superuser
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-200">
                                        User
                                    </span>
                                )}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap">
                                {user.is_active ? (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200">
                                        Inactive
                                    </span>
                                )}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                <button
                                    onClick={() => onViewUser(user)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
