import React from 'react';
import { User, Mail, Phone, Lock, Shield } from 'lucide-react';

interface ProfilePageProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user = {
    firstName: "James",
    lastName: "Wilson", 
    email: "james.wilson@example.com",
    phoneNumber: "+1 (555) 123-4567"
  }
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white px-6 py-8 sm:px-8">
            <div className="text-center">
              {/* Profile Avatar */}
              <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              
              {/* Name and Email */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                {user.email}
              </p>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Edit Profile
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phoneNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Password</h2>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Change Password
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-gray-400 text-sm sm:text-base tracking-wider">
                  ••••••••••••••••••••••••••••••••
                </div>
              </div>
            </div>
          </div>

          {/* Security Questions Section */}
          <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Security Questions</h2>
              </div>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Change Security Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;