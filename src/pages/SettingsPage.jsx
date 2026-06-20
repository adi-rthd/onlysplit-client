import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Camera, Mail, Globe, Bell, CreditCard, Lock, Check, IndianRupee, Smartphone, Moon, Trash2, ChevronRight, BadgeCheck, KeyRound, UploadCloud, AlertTriangle, Download } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassCard';
import { getProfile, updateProfile } from '../services/settingsService';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import { ROUTES } from '../constants/routes';
import { Capacitor } from '@capacitor/core';
import { checkForUpdate, downloadUpdate } from '../services/updateService';

const LATEST_JSON_URL = 'https://api-split.onlylabs.in/downloads/latest.json';

const SettingsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [apkUrl, setApkUrl] = useState('https://api-split.onlylabs.in/downloads/onlysplit-v1.0.1.apk');

  // Native: app version + update state
  const [appVersion, setAppVersion] = useState('');
  const [appBuild, setAppBuild] = useState('');
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [comingSoonModal, setComingSoonModal] =
    useState('');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
    currency: 'INR',
    country: 'India',
    timezone: 'Asia/Kolkata',
    language: 'English',
    notifications: true,
    darkMode: true,
    twoFactor: false
  });

  useEffect(() => {
    fetchProfile();

    if (Capacitor.isNativePlatform()) {
      // Get installed version
      import('@capacitor/device').then(({ Device }) => {
        Device.getInfo().then((info) => {
          setAppVersion(info.appVersion || '1.0.0');
          setAppBuild(info.appBuild || '1');
        });
      });
      // Check for updates
      checkForUpdate().then((info) => {
        if (info) setUpdateAvailable(info);
      });
    } else {
      // Web: fetch APK URL for download button
      fetch(LATEST_JSON_URL, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          if (data?.apkUrl) setApkUrl(data.apkUrl);
        })
        .catch(() => {});
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const user = await getProfile();

      setProfile({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        avatarUrl:
          user?.avatarUrl ||
          `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user?.firstName}+${user?.lastName}`,

        currency: 'INR',
        country: 'India',
        timezone: 'Asia/Kolkata',
        language: 'English',

        notifications: true,
        darkMode: true,
        twoFactor: false
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl
      });
      
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      updateField('avatarUrl', reader.result);
    };

    reader.readAsDataURL(file);
  };

  const showComingSoon = (feature) => {
    setComingSoonModal(feature);

    setTimeout(() => {
      setComingSoonModal('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pb-20 md:pb-4 relative">
      {/* COMING SOON */}
      {comingSoonModal && (
        <div
          className="
            fixed top-6 right-6 z-50
            bg-surface-container-high
            border border-primary/20
            px-5 py-4
            rounded-2xl
            shadow-2xl
            animate-in fade-in slide-in-from-top-2
          "
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="text-yellow-400"
              size={20}
            />

            <div>
              <p className="font-semibold text-white">
                {comingSoonModal}
              </p>

              <p className="text-sm text-on-surface-variant">
                Coming soon in backend API
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Settings
        </h1>

        <p className="text-on-surface-variant text-lg">
          Manage your profile, account preferences,
          security and application settings.
        </p>
      </header>

      <div className="space-y-10">
        {/* PROFILE */}
        <GlassPanel className="p-8 rounded-[32px] shadow-[0_0_60px_0_rgba(94,92,230,0.12)]">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <User className="text-primary" size={26} />
            Profile
          </h2>

          <div className="flex flex-col xl:flex-row gap-10 items-start">
            {/* AVATAR */}
            <div className="flex flex-col items-center gap-5">
              <div
                className="
                  relative
                  group
                  cursor-pointer
                  w-36 h-36
                  rounded-full
                  overflow-hidden
                  border-2 border-primary/20
                  hover:border-primary
                  transition-colors
                "
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

                <div
                  className="
                    absolute inset-0
                    bg-black/60
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity
                  "
                >
                  <UploadCloud
                    className="text-white"
                    size={30}
                  />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />

              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="
                  text-[12px]
                  font-label-caps
                  text-primary
                  uppercase
                  tracking-widest
                  hover:text-white
                  transition-colors
                "
              >
                Upload Avatar
              </button>
            </div>

            {/* FORM */}
            <div className="flex-1 w-full space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FIRST */}
                <div className="space-y-2">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                    First Name
                  </label>

                  <input
                    value={profile.firstName}
                    onChange={(e) =>
                      updateField(
                        'firstName',
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-surface-container-low
                      border border-glass-stroke
                      rounded-xl
                      px-4 py-3.5
                      text-on-surface
                      focus:border-primary
                      outline-none
                      transition-colors
                    "
                  />
                </div>

                {/* LAST */}
                <div className="space-y-2">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                    Last Name
                  </label>

                  <input
                    value={profile.lastName}
                    onChange={(e) =>
                      updateField(
                        'lastName',
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-surface-container-low
                      border border-glass-stroke
                      rounded-xl
                      px-4 py-3.5
                      text-on-surface
                      focus:border-primary
                      outline-none
                      transition-colors
                    "
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                    Email Address
                  </label>

                  <div
                    className="
                      flex items-center gap-3
                      w-full
                      bg-surface-container-low
                      border border-glass-stroke
                      rounded-xl
                      px-4 py-3.5
                      text-on-surface
                    "
                  >
                    <Mail
                      size={18}
                      className="text-on-surface-variant"
                    />

                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>

              {/* SAVE */}
              <div className="flex justify-end pt-5 border-t border-glass-stroke">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-primary-container text-white px-7 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* REGIONAL */}
        <GlassPanel className="p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Globe className="text-primary" size={26} />
            Regional Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Country
              </label>

              <div className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3.5 text-on-surface">
                🇮🇳 India
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Currency
              </label>

              <div className="w-full bg-surface-container-low border border-primary/30 rounded-xl px-4 py-3.5 text-primary font-semibold flex items-center gap-3">
                <IndianRupee size={18} />
                INR (Indian Rupee)
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Language
              </label>

              <div className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3.5 text-on-surface">
                English
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Timezone
              </label>

              <div className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3.5 text-on-surface">
                Asia/Kolkata
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* SECURITY */}
        <GlassPanel className="p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Shield className="text-primary" size={26} />
            Security
          </h2>

          <div className="space-y-7">
            {/* 2FA */}
            <div className="flex justify-between items-center pb-7 border-b border-glass-stroke">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BadgeCheck size={18} />
                  Two-Factor Authentication
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Enable additional account security.
                </p>
              </div>

              <button
                onClick={() =>
                  showComingSoon(
                    'Two-Factor Authentication'
                  )
                }
                className={`
                  relative
                  w-14 h-7
                  rounded-full
                  transition-colors
                  ${profile.twoFactor
                    ? 'bg-primary-container'
                    : 'bg-surface-container-high'
                  }
                `}
              >
                <div
                  className={`
                    absolute top-1
                    w-5 h-5
                    rounded-full bg-white
                    transition-all
                    ${profile.twoFactor
                      ? 'left-8'
                      : 'left-1'
                    }
                  `}
                />
              </button>
            </div>

            {/* PASSWORD */}
            <div className="flex justify-between items-center pb-7 border-b border-glass-stroke">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <KeyRound size={18} />
                  Change Password
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Update your password for better security.
                </p>
              </div>

              <button
                onClick={() =>
                  showComingSoon('Password Reset')
                }
                className="
                  px-5 py-2.5
                  rounded-xl
                  bg-surface-container-high
                  border border-glass-stroke
                  hover:border-primary/40
                  transition-colors
                "
              >
                Change
              </button>
            </div>

            {/* LOGIN DEVICES */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Smartphone size={18} />
                  Login Devices
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Manage your active login sessions.
                </p>
              </div>

              <button
                onClick={() =>
                  showComingSoon(
                    'Login Device Management'
                  )
                }
                className="
                  px-5 py-2.5
                  rounded-xl
                  bg-surface-container-high
                  border border-glass-stroke
                  hover:border-primary/40
                  transition-colors
                  flex items-center gap-2
                "
              >
                Manage
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* APP */}
        <GlassPanel className="p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Moon className="text-primary" size={26} />
            App Preferences
          </h2>

          <div className="space-y-7">
            {/* DARK MODE */}
            <div className="flex justify-between items-center pb-7 border-b border-glass-stroke">
              <div>
                <h3 className="font-semibold text-lg">
                  Dark Mode
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Toggle between dark and light themes.
                </p>
              </div>

              <button
                onClick={() =>
                  updateField(
                    'darkMode',
                    !profile.darkMode
                  )
                }
                className={`
                  relative
                  w-14 h-7
                  rounded-full
                  transition-colors
                  ${profile.darkMode
                    ? 'bg-primary-container'
                    : 'bg-surface-container-high'
                  }
                `}
              >
                <div
                  className={`
                    absolute top-1
                    w-5 h-5
                    rounded-full bg-white
                    transition-all
                    ${profile.darkMode
                      ? 'left-8'
                      : 'left-1'
                    }
                  `}
                />
              </button>
            </div>

            {/* NOTIFICATIONS */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Bell size={18} />
                  Notifications
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Expense alerts and settlements.
                </p>
              </div>

              <button
                onClick={() =>
                  updateField(
                    'notifications',
                    !profile.notifications
                  )
                }
                className={`
                  relative
                  w-14 h-7
                  rounded-full
                  transition-colors
                  ${profile.notifications
                    ? 'bg-primary-container'
                    : 'bg-surface-container-high'
                  }
                `}
              >
                <div
                  className={`
                    absolute top-1
                    w-5 h-5
                    rounded-full bg-white
                    transition-all
                    ${profile.notifications
                      ? 'left-8'
                      : 'left-1'
                    }
                  `}
                />
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* APP VERSION & UPDATE (native) / DOWNLOAD (web) */}
        {Capacitor.isNativePlatform() ? (
          <GlassPanel className="p-8 rounded-[32px]">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Smartphone className="text-primary" size={26} />
              About
            </h2>

            <div className="space-y-5">
              {/* Version info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Version</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    v{appVersion} (Build {appBuild})
                  </p>
                </div>
                {!updateAvailable && (
                  <span className="px-3 py-1.5 rounded-full bg-neon-lime/10 text-neon-lime text-xs font-semibold">
                    Up to date
                  </span>
                )}
              </div>

              {/* Update available */}
              {updateAvailable && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-on-surface">
                        Update Available
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        v{updateAvailable.version} is ready to install
                      </p>
                    </div>
                  </div>

                  {updateAvailable.releaseNotes?.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {updateAvailable.releaseNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="text-primary mt-0.5">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={async () => {
                      setUpdating(true);
                      await downloadUpdate(updateAvailable.apkUrl);
                      setTimeout(() => setUpdating(false), 3000);
                    }}
                    disabled={updating}
                    className="w-full py-3 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Update Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel className="p-8 rounded-[32px]">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Smartphone className="text-primary" size={26} />
              Mobile App
            </h2>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-semibold text-lg">
                  Download for Android
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Get the native OnlySplit app for a faster, offline-ready experience.
                </p>
              </div>

              <a
                href={apkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  px-6 py-3
                  rounded-2xl
                  bg-primary/10
                  border border-primary/30
                  text-primary
                  hover:bg-primary/20
                  transition-all duration-300
                  hover:shadow-[0_0_25px_rgba(124,108,255,0.2)]
                  font-semibold
                  flex items-center gap-3
                  w-fit
                "
              >
                <Smartphone size={18} />
                Download APK
              </a>
            </div>
          </GlassPanel>
        )}

        <GlassPanel className="p-8 rounded-[32px] border border-error/20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-error">
            <Lock size={26} />
            Session
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg">
                Logout
              </h3>

              <p className="text-sm text-on-surface-variant mt-1">
                End your current session securely on this device.
              </p>
            </div>
            {/* LOGOUT */}

            <button
              onClick={async () => {
                await authService.logout();
                navigate(ROUTES.LANDING);
              }}
              className="
        px-6 py-3
        rounded-2xl
        bg-error/10
        border border-error/30
        text-error
        hover:bg-error/20
        transition-all duration-300
        hover:shadow-[0_0_25px_rgba(255,80,80,0.2)]
        font-semibold
        flex items-center gap-3
      "
            >
              <Lock size={18} />

              Logout
            </button>
          </div>
        </GlassPanel>
        {/* PAYMENTS */}
        {/* <GlassPanel className="p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <CreditCard
              className="text-primary"
              size={26}
            />
            Payments
          </h2>

          <div className="space-y-5">
            <div className="rounded-2xl border border-dashed border-glass-stroke p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  Razorpay Integration
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Connect bank accounts and UPI payments.
                </p>
              </div>

              <button
                onClick={() =>
                  showComingSoon(
                    'Razorpay Integration'
                  )
                }
                className="
                  px-5 py-2.5
                  rounded-xl
                  bg-primary-container
                  text-white
                  hover:opacity-90
                  transition-opacity
                "
              >
                Connect
              </button>
            </div>
          </div>
        </GlassPanel> */}

        {/* DANGER */}
        {/* <GlassPanel className="p-8 rounded-[32px] border border-error/20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-error">
            <Trash2 size={26} />
            Danger Zone
          </h2>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">
                Delete Account
              </h3>

              <p className="text-sm text-on-surface-variant mt-1">
                Permanently remove your account and data.
              </p>
            </div>

            <button
              onClick={() =>
                showComingSoon('Delete Account')
              }
              className="
                px-5 py-2.5
                rounded-xl
                bg-error/10
                border border-error/30
                text-error
                hover:bg-error/20
                transition-colors
              "
            >
              Delete
            </button>
          </div>
        </GlassPanel> */}
      </div>
    </div>
  );
};

export default SettingsPage;