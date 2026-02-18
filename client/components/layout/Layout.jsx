/**
 * Layout Component
 * 
 * Wraps Header + Footer + Sidebar in one place.
 * Pass user object (from DB) after login. Pass null for guest.
 * 
 * Usage:
 *   <AppLayout user={null}>        <- guest
 *     <YourPageContent />
 *   </AppLayout>
 * 
 *   <AppLayout user={userData}>    <- logged in (customer or owner)
 *     <YourPageContent />
 *   </AppLayout>
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import Footer from './Footer';
import CustomerSidebar from './CustomerSidebar';
import OwnerSidebar from './OwnerSidebar';

export default function AppLayout({
  children,
  user = null,
  headerProps = {},
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // role from DB: 1 = customer, 2 = owner
  const userRole = user?.role === 2 ? 'owner' : user?.role === 1 ? 'customer' : 'guest';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header - changes based on user role */}
      <Header
        user={user}
        onMenuPress={() => setIsSidebarVisible(true)}
        onSettingsPress={() => console.log('Settings')}
        {...headerProps}
      />

      {/* Sidebar - customer or owner */}
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

      {/* Page Content */}
      <View className="flex-1">
        {children}
      </View>

      {/* Footer - same for both roles */}
      <Footer />
    </SafeAreaView>
  );
}
