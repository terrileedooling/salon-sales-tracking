import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    businessName: user?.businessName || '',
    currency: 'ZAR',
    language: 'en',
    notifications: true,
    lowStockAlert: true
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save settings to Firebase
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved!');
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Business Information</h3>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.businessName}
              onChange={(e) => setSettings({...settings, businessName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              className="form-input"
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
            >
              <option value="ZAR">South African Rand (R)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              Enable email notifications
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.lowStockAlert}
                onChange={(e) => setSettings({...settings, lowStockAlert: e.target.checked})}
              />
              Low stock alerts
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;