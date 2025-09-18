import { createContext, useState } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    email: "",
    name: "",
  },
  appLoading: true,
});

export const AuthWrapper = (props) => {
  const [auth, setAuth] = useState(() => {
    // Load initial state from localStorage
    const userStr = localStorage.getItem('user');
    console.log('Loading user from localStorage:', userStr);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Parsed user:', user);
        if (user && user.id) {
          console.log('Setting auth to authenticated');
          return {
            isAuthenticated: true,
            user: user,
          };
        } else {
          console.log('User does not have id or invalid');
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    } else {
      console.log('No user in localStorage');
    }
    return {
      isAuthenticated: false,
      user: {
        email: "",
        name: ""
      },
    };
  });

  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider value={{
      auth, setAuth, appLoading, setAppLoading
    }}>
      {props.children}
    </AuthContext.Provider>
  );
};
