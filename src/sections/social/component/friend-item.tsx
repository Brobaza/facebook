import type { IChatConversation } from 'src/types/chat';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { useMockedUser } from 'src/auth/hooks';
import { useNavItem } from 'src/sections/chat/hooks/use-nav-item';
import { Card } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  conversation: IChatConversation;
};

export function FriendItem({ conversation }: Props) {
  const { user } = useMockedUser();

  const { group, displayName, displayText, participants, lastActivity, hasOnlineInGroup } =
    useNavItem({ conversation, currentUserId: `${user?.id}` });

  const singleParticipant = participants[0];

  const { name, avatarUrl, status } = singleParticipant;

  const renderGroup = (
    <Badge
      variant={hasOnlineInGroup ? 'online' : 'invisible'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <AvatarGroup variant="compact" sx={{ width: 48, height: 48 }}>
        {participants.slice(0, 2).map((participant) => (
          <Avatar key={participant.id} alt={participant.name} src={participant.avatarUrl} />
        ))}
      </AvatarGroup>
    </Badge>
  );

  const renderSingle = (
    <Badge key={status} variant={status} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Avatar alt={name} src={avatarUrl} sx={{ width: 48, height: 48 }} />
    </Badge>
  );

  return (
    <Card sx={{ display: 'flex' }}>
      <ListItemButton
        sx={{
          py: 1.5,
          px: 2.5,
          gap: 2,
        }}
      >
        <Badge color="error" overlap="circular" badgeContent={0}>
          {group ? renderGroup : renderSingle}
        </Badge>

        <ListItemText
          primary={displayName}
          primaryTypographyProps={{ noWrap: true, component: 'span', variant: 'subtitle2' }}
          secondary={displayText}
          secondaryTypographyProps={{
            noWrap: true,
            component: 'span',
            variant: conversation.unreadCount ? 'subtitle2' : 'body2',
            color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
          }}
        />

        <Stack alignItems="flex-end" sx={{ alignSelf: 'stretch' }}>
          <Typography
            noWrap
            variant="body2"
            component="span"
            sx={{ mb: 1.5, fontSize: 12, color: 'text.disabled' }}
          >
            {fToNow(lastActivity)}
          </Typography>

          {!!conversation.unreadCount && (
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: 'info.main',
                borderRadius: '50%',
              }}
            />
          )}
        </Stack>
      </ListItemButton>
    </Card>
  );
}
