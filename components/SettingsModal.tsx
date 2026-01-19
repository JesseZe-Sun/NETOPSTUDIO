
import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink, Users, Shield, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ApiKey, Profile, UserPermission } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_SERVICES = [
  { name: 'gemini', label: 'Google Gemini', link: 'https://aistudio.google.com/apikey' },
  { name: 'openai', label: 'OpenAI', link: 'https://platform.openai.com/api-keys' },
  { name: 'anthropic', label: 'Anthropic Claude', link: 'https://console.anthropic.com/settings/keys' },
  { name: 'pollo', label: 'Pollo.ai (Wan 2.5)', link: 'https://pollo.ai/dashboard/api-keys' },
];

const FEATURES = ['chat', 'video', 'sketch', 'sonic', 'multiframe', 'sequence'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'api-keys' | 'users'>('api-keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [keysRes, usersRes, permsRes] = await Promise.all([
          supabase.from('api_keys').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('user_permissions').select('*'),
        ]);

        if (keysRes.data) setApiKeys(keysRes.data);
        if (usersRes.data) setUsers(usersRes.data);
        if (permsRes.data) setPermissions(permsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (serviceName: string) => {
    const value = keyValues[serviceName];
    if (!value || !isAdmin) return;

    try {
      const existing = apiKeys.find(k => k.service_name === serviceName);

      if (existing) {
        await supabase
          .from('api_keys')
          .update({ api_key: value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('api_keys')
          .insert({ service_name: serviceName, api_key: value, created_by: user?.id });
      }

      await loadData();
      setEditingKey(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving key:', error);
      alert('Failed to save API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!isAdmin || !confirm('Are you sure you want to delete this API key?')) return;

    try {
      await supabase.from('api_keys').delete().eq('id', id);
      await loadData();
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleTogglePermission = async (userId: string, feature: string, currentAccess: boolean) => {
    if (!isAdmin) return;

    try {
      const existing = permissions.find(p => p.user_id === userId && p.feature === feature);

      if (existing) {
        await supabase
          .from('user_permissions')
          .update({ can_access: !currentAccess })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_permissions')
          .insert({ user_id: userId, feature, can_access: true });
      }

      await loadData();
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission');
    }
  };

  const getUserPermission = (userId: string, feature: string): boolean => {
    const perm = permissions.find(p => p.user_id === userId && p.feature === feature);
    return perm?.can_access ?? true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-[720px] max-h-[80vh] bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-700/50 rounded-lg">
              <Key size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">设置 (Settings)</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'api-keys'
                  ? 'bg-white/10 text-white border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white/10 text-white border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Permissions
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : activeTab === 'api-keys' ? (
            <div className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">Admin: Manage API Keys for All Services</span>
                  </div>
                  {AI_SERVICES.map(service => {
                    const existingKey = apiKeys.find(k => k.service_name === service.name);
                    const isEditing = editingKey === service.name;

                    return (
                      <div key={service.name} className="space-y-2 p-4 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {service.label}
                          </label>
                          <a href={service.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
                            <span>Get Key</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type={isEditing ? "text" : "password"}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                            placeholder={existingKey ? "••••••••••••••••" : "Enter API key..."}
                            value={isEditing ? keyValues[service.name] || '' : existingKey?.api_key || ''}
                            onChange={(e) => setKeyValues({ ...keyValues, [service.name]: e.target.value })}
                            disabled={!isEditing && !!existingKey}
                          />

                          {isEditing ? (
                            <button
                              onClick={() => handleSaveKey(service.name)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                              <Check size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingKey(service.name);
                                setKeyValues({ ...keyValues, [service.name]: existingKey?.api_key || '' });
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              {existingKey ? <Edit2 size={16} /> : <Plus size={16} />}
                            </button>
                          )}

                          {existingKey && (
                            <button
                              onClick={() => handleDeleteKey(existingKey.id)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>API key management is restricted to administrators only.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Manage User Permissions</span>
              </div>

              {users.filter(u => u.role !== 'admin').map(u => (
                <div key={u.id} className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {FEATURES.map(feature => {
                      const hasAccess = getUserPermission(u.id, feature);
                      return (
                        <button
                          key={feature}
                          onClick={() => handleTogglePermission(u.id, feature, hasAccess)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            hasAccess
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600/30 hover:bg-red-600/50 text-red-300'
                          }`}
                        >
                          {feature}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#121214] flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-cyan-400'
            }`}
          >
            {isSaved ? '已保存 (Saved)' : '关闭 (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
};
