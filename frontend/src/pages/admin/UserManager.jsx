import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import { UserCheck, Plus, CheckCircle2, AlertCircle, Shield, KeyRound, User, Mail, Power } from 'lucide-react';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    passwordHash: '',
    role: 'ADMIN',
    status: 'ACTIVE'
  });

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      notify('error', 'Failed to load administrative users.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      passwordHash: '',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      fullName: u.fullName || '',
      email: u.email || '',
      passwordHash: '', // leave empty to keep unchanged
      role: u.role || 'ADMIN',
      status: u.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      notify('error', 'Name and email are required.');
      return;
    }

    if (!editingUser && (!formData.passwordHash || formData.passwordHash.length < 6)) {
      notify('error', 'Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
        notify('success', 'User updated successfully.');
      } else {
        await adminApi.createUser(formData);
        notify('success', 'New administrator created successfully.');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error saving user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateUser(user.id, { ...user, status: newStatus });
      notify('success', `User status updated to ${newStatus}.`);
      loadUsers();
    } catch (err) {
      notify('error', 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-serif-heading font-bold text-stone-900 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#800020]" />
            Administrator Management
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage authenticated administrators who have access to the PATH CMS dashboard.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400">Loading administrators...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-stone-400">No users found.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {users.map((u) => (
              <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold font-serif-heading text-lg">
                    {u.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-800">{u.fullName}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                      <span>{u.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-700">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => toggleStatus(u)}
                    title={u.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      u.status === 'ACTIVE' 
                        ? 'border-stone-200 text-stone-600 hover:bg-stone-100' 
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => openEditModal(u)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
                  >
                    Edit / Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-lg font-serif-heading font-bold text-stone-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#800020]" />
              {editingUser ? 'Edit Administrator' : 'Create New Administrator'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                    placeholder="e.g. Fr. Parish Admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] disabled:bg-stone-100 disabled:text-stone-500"
                    placeholder="pathsoccomit@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={formData.passwordHash}
                    onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#800020] hover:bg-[#68001a] text-white shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
