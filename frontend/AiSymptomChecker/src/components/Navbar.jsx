"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
  Calendar,
  FileText,
  Settings,
  Users,
  Stethoscope,
  Shield,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavItems = () => {
    const baseItems = [
      { name: "Dashboard", path: "/dashboard", icon: Activity },
    ];

    if (user?.role === "Patient") {
      return [
        ...baseItems,
        { name: "Symptom Checker", path: "/symptom-checker", icon: Search },
        { name: "Find Doctors", path: "/find-doctors", icon: Stethoscope },
        { name: "My Appointments", path: "/dashboard", icon: Calendar },
        { name: "Medical Reports", path: "/dashboard", icon: FileText },
      ];
    } else if (user?.role === "Doctor") {
      return [
        ...baseItems,
        { name: "Appointments", path: "/dashboard", icon: Calendar },
        { name: "My Patients", path: "/dashboard", icon: Users },
        { name: "Medical Reports", path: "/dashboard", icon: FileText },
      ];
    } else if (user?.role === "Admin") {
      return [
        ...baseItems,
        { name: "User Management", path: "/dashboard", icon: Users },
        { name: "Doctor Approvals", path: "/dashboard", icon: Settings },
        { name: "System Settings", path: "/dashboard", icon: Shield },
      ];
    }

    return baseItems;
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Component for profile avatar that handles both image and default state
  const ProfileAvatar = ({ size = "w-8 h-8", iconSize = "h-5 w-5" }) => {
    const [imageError, setImageError] = useState(false);
    const hasProfileImage = user?.imageUrl && !imageError;

    if (hasProfileImage) {
      return (
        <div
          className={`${size} rounded-full overflow-hidden border-2 border-white shadow-sm`}
        >
          <img
            src={user.imageUrl || "/placeholder.svg"}
            alt={`${user.userName}'s profile`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div
        className={`${size} bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center`}
      >
        <UserCircle className={`${iconSize} text-white`} />
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI HealthCare
                </span>
                <p className="text-xs text-gray-500">Healthcare Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ProfileAvatar />
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.userName}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <ProfileAvatar size="w-10 h-10" iconSize="h-6 w-6" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.userName}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
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
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center px-3 py-2 mb-3">
                <div className="mr-3">
                  <ProfileAvatar size="w-10 h-10" iconSize="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.userName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Profile Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
