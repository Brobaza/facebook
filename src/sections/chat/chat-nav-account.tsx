import type { SelectChangeEvent } from '@mui/material/Select';

import { useCallback, useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputBase from '@mui/material/InputBase';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { svgIconClasses } from '@mui/material/SvgIcon';

import { CustomPopover, usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { ChatSignOutButton } from './components/chat-sign-out-button';

// ----------------------------------------------------------------------

export function ChatNavAccount() {
  const { user } = useAuthContext();

  const popover = usePopover();

  const [status, setStatus] = useState<'online' | 'alway' | 'busy' | 'offline'>('online');

  const handleChangeStatus = useCallback((event: SelectChangeEvent) => {
    setStatus(event.target.value as 'online' | 'alway' | 'busy' | 'offline');
  }, []);

  return (
    <>
      <Badge variant={status} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Avatar
          src={user?.avatar}
          alt={user?.displayName}
          onClick={popover.onOpen}
          sx={{ cursor: 'pointer', width: 48, height: 48 }}
        >
          {user?.displayName?.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: { sx: { p: 0 } },
          arrow: { placement: 'top-left' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2, pr: 1, pl: 2 }}>
          <ListItemText
            primary={user?.displayName}
            secondary={user?.email}
            secondaryTypographyProps={{ component: 'span' }}
          />

          <ChatSignOutButton size="medium"
            variant="text"
            onClose={popover.onClose}
            sx={{ display: 'block', textAlign: 'left' }} />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList sx={{ my: 0.5, px: 0.5 }}>
          <MenuItem>
            <Badge
              variant={status}
              sx={{
                [`& .${badgeClasses.badge}`]: {
                  m: 0.75,
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  position: 'static',
                },
              }}
            />

            <FormControl fullWidth>
              <Select
                native
                fullWidth
                value={status}
                onChange={handleChangeStatus}
                input={<InputBase />}
                inputProps={{ id: 'chat-status-select', sx: { textTransform: 'capitalize' } }}
                sx={{ [`& .${svgIconClasses.root}`]: { right: 0 } }}
              >
                {['online', 'alway', 'busy', 'offline'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>
          </MenuItem>

          <MenuItem>
            <Iconify icon="solar:user-id-bold" width={24} />
            Profile
          </MenuItem>

          <MenuItem>
            <Iconify icon="eva:settings-2-fill" width={24} />
            Settings
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
