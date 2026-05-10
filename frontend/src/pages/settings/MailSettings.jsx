import { useState, useEffect } from "react";
import { Card, Button, Input, Spinner } from "../../components/ui";
import { Mail, Shield, Save, Send, AlertCircle } from "lucide-react";
import { mailApi } from "../../api";
import toast from "react-hot-toast";

const MailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromName: "",
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await mailApi.getConfig();
      if (data.config) {
        setConfig({
          ...data.config,
          smtpPassword: "", // Don't show password
        });
      }
    } catch (err) {
      toast.error("Failed to load mail configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await mailApi.saveConfig(config);
      toast.success("Mail settings saved successfully");
      fetchConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await mailApi.testConfig();
      toast.success("Test email sent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "SMTP Test failed. Check your credentials.");
    } finally {
      setTesting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Card>
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              SMTP Configuration
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Configure your outgoing mail server (SMTP) to send offer letters and
              certificates.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Sender Name"
                placeholder="e.g. Ofzen HR Team"
                value={config.fromName}
                onChange={(e) =>
                  setConfig({ ...config, fromName: e.target.value })
                }
                required
              />
            </div>
            <Input
              label="SMTP Host"
              placeholder="smtp.gmail.com"
              value={config.smtpHost}
              onChange={(e) =>
                setConfig({ ...config, smtpHost: e.target.value })
              }
              required
            />
            <Input
              label="SMTP Port"
              placeholder="465 or 587"
              value={config.smtpPort}
              onChange={(e) =>
                setConfig({ ...config, smtpPort: e.target.value })
              }
              required
            />
            <Input
              label="SMTP Username"
              placeholder="your-email@example.com"
              value={config.smtpUser}
              onChange={(e) =>
                setConfig({ ...config, smtpUser: e.target.value })
              }
              required
            />
            <Input
              label="SMTP Password"
              type="password"
              placeholder="Enter password"
              value={config.smtpPassword}
              onChange={(e) =>
                setConfig({ ...config, smtpPassword: e.target.value })
              }
              required={!config.hasPassword}
            />
          </div>

          {!config.isActive && (
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-500">
                  SMTP Not Configured
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Mails will be logged as "Manual" and won't be sent automatically
                  until SMTP is set up.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between gap-4 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="secondary"
              onClick={handleTest}
              loading={testing}
              disabled={!config.isActive}
            >
              <Send className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MailSettings;
