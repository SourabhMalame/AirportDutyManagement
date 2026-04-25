import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {ROLES} from '../constants/roles';
import AuthStack from './authStack';
import AdminTabs from './AdminTabs';
import OfficerTabs from './OfficerTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {isLoggedIn, role} = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : role === ROLES.ADMIN ? (
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
        ) : (
          <Stack.Screen name="OfficerTabs" component={OfficerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
