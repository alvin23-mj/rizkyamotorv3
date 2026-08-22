'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Search,
  Trash2,
  Edit2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react';
import { useSession } from '@/components/providers/AuthProvider';
import PopUpAlert from '@/components/ui/PopUpAlert';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add User Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
  });
  const [adding, setAdding] = useState(false);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    password: string;
  }>({
    id: '',
    name: '',
    email: '',
    role: 'USER',
    phone: '',
    password: '',
  });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setAlert({ type: 'error', message: 'Gagal memuat data pengguna.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Pengguna berhasil ditambahkan.' });
        setAddModalOpen(false);
        setAddFormData({ name: '', email: '', password: '', role: 'USER', phone: '' });
        fetchUsers();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal membuat pengguna.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setAdding(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Data pengguna diperbarui.' });
        setEditModalOpen(false);
        fetchUsers();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal mengedit pengguna.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: data.message || 'Pengguna berhasil dihapus.' });
        fetchUsers();
      } else {
        setAlert({ type: 'error', message: data.error || 'Gagal menghapus akun.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola daftar pengguna terdaftar, tambahkan akun admin baru, dan atur peran akses.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* PopUp Toast Alert */}
      {alert && (
        <PopUpAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau nomor telepon..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-slate-500 font-medium">Total: {filteredUsers.length} Pengguna</span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-800" />
            <p>Memuat daftar pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-xs whitespace-nowrap">
                <tr>
                  <th className="px-5 py-4">Pengguna</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">No. Telepon / Kontak</th>
                  <th className="px-4 py-4">Peran Akses</th>
                  <th className="px-4 py-4">Tanggal Daftar</th>
                  <th className="px-4 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN' || u.role === 'ADMIN_SHOWROOM';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                            <p className="text-slate-400 text-[11px]">ID: {u.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{u.email}</span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {u.phone ? (
                          <span className="text-slate-700 font-medium">{u.phone}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-slate-900 text-white border border-slate-800 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>Pengguna Biasa</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditFormData({
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                phone: u.phone || '',
                                password: '',
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md border border-amber-200 transition-all cursor-pointer"
                            title="Edit Peran & Data"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md border border-rose-200 transition-all cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-slate-800" />
                Tambah Akun Pengguna / Admin
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="budi@example.com"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Kata Sandi (Password) *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor WhatsApp / Telepon</label>
                <input
                  type="tel"
                  placeholder="0812..."
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Peran Akses (Role) *</label>
                <select
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                >
                  <option value="USER">USER (Pengguna Biasa / Pembeli)</option>
                  <option value="ADMIN">ADMIN (Super Admin Showroom)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {adding ? 'Membuat Akun...' : 'Simpan Akun Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-slate-800" />
                Edit Akun: {editFormData.email}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor WhatsApp / Telepon</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Peran Akses (Role) *</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold cursor-pointer"
                >
                  <option value="USER">USER (Pengguna Biasa / Pembeli)</option>
                  <option value="ADMIN">ADMIN (Super Admin Showroom)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ubah Kata Sandi (Kosongkan jika tidak ingin diubah)</span>
                </label>
                <input
                  type="password"
                  placeholder="Ketik kata sandi baru..."
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
