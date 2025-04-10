import type { IChatParticipant } from 'src/types/chat';

import { useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';

import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { CustomPopover, usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

import { ChatHeaderSkeleton } from './chat-skeleton';

import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { isNil } from 'lodash';
import { toast } from 'sonner';
import { useChat } from 'src/auth/context/chat';
import { useAuthContext } from 'src/auth/hooks';
import type { UseNavCollapseReturn } from './hooks/use-collapse-nav';

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  participants: IChatParticipant[];
  collapseNav: UseNavCollapseReturn;
};

export function ChatHeaderDetail({ collapseNav, participants, loading }: Props) {
  const popover = usePopover();

  const { conversation } = useChat();

  const client = useStreamVideoClient();
  const { user } = useAuthContext();

  const createMeeting = useCallback(async () => {
    if (!client) {
      toast.error('Client not found');
      return;
    }

    if (isNil(conversation)) {
      toast.error('Conversation not found');
      return;
    }

    if (isNil(user)) {
      toast.error('User not found');
      return;
    }

    try {
      const id = conversation.id;

      const call = client.call('default', id);

      await call.getOrCreate({
        data: {
          custom: { description: `Meeting created by user ${user.id}` },
        },
      });

      window?.open(`${import.meta.env.VITE_BASE_DOMAIN_FE}/dashboard/meeting/${call.id}`, '_blank');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again later.');
    }
  }, [client, conversation, user]);

  const lgUp = useResponsive('up', 'lg');

  const group = participants.length > 1;

  const singleParticipant = participants[0];

  const { collapseDesktop, onCollapseDesktop, onOpenMobile } = collapseNav;

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgUp]);

  const renderGroup = (
    <AvatarGroup max={3} sx={{ [`& .${avatarGroupClasses.avatar}`]: { width: 32, height: 32 } }}>
      {participants.map((participant) => (
        <Avatar key={participant.id} alt={participant.name} src={participant.avatar} />
      ))}
    </AvatarGroup>
  );

  const renderSingle = (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Badge
        variant={singleParticipant?.status}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar src={singleParticipant?.avatar} alt={singleParticipant?.name} />
      </Badge>

      <ListItemText
        primary={singleParticipant?.name}
        secondary={
          singleParticipant?.status === 'offline'
            ? fToNow(singleParticipant?.lastActivity)
            : singleParticipant?.status
        }
        secondaryTypographyProps={{
          component: 'span',
          ...(singleParticipant?.status !== 'offline' && { textTransform: 'capitalize' }),
        }}
      />
    </Stack>
  );

  if (loading) {
    return <ChatHeaderSkeleton />;
  }

  return (
    <>
      {group ? renderGroup : renderSingle}

      <Stack direction="row" flexGrow={1} justifyContent="flex-end">
        <IconButton onClick={createMeeting}>
          <Iconify icon="solar:phone-bold" />
        </IconButton>

        <IconButton onClick={createMeeting}>
          <Iconify icon="solar:videocamera-record-bold" />
        </IconButton>

        <IconButton onClick={handleToggleNav}>
          <Iconify icon={!collapseDesktop ? 'ri:sidebar-unfold-fill' : 'ri:sidebar-fold-fill'} />
        </IconButton>

        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:bell-off-bold" />
            Hide notifications
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:forbidden-circle-bold" />
            Block
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:danger-triangle-bold" />
            Report
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
