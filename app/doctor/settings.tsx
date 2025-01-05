import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Example() {
  const [form, setForm] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  const router = useRouter();
  const { name, email, profileImage } = useSelector((state) => state.auth);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f6' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your preferences and notifications.
          </Text>
        </View>

        <ScrollView>
          {/* Profile Section */}
          <View style={styles.profile}>
            <Image
              alt="User Avatar"
              source={{ uri: profileImage }}
              style={styles.profileAvatar}
            />
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/profile');
              }}>
              <View style={styles.profileAction}>
                <Text style={styles.profileActionText}>Edit Profile</Text>
                <FeatherIcon color="#fff" name="edit" size={16} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionBody}>
              {/* Language Row */}
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#fe9400' }]}>
                  <FeatherIcon color="#fff" name="globe" size={20} />
                </View>
                <Text style={styles.rowLabel}>Language</Text>
                <Text style={styles.rowValue}>English</Text>
                <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
              </TouchableOpacity>

              {/* Dark Mode Row */}
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
                  <FeatherIcon color="#fff" name="moon" size={20} />
                </View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Switch
                  onValueChange={darkMode => setForm({ ...form, darkMode })}
                  value={form.darkMode}
                />
              </View>

              {/* Location Row */}
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
                  <FeatherIcon color="#fff" name="navigation" size={20} />
                </View>
                <Text style={styles.rowLabel}>Location</Text>
                <Text style={styles.rowValue}>Los Angeles, CA</Text>
                <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.sectionBody}>
              {/* Email Notifications Row */}
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#38C959' }]}>
                  <FeatherIcon color="#fff" name="at-sign" size={20} />
                </View>
                <Text style={styles.rowLabel}>Email Notifications</Text>
                <Switch
                  onValueChange={emailNotifications =>
                    setForm({ ...form, emailNotifications })
                  }
                  value={form.emailNotifications}
                />
              </View>

              {/* Push Notifications Row */}
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: '#38C959' }]}>
                  <FeatherIcon color="#fff" name="bell" size={20} />
                </View>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Switch
                  onValueChange={pushNotifications =>
                    setForm({ ...form, pushNotifications })
                  }
                  value={form.pushNotifications}
                />
              </View>

              
            </View>
          </View>
          
          {/* Footer */}
          <Text style={styles.contentFooter}>Supat Health</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16, // Adjust padding for smaller screens
  },
  contentFooter: {
    marginTop: 24,
    fontSize: 13,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#929292',
    marginTop: 6,
  },
  profile: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#090909',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '400',
    color: '#848484',
  },
  profileAction: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
  },
  profileActionText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#a7a7a7',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    height: 50,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8a8a8a',
  },
});
