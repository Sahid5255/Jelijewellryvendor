import { useSettings } from '../context/SettingsContext';

export default function AnnouncementBar() {
  const { settings } = useSettings();
  if (!settings.announcement) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-champagne-light">
      {settings.announcement}
    </div>
  );
}
