/**
 * Layout Components - Complete Implementation
 * 
 * This file provides:
 * 1. Individual Header component
 * 2. Individual Footer component  
 * 3. Complete AppLayout component that combines both with sidebar
 * 4. Integration with user authentication
 */

import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import Footer from './Footer';
import CustomerSidebar from './CustomerSidebar';
import OwnerSidebar from './OwnerSidebar';

/**
 * AppLayout Component
 * Complete layout wrapper that automatically handles user role-based header/footer changes
 * 
 * Usage:
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 */
export function AppLayout({
  children,
  headerProps = {},
  footerProps = {},
  loading = false,
}) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Fetch user data from storage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get user data from AsyncStorage (set after login)
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Get user role from backend user object
          const role = userData?.role || 'guest';
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole('guest');
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
        setUser(null);
        setUserRole('guest');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading && loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        onMenuPress={() => setIsSidebarVisible(true)}
        onSettingsPress={() => console.log('Settings')}
        {...headerProps}
      />

      {/* Sidebar - Show based on user role */}
      {userRole === 'customer' && (
        <CustomerSidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          user={user}
        />
      )}

      {userRole === 'owner' && (
        <OwnerSidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          user={user}
        />
      )}

      {/* Main Content */}
      <View className="flex-1">
        {children}
      </View>

      {/* Footer */}
      <Footer {...footerProps} />
    </SafeAreaView>
  );
}

/**
 * Hook to get current user and role
 * Use this in your pages to access user data
 * 
 * Usage:
 * const { user, userRole } = useUser();
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setUserRole(userData?.role || 'guest');
        } else {
          setUser(null);
          setUserRole('guest');
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { user, userRole, isLoading };
};

/**
 * Hook to update user role after login
 * Call this in your login handler
 * 
 * Usage in SignInPage:
 * const updateUserRole = useUpdateUserRole();
 * 
 * In login success:
 * await updateUserRole(userData);
 */
export const useUpdateUserRole = () => {
  return async (userData) => {
    try {
      // Store user data including role
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.log('Error updating user role:', error);
      return false;
    }
  };
};

/**
 * Hook to logout user
 * Call this when user logs out
 * 
 * Usage:
 * const logout = useLogout();
 * await logout();
 */
export const useLogout = () => {
  return async () => {
    try {
      await AsyncStorage.removeItem('userData');
      return true;
    } catch (error) {
      console.log('Error logging out:', error);
      return false;
    }
  };
};

export default AppLayout;
