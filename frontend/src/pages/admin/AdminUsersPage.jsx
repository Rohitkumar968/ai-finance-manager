import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchUsers, updateUser, deleteUser } from '../../features/admin/adminSlice';

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const { users, usersTotal, usersPage, usersTotalPages, isLoading, error } = useSelector((state) => state.admin);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const loadUsers = () => {
    dispatch(fetchUsers({ page, limit: 10, search: search || undefined, role: role || undefined }));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, role]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleToggleActive = async (user) => {
    try {
      await dispatch(updateUser({ id: user._id, payload: { isActive: !user.isActive } })).unwrap();
      toast.success(`${user.name} is now ${!user.isActive ? 'active' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err || 'Failed to update user.');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to "${newRole}"?`)) return;
    try {
      await dispatch(updateUser({ id: user._id, payload: { role: newRole } })).unwrap();
      toast.success(`${user.name} is now ${newRole}.`);
    } catch (err) {
      toast.error(err || 'Failed to update role.');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name} and all their data? This cannot be undone.`)) return;
    try {
      await dispatch(deleteUser(user._id)).unwrap();
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{usersTotal} total users</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          className="input-field max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field max-w-[160px]"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <div className="glass-card overflow-x-auto p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? 'bg-emerald-50 text-success-600 dark:bg-emerald-500/10'
                          : 'bg-red-50 text-danger-600 dark:bg-red-500/10'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      {u._id !== currentUserId && (
                        <>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="rounded-lg border border-red-200 dark:border-red-500/30 px-2.5 py-1 text-xs text-danger-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {u._id === currentUserId && <span className="text-xs text-gray-400">You</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {usersTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={usersPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {usersPage} of {usersTotalPages}
          </span>
          <button
            disabled={usersPage >= usersTotalPages}
            onClick={() => setPage((p) => Math.min(usersTotalPages, p + 1))}
            className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
