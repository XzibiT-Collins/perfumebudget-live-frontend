import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';
import { frontDeskService } from '../services/frontDeskService';
import { FrontDeskUserSummaryResponse, CreateFrontDeskUserRequest, UpdateFrontDeskUserRequest } from '../types';
import toast from 'react-hot-toast';
import { Shield, UserPlus, Settings, Key, UserCheck } from 'lucide-react';
import { extractErrorMessage } from '../utils';

export const FrontDeskUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<FrontDeskUserSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState<CreateFrontDeskUserRequest>({
    fullName: '',
    email: '',
    password: '',
    isActive: true
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState<UpdateFrontDeskUserRequest>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Assign State
  const [assignEmail, setAssignEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await frontDeskService.getFrontDeskUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load front desk users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await frontDeskService.createFrontDeskUser(createData);
      toast.success('Front desk user created successfully');
      setIsCreateModalOpen(false);
      setCreateData({ fullName: '', email: '', password: '', isActive: true });
      fetchUsers();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to create user'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;
    setIsUpdating(true);
    try {
      await frontDeskService.updateFrontDeskUser(editUserId, editData);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to update user'));
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (user: FrontDeskUserSummaryResponse) => {
    setEditUserId(user.id);
    setEditData({
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Front Desk Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your front desk staff and POS permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/front-desk/template')}>
            <Settings className="h-4 w-4 mr-2" />
            Default Permissions
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Staff
          </Button>
        </div>
      </div>

      <AdminTable
        title="Staff Members"
        columns={[
          {
            header: 'Staff Member', accessor: (row: FrontDeskUserSummaryResponse) => (
              <div>
                <p className="font-bold dark:text-white">{row.fullName}</p>
                <p className="text-xs text-[#999999]">{row.email}</p>
              </div>
            )
          },
          {
            header: 'Status', accessor: (row: FrontDeskUserSummaryResponse) => (
              <Badge variant={row.isActive ? 'success' : 'default'}>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: 'Actions', accessor: (row: FrontDeskUserSummaryResponse) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal(row)}>
                  Edit Info
                </Button>
                <Button size="sm" onClick={() => navigate(`/admin/front-desk/users/${row.id}/permissions`)}>
                  <Key className="h-3.5 w-3.5 mr-1" />
                  Permissions
                </Button>
              </div>
            )
          },
        ]}
        data={users}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Create New Front Desk Staff"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <Input 
            label="Full Name" 
            value={createData.fullName} 
            onChange={e => setCreateData({...createData, fullName: e.target.value})} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email"
            value={createData.email} 
            onChange={e => setCreateData({...createData, email: e.target.value})} 
            required 
          />
          <Input 
            label="Password" 
            type="password"
            value={createData.password} 
            onChange={e => setCreateData({...createData, password: e.target.value})} 
            required 
            placeholder="Min. 8 characters"
          />
          <div className="flex items-center gap-2 px-1">
            <Checkbox 
              checked={createData.isActive} 
              onChange={val => setCreateData({...createData, isActive: val})} 
            />
            <span className="text-sm font-medium dark:text-zinc-300">Active Account</span>
          </div>
          <Button type="submit" className="w-full h-12" isLoading={isCreating}>
            Create Staff Member
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Staff Information"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input 
            label="Full Name" 
            value={editData.fullName || ''} 
            onChange={e => setEditData({...editData, fullName: e.target.value})} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email"
            value={editData.email || ''} 
            onChange={e => setEditData({...editData, email: e.target.value})} 
            required 
          />
          <Input 
            label="New Password" 
            type="password"
            value={editData.password || ''} 
            onChange={e => setEditData({...editData, password: e.target.value})} 
            placeholder="Leave blank to keep current"
          />
          <div className="flex items-center gap-2 px-1">
            <Checkbox 
              checked={editData.isActive ?? true} 
              onChange={val => setEditData({...editData, isActive: val})} 
            />
            <span className="text-sm font-medium dark:text-zinc-300">Active Account</span>
          </div>
          <Button type="submit" className="w-full h-12" isLoading={isUpdating}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};
