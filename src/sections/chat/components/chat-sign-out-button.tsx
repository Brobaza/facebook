import type { ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';

import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';


import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';

import { IconButton, Tooltip } from '@mui/material';
import { signOut as amplifySignOut } from 'src/auth/context/amplify/action';
import { signOut as firebaseSignOut } from 'src/auth/context/firebase/action';
import { signOut as jwtSignOut } from 'src/auth/context/jwt/action';
import { signOut as supabaseSignOut } from 'src/auth/context/supabase/action';
import { useAuthContext } from 'src/auth/hooks';
import { Iconify } from 'src/components/iconify';
import { useChat } from 'src/auth/context/chat';

// ----------------------------------------------------------------------

const signOut =
  (CONFIG.auth.method === 'supabase' && supabaseSignOut) ||
  (CONFIG.auth.method === 'firebase' && firebaseSignOut) ||
  (CONFIG.auth.method === 'amplify' && amplifySignOut) ||
  jwtSignOut;

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function ChatSignOutButton({ onClose, ...other }: Props) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const { chatSocket } = useChat();

  const { logout: signOutAuth0 } = useAuth0();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      chatSocket?.disconnect();
      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [checkUserSession, onClose, router]);

  const handleLogoutAuth0 = useCallback(async () => {
    try {
      await signOutAuth0();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [onClose, router, signOutAuth0]);

  return (
    // <Button
    //   fullWidth
    //   variant="soft"
    //   size="large"
    //   color="error"
    //   onClick={CONFIG.auth.method === 'auth0' ? handleLogoutAuth0 : handleLogout}
    //   {...other}
    // >
    //   Logout
    // </Button>
    <Tooltip title="Log out">
      <IconButton color="error" onClick={CONFIG.auth.method === 'auth0' ? handleLogoutAuth0 : handleLogout}>
        <Iconify icon="ic:round-power-settings-new" />
      </IconButton>
    </Tooltip>
  );
}
