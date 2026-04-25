import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors} from '../theme/colors';
import OfficerDashboardScreen from '../screens/officer/Dashboard/OfficerDashboardScreen';
import MyDutiesScreen from '../screens/officer/Duties/MyDutiesScreen';
import CreateDutyScreen from '../screens/officer/Duties/CreateDutyScreen';
import DutyDetailScreen from '../screens/officer/Duties/DutyDetailScreen';
import ProfileScreen from '../screens/officer/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const DutyStack = createNativeStackNavigator();

const DutiesNavigator = () => (
  <DutyStack.Navigator screenOptions={{headerShown: false}}>
    <DutyStack.Screen name="MyDuties" component={MyDutiesScreen} />
    <DutyStack.Screen name="DutyDetail" component={DutyDetailScreen} />
  </DutyStack.Navigator>
);

const OfficerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {backgroundColor: colors.white, borderTopColor: colors.border, height: 60, paddingBottom: 8},
    }}>
    <Tab.Screen name="Dashboard" component={OfficerDashboardScreen}
      options={{tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text>}} />
    <Tab.Screen name="MyDuties" component={DutiesNavigator}
      options={{tabBarLabel: 'My Duties', tabBarIcon: () => <Text style={{fontSize: 20}}>📋</Text>}} />
    <Tab.Screen name="CreateDuty" component={CreateDutyScreen}
      options={{tabBarLabel: 'Create Duty', tabBarIcon: () => <Text style={{fontSize: 20}}>➕</Text>}} />
    <Tab.Screen name="Profile" component={ProfileScreen}
      options={{tabBarIcon: () => <Text style={{fontSize: 20}}>👤</Text>}} />
  </Tab.Navigator>
);

export default OfficerTabs;
