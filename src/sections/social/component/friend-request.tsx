import type { IUserProfileFollower } from 'src/types/user';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { take } from 'lodash';

// ----------------------------------------------------------------------

type Props = {
  followers: IUserProfileFollower[];
};

export function FriendRequests({ followers }: Props) {
  const _mockFollowed = followers.slice(4, 8).map((i) => i.id);

  const [followed, setFollowed] = useState<string[]>(_mockFollowed);

  const handleClick = useCallback(
    (item: string) => {
      const selected = followed.includes(item)
        ? followed.filter((value) => value !== item)
        : [...followed, item];

      setFollowed(selected);
    },
    [followed]
  );

  return (
    <>
      <Typography variant="h6">
        Friend Requests
      </Typography>

      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)' }}
      >
        {(take(followers, 5)).map((follower) => (
          <FriendItem
            key={follower.id}
            follower={follower}
            selected={followed.includes(follower.id)}
            onSelected={() => handleClick(follower.id)}
          />
        ))}
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

type FollowerItemProps = {
  selected: boolean;
  onSelected: () => void;
  follower: IUserProfileFollower;
};

function FriendItem({ follower, selected, onSelected }: FollowerItemProps) {
  const { name, country, avatarUrl } = follower;

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: (theme) => theme.spacing(3, 2, 3, 3) }}>
      <Avatar alt={name} src={avatarUrl} sx={{ width: 48, height: 48, mr: 2 }} />

      <ListItemText
        primary={name}
        secondary={
          <>
            <Iconify icon="mingcute:location-fill" width={16} sx={{ flexShrink: 0, mr: 0.5 }} />
            {country}
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{
          mt: 0.5,
          noWrap: true,
          display: 'flex',
          component: 'span',
          alignItems: 'center',
          typography: 'caption',
          color: 'text.disabled',
        }}
      />

      <Button
        size="small"
        variant={selected ? 'text' : 'outlined'}
        color={selected ? 'success' : 'inherit'}
        startIcon={
          selected ? <Iconify width={18} icon="eva:checkmark-fill" sx={{ mr: -0.75 }} /> : null
        }
        onClick={onSelected}
        sx={{ flexShrink: 0, ml: 1.5 }}
      >
        {selected ? 'Accepted' : 'Accept'}
      </Button>
      <Button
        size="small"
        variant={selected ? 'text' : 'outlined'}
        color='error'
        startIcon={
          selected ? <Iconify width={18} icon="eva:checkmark-fill" sx={{ mr: -0.75 }} /> : null
        }
        sx={{ flexShrink: 0, ml: 1.5 }}
      >
        Delete
      </Button>
    </Card>
  );
}
