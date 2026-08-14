import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { Camera, UserRound, X, Check } from 'lucide-react';
import apiClient from '../utils/apiClient';
import { updateProfile } from '../features/auth/authSlice';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

const createCroppedImage = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    image.onerror = reject;
    image.src = imageSrc;
  });
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    avatar: user?.avatar || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Crop states
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropper(true);
    };

    reader.readAsDataURL(file);

    // Allow selecting same image again
    e.target.value = '';
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    try {
      const croppedImage = await createCroppedImage(
        selectedImage,
        croppedAreaPixels
      );

      setProfileForm((prev) => ({
        ...prev,
        avatar: croppedImage,
      }));

      setShowCropper(false);
      setSelectedImage(null);
      toast.success('Photo cropped successfully');
    } catch (error) {
      toast.error('Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleRemoveImage = () => {
    setProfileForm((prev) => ({
      ...prev,
      avatar: '',
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setSavingProfile(true);

    const result = await dispatch(updateProfile(profileForm));

    setSavingProfile(false);

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success('Password changed successfully');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Profile Settings
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account details and security
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="glass-card p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold">
          Personal Information
        </h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">

          <div className="relative">

            {profileForm.avatar ? (
              <img
                src={profileForm.avatar}
                alt="Profile"
                className="h-28 w-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-xl">
                <UserRound size={48} />
              </div>
            )}

            {/* Camera */}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-110"
            >
              <Camera size={18} />

              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

          </div>

          <div className="text-center sm:text-left">
            <p className="font-medium">
              Profile Picture
            </p>

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WEBP. Maximum 5MB.
            </p>

            {profileForm.avatar && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 text-xs font-medium text-danger-600 hover:underline"
              >
                Remove picture
              </button>
            )}
          </div>

        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full Name
          </label>

          <input
            type="text"
            className="input-field"
            value={profileForm.name}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                name: e.target.value,
              })
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            className="input-field opacity-60"
            value={user?.email || ''}
            disabled
          />
        </div>

        {/* Currency */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Preferred Currency
          </label>

          <select
            className="input-field"
            value={profileForm.currency}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                currency: e.target.value,
              })
            }
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={savingProfile}
          className="btn-primary"
        >
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Change Password */}
      {user?.authProvider === 'local' && (
        <form
          onSubmit={handlePasswordSubmit}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">
            Change Password
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Current Password
            </label>

            <input
              type="password"
              required
              className="input-field"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Confirm New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* ================= CROP MODAL ================= */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold">
                  Crop Profile Picture
                </h2>

                <p className="text-xs text-gray-500">
                  Move and zoom the image
                </p>
              </div>

              <button
                type="button"
                onClick={handleCropCancel}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-[350px] w-full bg-black">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4 p-5">

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Zoom</span>
                  <span className="text-gray-500">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <X size={18} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCropSave}
                  className="btn-primary flex flex-1 items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Crop & Continue
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;