import type { IPostItem } from 'src/types/blog';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { fShortenNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { maxLine } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

// ----------------------------------------------------------------------

type Props = {
  post: IPostItem;
};

export function ContractItemHorizontal({ post }: Props) {
  const theme = useTheme();

  const {
    title,
    author,
    coverUrl,
    createdAt,
    totalViews,
    totalShares,
    description,
  } = post;

  return (
    <>
      <Card sx={{ display: 'flex' }}>
        <Box
          sx={{
            p: 1,
            width: 180,
            height: 200,
            flexShrink: 0,
            position: 'relative',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Avatar
            alt={author.name}
            src={author.avatarUrl}
            sx={{ top: 16, right: 16, zIndex: 9, position: 'absolute' }}
          />
          <Image alt={title} src={coverUrl} sx={{ height: 1, borderRadius: 1.5 }} />
        </Box>
        <Stack spacing={1} sx={{ p: theme.spacing(3, 3, 2, 3) }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {fDate(createdAt)}
            </Box>
          </Box>

          <Stack spacing={1} flexGrow={1}>
            <Link
              component={RouterLink}
              href={paths.dashboard.post.details(title)}
              color="inherit"
              variant="subtitle2"
              sx={{ ...maxLine({ line: 2 }) }}
            >
              {title}
            </Link>

            <Typography variant="body2" sx={{ ...maxLine({ line: 2 }), color: 'text.secondary' }}>
              {description}
            </Typography>
          </Stack>

          <Box display="flex" alignItems="center">
            <Box
              gap={1.5}
              flexGrow={1}
              display="flex"
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{ typography: 'caption', color: 'text.disabled' }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Iconify icon="solar:eye-bold" width={16} />
                {fShortenNumber(totalViews)}
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                <Iconify icon="solar:share-bold" width={16} />
                {fShortenNumber(totalShares)}
              </Box>
            </Box>
          </Box>
        </Stack>
      </Card>
    </>
  );
}
