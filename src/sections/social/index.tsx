import {
  Box,
  Button,
  Card,
  Fab,
  Grid,
  IconButton,
  InputBase,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { groupBy, map, take } from 'lodash';
import { useCallback, useMemo, useRef } from 'react';
import { _userFeeds, _userFollowers, _userGallery } from 'src/_mock';
import { useGetPostsDemo } from 'src/actions/blog';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';
import { fDate } from 'src/utils/format-time';
import { v4 } from 'uuid';
import { PostItemSkeleton } from '../blog/post-skeleton';
import { ProfilePostItem } from '../user/profile-post-item';
import { ContractItemHorizontal } from './component/contract-item-horizontal';
import { FriendItem } from './component/friend-item';
import { FriendRequests } from './component/friend-request';
import { _facebook_menu } from './constants';
import { mockConversations } from './hooks/useConversation';
import { useRouter } from 'src/routes/hooks';

export function MediaHome() {
  const theme = useTheme();
  const router = useRouter();

  const { posts, postsLoading } = useGetPostsDemo();

  const fileRef = useRef<HTMLInputElement>(null);

  const handleAttach = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const renderLoading = <PostItemSkeleton variant="horizontal" />;

  const renderList = useMemo(() => {
    return take(posts, 2).map((post) => <ContractItemHorizontal key={post.id} post={post} />);
  }, [posts]);

  const renderPostInput = (
    <Card sx={{ p: 3 }}>
      <InputBase
        multiline
        fullWidth
        rows={1}
        placeholder="Share what you are thinking here..."
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 1,
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Fab size="small" color="inherit" variant="softExtended" onClick={handleAttach}>
            <Iconify icon="solar:gallery-wide-bold" width={24} sx={{ color: 'success.main' }} />
            Image/Video
          </Fab>

          <Fab size="small" color="inherit" variant="softExtended">
            <Iconify icon="solar:videocamera-record-bold" width={24} sx={{ color: 'error.main' }} />
            Streaming
          </Fab>
        </Stack>

        <Button variant="contained">Post</Button>
      </Stack>

      <input ref={fileRef} type="file" style={{ display: 'none' }} />
    </Card>
  );

  const groupConversation = groupBy(mockConversations.conversations, 'type');

  const handleClickItem = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  return (
    <DashboardLayout>
      <DashboardContent maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                position: 'sticky',
                top: 80,
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <Stack spacing={2}>
                <Card
                  sx={{
                    py: 3,
                    px: 2.5,
                    borderTop: `dashed 1px ${theme.vars.palette.divider}`,
                    borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
                  }}
                >
                  {_facebook_menu.map((option) => {
                    return (
                      <MenuItem
                        onClick={() => handleClickItem(option.href)}
                        key={option.label}
                        sx={{
                          py: 1,
                          color: 'text.secondary',
                          '& svg': { width: 24, height: 24 },
                          '&:hover': { color: 'text.primary' },
                        }}
                      >
                        {option.icon}

                        <Box component="span" sx={{ ml: 2 }}>
                          {option.label}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Card>

                <Typography variant="h6">Group lists</Typography>
                {map(take(groupConversation['GROUP'], 10), (conversation) => {
                  return <FriendItem conversation={conversation as any} key={v4()} />;
                })}
                <Typography variant="h6">Friend lists</Typography>
                {map(take(groupConversation['ONE_TO_ONE'], 10), (conversation) => {
                  return <FriendItem conversation={conversation as any} key={v4()} />;
                })}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {renderPostInput}

              <Box
                gap={1}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(5, 1fr)',
                }}
              >
                {take(_userGallery, 5).map((image) => (
                  <Card key={image.id} sx={{ cursor: 'pointer', color: 'common.white' }}>
                    <IconButton
                      color="inherit"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 9,
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>

                    <ListItemText
                      sx={{
                        p: 3,
                        left: 0,
                        width: 1,
                        bottom: 0,
                        zIndex: 9,
                        position: 'absolute',
                      }}
                      primary={image.title}
                      secondary={fDate(image.postedAt)}
                      primaryTypographyProps={{ noWrap: true, typography: 'subtitle1' }}
                      secondaryTypographyProps={{
                        mt: 0.5,
                        color: 'inherit',
                        component: 'span',
                        typography: 'body2',
                        sx: { opacity: 0.48 },
                      }}
                    />

                    <Image
                      alt="gallery"
                      ratio="1/2"
                      src={image.imageUrl}
                      // onClick={() => lightbox.onOpen(image.imageUrl)}
                      slotProps={{
                        overlay: {
                          background: `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.grey['900Channel'], 0)} 0%, ${theme.vars.palette.grey[900]} 75%)`,
                        },
                      }}
                    />
                  </Card>
                ))}
              </Box>

              {_userFeeds.map((post) => (
                <ProfilePostItem key={post.id} post={post} />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              sx={{
                position: 'sticky',
                top: 80,
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">Contributor by</Typography>
                <Box
                  gap={3}
                  display="grid"
                  gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' }}
                >
                  {postsLoading ? renderLoading : renderList}
                </Box>

                <FriendRequests followers={_userFollowers} />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </DashboardContent>
    </DashboardLayout>
  );
}
