import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchSystemSettings,
  updateSystemSettings,
  broadcastNotification,
} from '../../features/admin/adminSlice';

const AdminSettingsPage = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, error } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(
        updateSystemSettings({
          maintenanceMode: formData.maintenanceMode,
          allowRegistrations: formData.allowRegistrations,
          aiFeaturesEnabled: formData.aiFeaturesEnabled,
          maxAIRequestsPerHourPerUser: Number(formData.maxAIRequestsPerHourPerUser),
          announcementMessage: formData.announcementMessage,
        })
      ).unwrap();
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    setIsBroadcasting(true);
    try {
      const resultMessage = await dispatch(broadcastNotification(broadcastForm)).unwrap();
      toast.success(resultMessage);
      setBroadcastForm({ title: '', message: '' });
    } catch (err) {
      toast.error(err || 'Failed to send broadcast.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (isLoading && !formData) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!formData) return null;

  const ToggleRow = ({ field, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => handleToggle(field)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          formData[field] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            formData[field] ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide configuration</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
        <ToggleRow
          field="maintenanceMode"
          label="Maintenance Mode"
          description="Blocks all non-admin API traffic with a 503 message."
        />
        <ToggleRow
          field="allowRegistrations"
          label="Allow New Registrations"
          description="Turn off to temporarily pause new sign-ups."
        />
        <ToggleRow
          field="aiFeaturesEnabled"
          label="AI Features Enabled"
          description="Turn off to disable all /api/ai/* routes platform-wide."
        />

        <div className="pt-4">
          <label className="mb-1.5 block text-sm font-medium">Max AI Requests / Hour / User</label>
          <input
            type="number"
            name="maxAIRequestsPerHourPerUser"
            min="1"
            className="input-field max-w-xs"
            value={formData.maxAIRequestsPerHourPerUser}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <label className="mb-1.5 block text-sm font-medium">Announcement Message</label>
          <textarea
            name="announcementMessage"
            rows={3}
            maxLength={500}
            className="input-field"
            placeholder="Shown to users during maintenance mode, or as a general banner."
            value={formData.announcementMessage}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-50">
            {isSaving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>

      <form onSubmit={handleBroadcast} className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Broadcast Notification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sends a notification to every active user on the platform.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Scheduled maintenance tonight"
            value={broadcastForm.title}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea
            rows={3}
            className="input-field"
            placeholder="Details for the notification…"
            value={broadcastForm.message}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
          />
        </div>
        <button type="submit" disabled={isBroadcasting} className="btn-secondary disabled:opacity-50">
          {isBroadcasting ? 'Sending…' : 'Send Broadcast'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
