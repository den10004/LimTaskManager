import { AuthProvider } from "./contexts/AuthContext";
import { TeamProvider } from "./contexts/TeamContext";
import { UserProvider } from "./contexts/UserContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <UserProvider>
        <TeamProvider>{children}</TeamProvider>
      </UserProvider>
    </AuthProvider>
  );
}
