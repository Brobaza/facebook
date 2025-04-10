import type { IUrl } from 'src/types/chat';

import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';


import { Box } from '@mui/material';
import { isNil, reverse } from 'lodash';
import { v4 } from 'uuid';
import { CollapseButton } from './styles';

// ----------------------------------------------------------------------

type Props = {
  urls: {
    total: number;
    links: IUrl[];
  };
};

export function ChatRoomLinks({ urls: urlList }: Props) {
  const collapse = useBoolean(true);

  const totalUrls = urlList.total;
  const urls = reverse(urlList.links);

  const renderList = !isNil(urls) && urls.map((url, index) => (
    <Stack key={v4()} spacing={1.5} direction="row" alignItems="center" onClick={() => {
      const preview = url?.url;
      if (preview) {
        window.open(preview, '_blank', 'noopener,noreferrer');
      }
    }}>
      <Box
        component="img"
        alt="attachment"
        src={url?.thumbnailImage}
        sx={{
          width: 40,
          height: 40,
          cursor: 'pointer',
          objectFit: 'cover',
          aspectRatio: '16/11',
          '&:hover': { opacity: 0.9 },
          bgcolor: 'background.neutral'
        }}
      />

      <ListItemText
        className='cursor-pointer'
        primary={url?.title}
        secondary={url?.description}
        primaryTypographyProps={{ noWrap: true, typography: 'body2' }}
        secondaryTypographyProps={{
          mt: 0.25,
          noWrap: true,
          component: 'span',
          typography: 'caption',
          color: 'text.disabled',
        }}
      />
    </Stack>
  ));

  return (
    <>
      <CollapseButton
        selected={collapse.value}
        disabled={!totalUrls}
        onClick={collapse.onToggle}
      >
        {`Urls (${totalUrls})`}
      </CollapseButton>

      {!!totalUrls && (
        <Collapse in={collapse.value}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {renderList}
          </Stack>
        </Collapse>
      )}
    </>
  );
}
