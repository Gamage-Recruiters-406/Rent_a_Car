import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://localhost:8090'; 

// MAIN NOTIFICATION SCREEN COMPONENT
const NotificationScreen = ({ navigation, route }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    all: 0,
    unread: 0,
    bookings: 0,
    reviews: 0,
    alerts: 0,
  });

  const userRole = route?.params?.userRole || 'customer';

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
    calculateCounts();
  }, [notifications, activeTab]);

  // GET /api/v1/notification/me — all notifications for authenticated user
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/v1/notification/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.success && Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;
    switch (activeTab) {
      case 'unread':
        filtered = notifications.filter((n) => !n.isRead);
        break;
      case 'bookings':
        filtered = notifications.filter((n) => n.type?.toLowerCase() === 'booking');
        break;
      case 'reviews':
        filtered = notifications.filter((n) => n.type?.toLowerCase() === 'review');
        break;
      case 'alerts':
        filtered = notifications.filter((n) =>
          ['rejected', 'approved', 'pending', 'warning'].includes(n.type?.toLowerCase())
        );
        break;
      case 'all':
      default:
        filtered = notifications;
        break;
    }
    setFilteredNotifications(filtered);
  };

  const calculateCounts = () => {
    setCounts({
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      bookings: notifications.filter((n) => n.type?.toLowerCase() === 'booking').length,
      reviews: notifications.filter((n) => n.type?.toLowerCase() === 'review').length,
      alerts: notifications.filter((n) =>
        ['rejected', 'approved', 'pending', 'warning'].includes(n.type?.toLowerCase())
      ).length,
    });
  };

  // DELETE /api/v1/notification/:notificationId — delete a single notification
  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/v1/notification/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
              });
              if (!response.ok) throw new Error('Failed to delete notification');
              setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  // PUT /api/v1/notification/read/:notificationId — mark a single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/notification/read/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // PUT /api/v1/notification/read/:notificationId — used for mark-all by iterating unread
  // (No bulk mark-all-read route exists in the provided router, so we call per-notification)
  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unread.map((n) =>
          fetch(`${BASE_URL}/api/v1/notification/read/${n._id || n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  // DELETE /api/v1/notification/:notificationId — iterated for delete-all
  // (No bulk delete-all route exists in the provided router, so we call per-notification)
  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                notifications.map((n) =>
                  fetch(`${BASE_URL}/api/v1/notification/${n._id || n.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                  })
                )
              );
              setNotifications([]);
            } catch (error) {
              console.error('Error deleting all notifications:', error);
              Alert.alert('Error', 'Failed to delete all notifications');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 active:opacity-50">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">Notifications</Text>
            {counts.unread > 0 && (
              <Text className="text-xs text-gray-500">{counts.unread} unread</Text>
            )}
          </View>
        </View>

        <View className="flex-row gap-2">
          {counts.unread > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} className="p-2 active:opacity-50">
              <Ionicons name="checkmark-done" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll} className="p-2 active:opacity-50">
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <NotificationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        userRole={userRole}
      />

      {/* Notifications List */}
      <NotificationContainer
        notifications={filteredNotifications}
        onDelete={handleDelete}
        onMarkAsRead={handleMarkAsRead}
        onSelectNotification={setSelectedNotification}
        isLoading={isLoading}
        userRole={userRole}
      />

      {/* Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={handleDelete}
          userRole={userRole}
        />
      )}
    </SafeAreaView>
  );
};


// NOTIFICATION TABS COMPONENT
const NotificationTabs = ({ activeTab, onTabChange, counts, userRole }) => {
  const getTabs = () => {
    const baseTabs = [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
    ];
    if (userRole === 'owner') {
      return [
        ...baseTabs,
        { id: 'bookings', label: 'Booking Requests' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'alerts', label: 'Alerts' },
      ];
    }
    return [
      ...baseTabs,
      { id: 'bookings', label: 'Bookings' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'alerts', label: 'Alerts' },
    ];
  };

  const tabs = getTabs();

  return (
    <View className="border-b border-gray-200 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={`px-4 py-3 border-b-2 ${activeTab === tab.id ? 'border-blue-600' : 'border-transparent'}`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Text className={`text-sm font-medium ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`}>
                {tab.label}
              </Text>
              {counts[tab.id] > 0 && (
                <View className={`ml-2 px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-200'}`}>
                  <Text className={`text-xs font-semibold ${activeTab === tab.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {counts[tab.id]}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


// NOTIFICATION CONTAINER COMPONENT
const NotificationContainer = ({
  notifications,
  onDelete,
  onMarkAsRead,
  onSelectNotification,
  isLoading,
  userRole,
}) => {
  if (isLoading) {
    return (
      <View className="p-8 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="p-8 items-center justify-center">
        <Text className="text-gray-500">No notifications found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item, index) => item._id || item.id || index.toString()}
      renderItem={({ item }) => (
        <NotificationItem
          id={item._id || item.id}
          type={item.type}
          title={item.title}
          description={item.description}
          timestamp={item.timestamp}
          isRead={item.isRead}
          onDelete={onDelete}
          onMarkAsRead={onMarkAsRead}
          onSelect={() => onSelectNotification(item)}
          userRole={userRole}
        />
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
    />
  );
};


// NOTIFICATION ITEM COMPONENT
const NotificationItem = ({
  id,
  type,
  title,
  description,
  timestamp,
  isRead,
  onDelete,
  onMarkAsRead,
  onSelect,
  userRole,
}) => {
  const getIconConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return { name: 'close-circle', color: '#ef4444' };
      case 'approved':
      case 'success':
        return { name: 'checkmark-circle', color: '#22c55e' };
      case 'pending':
      case 'warning':
        return { name: 'warning', color: '#eab308' };
      case 'received':
        return { name: 'information-circle', color: '#3b82f6' };
      case 'booking':
        return { name: 'calendar', color: '#3b82f6' };
      case 'review':
        return { name: 'star', color: '#3b82f6' };
      case 'info':
      default:
        return { name: 'information-circle', color: '#6b7280' };
    }
  };

  const icon = getIconConfig(type);

  return (
    <TouchableOpacity
      className={`p-4 border-b border-gray-200 flex-row items-start justify-between active:bg-gray-100 ${!isRead ? 'bg-blue-50/60' : 'bg-white'}`}
      onPress={() => {
        onSelect();
        onMarkAsRead(id);
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start gap-3 flex-1">
        <View className="mt-1">
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View className="flex-1">
          <Text className={`text-sm ${!isRead ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'}`}>
            {title}
          </Text>
          <Text className={`text-xs mt-1 ${!isRead ? 'text-gray-600' : 'text-gray-500'}`} numberOfLines={2}>
            {description}
          </Text>
          <View className="flex-row items-center gap-4 mt-2">
            <Text className="text-xs text-gray-500">{timestamp}</Text>
          </View>
        </View>
      </View>
      <View className="ml-4 gap-2 items-center">
        {!isRead ? (
          <View className="px-2 py-1 bg-blue-500 rounded-full">
            <Text className="text-white text-xs font-semibold">New</Text>
          </View>
        ) : (
          <View className="px-2 py-1 bg-gray-200 rounded-full">
            <Text className="text-gray-600 text-xs font-medium">Read</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => onDelete(id)} className="p-2 active:opacity-50">
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


// NOTIFICATION DETAIL MODAL COMPONENT
const NotificationDetailModal = ({ notification, onClose, onDelete, userRole }) => {
  if (!notification) return null;

  const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return { name: 'close-circle', color: '#ef4444' };
      case 'approved':
      case 'success':
        return { name: 'checkmark-circle', color: '#22c55e' };
      case 'pending':
      case 'warning':
        return { name: 'warning', color: '#eab308' };
      case 'received':
        return { name: 'information-circle', color: '#3b82f6' };
      case 'booking':
        return { name: 'calendar', color: '#3b82f6' };
      case 'review':
        return { name: 'star', color: '#3b82f6' };
      case 'info':
      default:
        return { name: 'information-circle', color: '#3b82f6' };
    }
  };

  const renderRoleSpecificDetails = () => {
    const type = notification.type?.toLowerCase();
    switch (type) {
      case 'booking':
        return (
          <View className="space-y-3">
            <DetailRow
              label="Status"
              value={
                <View className={`px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-semibold ${notification.isRead ? 'text-gray-700' : 'text-blue-700'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Text>
                </View>
              }
            />
            <DetailRow
              label="Received Date"
              value={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
            />
            {userRole === 'owner' && (
              <DetailRow label="Customer" value={notification.details?.customer || 'N/A'} />
            )}
            <DetailRow label="Vehicle" value={notification.details?.vehicle || 'N/A'} />
            <DetailRow label="Booking ID" value={notification.details?.bookingId || 'N/A'} />
            <DetailRow label="Booking Date" value={notification.details?.bookingDate || notification.timestamp} />
          </View>
        );

      case 'review':
        return (
          <View className="space-y-3">
            <DetailRow
              label="Status"
              value={
                <View className={`px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-semibold ${notification.isRead ? 'text-gray-700' : 'text-blue-700'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Text>
                </View>
              }
            />
            <DetailRow
              label="Received Date"
              value={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
            />
            {userRole === 'customer' && (
              <DetailRow label="Vehicle Owner" value={notification.details?.owner || 'N/A'} />
            )}
            {userRole === 'owner' && (
              <DetailRow label="Customer" value={notification.details?.customer || 'N/A'} />
            )}
            <DetailRow label="Vehicle" value={notification.details?.vehicle || 'N/A'} />
            <DetailRow
              label="Rating"
              value={
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-900 font-medium">
                    {'⭐'.repeat(notification.details?.rating || 0)} ({notification.details?.rating || 0}.0)
                  </Text>
                </View>
              }
            />
            <DetailRow label="Review Date" value={notification.details?.reviewDate || notification.timestamp} />
          </View>
        );

      case 'approved':
      case 'rejected':
      case 'pending':
      case 'success':
        return (
          <View className="space-y-3">
            <DetailRow
              label="Status"
              value={
                <View className={`px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-semibold ${notification.isRead ? 'text-gray-700' : 'text-blue-700'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Text>
                </View>
              }
            />
            <DetailRow
              label="Received Date"
              value={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
            />
            <DetailRow label="Type" value={notification.type} capitalize />
            <DetailRow label="Details" value={notification.details?.description || 'N/A'} />
          </View>
        );

      default:
        return (
          <View className="space-y-3">
            <DetailRow
              label="Status"
              value={
                <View className={`px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-semibold ${notification.isRead ? 'text-gray-700' : 'text-blue-700'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Text>
                </View>
              }
            />
            <DetailRow
              label="Received Date"
              value={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
            />
            <DetailRow label="Type" value={notification.type} capitalize />
          </View>
        );
    }
  };

  const icon = getIconByType(notification.type);

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/20 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <ScrollView className="max-h-[80vh]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <View className="flex-row items-center gap-3 flex-1">
                <Ionicons name={icon.name} size={32} color={icon.color} />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
                    {notification.title}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">{notification.timestamp}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} className="ml-2 p-2">
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View className="p-6 border-b border-gray-200">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Description</Text>
              <Text className="text-sm text-gray-600 leading-5">{notification.description}</Text>
            </View>

            {/* Details */}
            <View className="p-6 border-b border-gray-200">
              <Text className="text-sm font-semibold text-gray-900 mb-4">Details</Text>
              {renderRoleSpecificDetails()}
            </View>

            {/* Actions */}
            <View className="p-6 flex-row gap-3 justify-end">
              <TouchableOpacity
                onPress={() => {
                  onDelete(notification._id || notification.id);
                  onClose();
                }}
                className="flex-row items-center gap-2 px-4 py-3 rounded-lg active:opacity-70"
              >
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text className="text-sm font-semibold text-red-600">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="px-4 py-3 bg-gray-100 rounded-lg active:bg-gray-200">
                <Text className="text-sm font-semibold text-gray-900">Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


// DETAIL ROW HELPER COMPONENT
const DetailRow = ({ label, value, capitalize = false }) => (
  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
    <Text className="text-sm text-gray-600">{label}</Text>
    {typeof value === 'string' ? (
      <Text className={`text-sm text-gray-900 font-medium ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </Text>
    ) : (
      value
    )}
  </View>
);

export default NotificationScreen;