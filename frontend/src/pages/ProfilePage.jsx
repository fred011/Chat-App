import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, User } from "lucide-react";
import { UploadButton } from "@uploadthing/react"; // Import UploadThing's UploadButton

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(authUser.profilePic);

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <div className="absolute bottom-0 right-0">
                <UploadButton
                  endpoint="imageUploader" // Use the endpoint from backend UploadThing setup
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      const imageUrl = res[0].url; // Get uploaded image URL
                      setSelectedImg(imageUrl); // Set new profile pic
                      updateProfile({ profilePic: imageUrl }); // Update in backend
                    }
                  }}
                  onUploadError={(error) =>
                    console.error("Upload error:", error)
                  }
                />
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the button to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
