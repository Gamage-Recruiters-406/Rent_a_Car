/**
 * AppLayout Component
 *
 * Wraps Header + Footer + Sidebar in one place.
 * Automatically fetches the logged-in user from the API using the stored token.
 * Renders CustomerSidebar or OwnerSidebar based on user.role from DB.
 *
 * role: 1 = customer, 2 = owner
 *
 * Usage:
 *   <AppLayout>
 *     <YourPageContent />
 *   </AppLayout>
 *
 *   Or with custom header props:
 *   <AppLayout headerProps={{ title: 'My Page', showBack: true }}>
 *     <YourPageContent />
 *   </AppLayout>
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import { CustomerFooter, OwnerFooter } from './Footer';
import CustomerSidebar from './CustomerSidebar';
import OwnerSidebar from './OwnerSidebar';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

export default function AppLayout({
  children,
  headerProps = {},
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}${API_VERSION}/authUser/getUserDetails`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('AppLayout: Failed to fetch user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Determine role: 1 = customer, 2 = owner, anything else = guest
  const userRole = user?.role === 2 ? 'owner' : user?.role === 1 ? 'customer' : 'guest';

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0D3778" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header — passes user so it can show name/role, and opens sidebar on menu press */}
      <Header
        user={user}
        onMenuPress={() => setIsSidebarVisible(true)}
        onSettingsPress={() => console.log('Settings pressed')}
        {...headerProps}
      />

      {/* Customer Sidebar — only rendered for role 1 */}
      {userRole === 'customer' && (
        <CustomerSidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          user={user}
        />
      )}

      {/* Owner Sidebar — only rendered for role 2 */}
      {userRole === 'owner' && (
        <OwnerSidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          user={user}
        />
      )}

      {/* Page Content */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </View>

      {/* Footer — different for customer and owner */}
      {userRole === 'owner' ? <OwnerFooter /> : <CustomerFooter />}
    </SafeAreaView>
  );
}