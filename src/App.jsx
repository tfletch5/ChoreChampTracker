import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './store';

// Parent screens
import ParentDashboard from './screens/parent/ParentDashboard';
import ManageChores from './screens/parent/ManageChores';
import ManageRewards from './screens/parent/ManageRewards';
import Analytics from './screens/parent/Analytics';
import AddChildProfile from './screens/parent/AddChildProfile';

// Child screens
import ChildHome from './screens/child/ChildHome';
import ChoreDetails from './screens/child/ChoreDetails';
import RewardShop from './screens/child/RewardShop';
import ChildProfile from './screens/child/ChildProfile';
import ChildProgress from './screens/child/ChildProgress';

// Auth screens
import Login from './screens/auth/Login';
import SignUp from './screens/auth/SignUp';

const Stack = createStackNavigator();

function AppNavigator() {
  // In a real app, this would check if the user is logged in
  // and if they are a parent or a child
  const isLoggedIn = true;
  const isParent = true;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!isLoggedIn ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        ) : isParent ? (
          // Parent Stack
          <>
            <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
            <Stack.Screen name="ManageChores" component={ManageChores} />
            <Stack.Screen name="ManageRewards" component={ManageRewards} />
            <Stack.Screen name="Analytics" component={Analytics} />
            <Stack.Screen name="AddChildProfile" component={AddChildProfile} />
            
            {/* Parent can also access child screens */}
            <Stack.Screen name="ChildHome" component={ChildHome} />
            <Stack.Screen name="ChoreDetails" component={ChoreDetails} />
            <Stack.Screen name="RewardShop" component={RewardShop} />
            <Stack.Screen name="ChildProfile" component={ChildProfile} />
            <Stack.Screen name="ChildProgress" component={ChildProgress} />
          </>
        ) : (
          // Child Stack
          <>
            <Stack.Screen name="ChildHome" component={ChildHome} />
            <Stack.Screen name="ChoreDetails" component={ChoreDetails} />
            <Stack.Screen name="RewardShop" component={RewardShop} />
            <Stack.Screen name="ChildProfile" component={ChildProfile} />
            <Stack.Screen name="ChildProgress" component={ChildProgress} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}