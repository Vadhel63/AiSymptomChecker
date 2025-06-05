"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userAPI, doctorAPI, patientAPI } from "../services/api";
import {
  User,
  Mail,
  Camera,
  Save,
  MapPin,
  Stethoscope,
  Users,
  AlertCircle,
  Phone,
} from "lucide-react";

const Profile = () => {
  const { user, updateUser, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Basic profile data
  const [profileData, setProfileData] = useState({
    userName: "",
    email: "",
    imageUrl: "",
  });

  // Role-specific data
  const [roleSpecificData, setRoleSpecificData] = useState({});
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Initialize basic profile data
  useEffect(() => {
    if (user) {
      console.log("Profile - Initializing with user:", user); // Debug log

      setProfileData({
        userName: user.userName || "",
        email: user.email || "",
        imageUrl: user.ImageUrl || "",
      });

      // Set the image preview to the current user image (Cloudinary URL)
      // Only set if there's actually an image URL
      if (user.imageUrl && user.imageUrl.trim() !== "") {
        setImagePreview(user.imageUrl);
        console.log("Profile - Setting image preview:", user.imageUrl); // Debug log
      } else {
        setImagePreview("");
        console.log("Profile - No image URL found"); // Debug log
      }

      // Check if role-specific profile exists
      checkExistingProfile();
    }
  }, [user]);

  // Mobile number validation function
  const validateMobileNumber = (mobileNo) => {
    if (!mobileNo) return true; // Optional field

    // Remove any spaces, dashes, or parentheses
    const cleanNumber = mobileNo.replace(/[\s\-$$$$]/g, "");

    // Check if it's a valid mobile number (10 digits for Indian numbers, can be extended)
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    const internationalRegex = /^\+\d{10,15}$/; // International format

    return (
      mobileRegex.test(cleanNumber) || internationalRegex.test(cleanNumber)
    );
  };

  const checkExistingProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (user.role === "Patient") {
        try {
          const response = await patientAPI.getMyProfile();
          if (response.data) {
            setRoleSpecificData({
              patientId: response.data.patientId,
              age: response.data.age || "",
              gender: response.data.gender || "",
              city: response.data.city || "",
              state: response.data.state || "",
              area: response.data.area || "",
              pincode: response.data.pincode || "",
              country: response.data.country || "",
              medicalHistory: response.data.medicalHistory || "",
              mobileNo: response.data.mobileNo || "",
            });
            setHasExistingProfile(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            setHasExistingProfile(false);
            setRoleSpecificData({
              age: "",
              gender: "",
              city: "",
              state: "",
              area: "",
              pincode: "",
              country: "",
              medicalHistory: "",
              mobileNo: "",
            });
          }
        }
      } else if (user.role === "Doctor") {
        try {
          const response = await doctorAPI.getMyProfile();
          if (response.data) {
            setRoleSpecificData({
              doctorId: response.data.doctorId,
              specialization: response.data.specialization || "",
              experience: response.data.experience || "",
              qualification: response.data.qualification || "",
              checkUpFee: response.data.checkUpFee || "",
              clinicName: response.data.clinicName || "",
              availability: response.data.availability || "",
              area: response.data.area || "",
              city: response.data.city || "",
              state: response.data.state || "",
              pincode: response.data.pincode || "",
              country: response.data.country || "",
              mobileNo: response.data.mobileNo || "",
            });
            setHasExistingProfile(true);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            setHasExistingProfile(false);
            setRoleSpecificData({
              specialization: "",
              experience: "",
              qualification: "",
              checkUpFee: "",
              clinicName: "",
              availability: "",
              area: "",
              city: "",
              state: "",
              pincode: "",
              country: "",
              mobileNo: "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking existing profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleDataChange = (e) => {
    const { name, value } = e.target;

    // Special validation for mobile number
    if (name === "mobileNo") {
      // Allow only numbers, spaces, dashes, parentheses, and plus sign
      const sanitizedValue = value.replace(/[^0-9\s\-$$$$+]/g, "");
      setRoleSpecificData({
        ...roleSpecificData,
        [name]: sanitizedValue,
      });

      // Clear mobile number related errors
      if (error.includes("mobile") || error.includes("phone")) {
        setError("");
      }
    } else {
      setRoleSpecificData({
        ...roleSpecificData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        console.log("Profile - New image selected for preview"); // Debug log
      };
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate mobile number if provided
      if (
        roleSpecificData.mobileNo &&
        !validateMobileNumber(roleSpecificData.mobileNo)
      ) {
        setError(
          "Please enter a valid mobile number (10 digits for Indian numbers or international format with +)"
        );
        setSaving(false);
        return;
      }

      // Update basic profile (name and image)
      if (imageFile || profileData.userName !== user?.userName) {
        const formData = new FormData();

        if (imageFile) {
          formData.append("imageUrl", imageFile); // This matches your backend parameter
          console.log("Profile - Uploading new image"); // Debug log
        }

        if (profileData.userName !== user?.userName) {
          formData.append("name", profileData.userName); // This matches your backend parameter
          console.log("Profile - Updating username"); // Debug log
        }

        const response = await userAPI.updateProfile(formData);
        if (response.data) {
          console.log("Profile - Update response:", response.data); // Debug log

          // Update the user context with new data from backend
          updateUser({
            ...response.data,
            imageUrl: response.data.imageUrl || "", // Cloudinary URL from backend
          });

          // Update local profile data with the response
          setProfileData((prev) => ({
            ...prev,
            userName: response.data.userName || prev.userName,
            imageUrl: response.data.imageUrl || prev.imageUrl,
          }));

          // Update image preview with the new Cloudinary URL
          if (response.data.imageUrl) {
            setImagePreview(response.data.imageUrl);
            console.log(
              "Profile - Image updated successfully:",
              response.data.imageUrl
            ); // Debug log
          }

          // Clear the file input since image is now saved
          setImageFile(null);

          // Refresh the user profile in context to ensure navbar updates
          await refreshUserProfile();
        }
      }

      // Handle role-specific data (Patient/Doctor profiles)
      if (user?.role === "Patient") {
        const patientData = {
          age: Number(roleSpecificData.age) || 0,
          gender: roleSpecificData.gender || "",
          city: roleSpecificData.city || "",
          state: roleSpecificData.state || "",
          area: roleSpecificData.area || "",
          pincode: roleSpecificData.pincode || "",
          country: roleSpecificData.country || "",
          medicalHistory: roleSpecificData.medicalHistory || "",
          mobileNo: roleSpecificData.mobileNo || "",
        };

        if (hasExistingProfile && roleSpecificData.patientId) {
          await patientAPI.updatePatient(
            roleSpecificData.patientId,
            patientData
          );
          setSuccess("Patient profile updated successfully!");
        } else {
          const response = await patientAPI.addPatientBYEmail(patientData);
          setSuccess("Patient profile created successfully!");
          setHasExistingProfile(true);
          if (response.data) {
            setRoleSpecificData((prev) => ({
              ...prev,
              patientId: response.data.patientId,
            }));
          }
        }
      } else if (user?.role === "Doctor") {
        const doctorData = {
          specialization: roleSpecificData.specialization || "",
          experience: Number(roleSpecificData.experience) || 0,
          qualification: roleSpecificData.qualification || "",
          checkUpFee: Number(roleSpecificData.checkUpFee) || 0,
          clinicName: roleSpecificData.clinicName || "",
          availability: roleSpecificData.availability || "",
          area: roleSpecificData.area || "",
          city: roleSpecificData.city || "",
          state: roleSpecificData.state || "",
          pincode: roleSpecificData.pincode || "",
          country: roleSpecificData.country || "",
          mobileNo: roleSpecificData.mobileNo || "",
        };

        if (hasExistingProfile && roleSpecificData.doctorId) {
          await doctorAPI.updateDoctor(roleSpecificData.doctorId, doctorData);
          setSuccess("Doctor profile updated successfully!");
        } else {
          const response = await doctorAPI.addDoctorByEmail(doctorData);
          setSuccess("Doctor profile created successfully!");
          setHasExistingProfile(true);
          if (response.data) {
            setRoleSpecificData((prev) => ({
              ...prev,
              doctorId: response.data.doctorId,
            }));
          }
        }
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get the current image to display (preview if uploading, otherwise saved Cloudinary URL)
  const currentImageUrl = imagePreview || profileData.imageUrl;

  console.log("Profile - Rendering with currentImageUrl:", currentImageUrl); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            {hasExistingProfile
              ? "Update your profile information"
              : "Complete your profile setup"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {currentImageUrl && currentImageUrl.trim() !== "" ? (
                      <img
                        src={currentImageUrl || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(
                            "Profile - Image failed to load:",
                            currentImageUrl
                          ); // Debug log
                          // Fallback to default avatar if Cloudinary image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                        onLoad={() => {
                          console.log(
                            "Profile - Image loaded successfully:",
                            currentImageUrl
                          ); // Debug log
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 ${
                        currentImageUrl && currentImageUrl.trim() !== ""
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      <User className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Profile Picture
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload a new profile picture. JPG, PNG or GIF (max 5MB)
                  </p>
                  {imageFile && (
                    <p className="text-xs text-blue-600 mt-1">
                      New image selected. Click "Save" to update.
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.userName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={profileData.email}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    user?.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : user?.role === "Doctor"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          {user?.role === "Patient" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patient Information
                  {hasExistingProfile && (
                    <span className="ml-2 text-sm text-green-600 font-normal">
                      ✓ Profile exists
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="age"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="0"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.age || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.gender || ""}
                      onChange={handleRoleDataChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="mobileNo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Phone className="inline h-4 w-4 mr-1" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      placeholder="Enter mobile number (e.g., 9876543210 or +919876543210)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.mobileNo || ""}
                      onChange={handleRoleDataChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit mobile number or international format with
                      +
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="area"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Area/Locality
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.area || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.city || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.state || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.pincode || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.country || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="medicalHistory"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Medical History
                    </label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any chronic conditions, allergies, or previous surgeries..."
                      value={roleSpecificData.medicalHistory || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Information */}
          {user?.role === "Doctor" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Professional Information
                  {hasExistingProfile && (
                    <span className="ml-2 text-sm text-green-600 font-normal">
                      ✓ Profile exists
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Specialization
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.specialization || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.experience || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="qualification"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Qualifications
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.qualification || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkUpFee"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      id="checkUpFee"
                      name="checkUpFee"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.checkUpFee || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="clinicName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Clinic/Hospital Name
                    </label>
                    <input
                      type="text"
                      id="clinicName"
                      name="clinicName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.clinicName || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="availability"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Availability
                    </label>
                    <input
                      type="text"
                      id="availability"
                      name="availability"
                      placeholder="e.g., Mon-Fri 9AM-5PM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.availability || ""}
                      onChange={handleRoleDataChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="mobileNo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Phone className="inline h-4 w-4 mr-1" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      placeholder="Enter mobile number (e.g., 9876543210 or +919876543210)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleSpecificData.mobileNo || ""}
                      onChange={handleRoleDataChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit mobile number or international format with
                      +
                    </p>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <MapPin className="inline h-5 w-5 mr-2" />
                    Practice Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="area"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Area/Locality
                      </label>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={roleSpecificData.area || ""}
                        onChange={handleRoleDataChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={roleSpecificData.city || ""}
                        onChange={handleRoleDataChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={roleSpecificData.state || ""}
                        onChange={handleRoleDataChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={roleSpecificData.pincode || ""}
                        onChange={handleRoleDataChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={roleSpecificData.country || ""}
                        onChange={handleRoleDataChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasExistingProfile ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
