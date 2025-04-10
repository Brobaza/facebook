import type { IChatMessage, IChatParticipant, IMention } from 'src/types/chat';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { find, get, head, isEmpty, isNil } from 'lodash';
import { useCallback, useState } from 'react';
import { useChat } from 'src/auth/context/chat';
import { useAuthContext } from 'src/auth/hooks';
import { CustomPopover, usePopover } from 'src/components/custom-popover';
import { v4 } from 'uuid';
import { ChatRoomParticipantDialog } from './chat-room-participant-dialog';
import EmojiPicker from './components/emoji-picker';
import MessageEmoji from './components/message-emoji';
import { useMessage } from './hooks/use-message';

// ----------------------------------------------------------------------

type Props = {
  message: IChatMessage;
  participants: IChatParticipant[];
  onOpenLightbox: (value: string) => void;
  setReplyMessage: (
    replyMessage: {
      id: string;
      body: string;
      senderName: string;
      isImage?: boolean;
    } | null
  ) => void;
  setDeleteMessage: (value: string) => void;
};

function getName(name: string | undefined): string | undefined {
  if (isNil(name)) {
    return undefined;
  }
  return name.split(' ')[0];
}

export function ChatMessageItem({
  message,
  participants,
  onOpenLightbox,
  setReplyMessage,
  setDeleteMessage,
}: Props) {
  const { user } = useAuthContext();
  const { sendEmoji, conversation } = useChat();
  const popover = usePopover();

  const [selected, setSelected] = useState<IChatParticipant | null>(null);

  const handleOpen = useCallback(
    (userId: string) => {
      const participant = find(conversation?.participants, { id: userId }) as IChatParticipant;

      setSelected(participant);
    },
    [conversation]
  );

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const { me, senderDetails, hasImage } = useMessage({
    message,
    participants,
    currentUserId: `${user?.id}`,
  });

  const { firstName, avatarUrl } = senderDetails;

  const { body, createdAt, mentions, previewUrl } = message;

  const renderInfo = (
    <Typography
      noWrap
      variant="caption"
      sx={{
        mb: !isEmpty(get(message, 'replyInfo.messageId', '')) ? 7 : 1,
        color: 'text.disabled',
        ...(!me && { mr: 'auto' }),
      }}
    >
      {!me && `${firstName}, `}

      {fToNow(createdAt)}
    </Typography>
  );

  const renderReply = message?.replyInfo && (
    <Box sx={{ mb: 1 }} className={`absolute -top-[60px] z-[-1] ${me ? 'right-0' : 'left-0'}`}>
      <Box sx={{ width: 200, mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#65676B', fontSize: 12 }} className="w-auto">
          <Iconify icon="basil:reply-outline" width={16} /> {me ? 'Bạn' : getName(firstName)} đã trả
          lời{' '}
          {message.replyInfo.senderName === (!isNil(user) && get(user, 'name', ''))
            ? me
              ? 'mình'
              : 'bạn'
            : getName(message.replyInfo.senderName)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          bgcolor: '#3f3f40',
          borderRadius: 1,
          padding: '6px 8px',
          maxWidth: 500,
          minWidth: 130,
        }}
        className="cursor-pointer"
      >
        <Typography
          variant="body2"
          sx={{
            color: '#65676B',
            fontStyle: message.replyInfo.isImage ? 'italic' : 'normal',
            fontSize: '13px',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            pb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
          className="line-clamp-1"
        >
          {message.replyInfo.isImage ? '[Hình ảnh]' : message.replyInfo.body}
        </Typography>
      </Box>
    </Box>
  );

  const renderBody = (
    <div className="relative">
      {!isEmpty(get(message, 'replyInfo.messageId', '')) && renderReply}

      <Stack
        sx={{
          p: 1.5,
          minWidth: 48,
          maxWidth: 320,
          overflow: 'hidden',
          typography: 'body2',
          bgcolor: 'background.neutral',
          ...(me &&
            !(!isEmpty(previewUrl) && !isNil(previewUrl)) && {
              color: 'grey.800',
              bgcolor: '#8024f4',
            }),
          ...((hasImage || (!isEmpty(previewUrl) && !isNil(previewUrl))) && {
            p: 0,
            bgcolor: 'transparent',
          }),
        }}
        className="rounded-xl z-10"
      >
        {hasImage ? (
          <Box
            component="img"
            alt="attachment"
            src={body}
            onClick={() => onOpenLightbox(body)}
            sx={{
              width: 400,
              height: 'auto',
              borderRadius: 1.5,
              cursor: 'pointer',
              objectFit: 'cover',
              aspectRatio: '16/11',
              '&:hover': { opacity: 0.9 },
            }}
          />
        ) : (
          <div
            className={
              !isEmpty(previewUrl) && !isNil(previewUrl)
                ? me
                  ? `p-1.5 bg-[#8024f4]`
                  : 'p-1.5 bg-[#383434]'
                : 'p-0'
            }
          >
            <Typography component="span">
              {(() => {
                const elements = [];
                let lastIndex = 0;

                const specialList = [...(mentions || []), ...(previewUrl || [])];

                specialList
                  ?.sort((a, b) => a.startIndex - b.startIndex)
                  ?.forEach((mention) => {
                    if (lastIndex < mention.startIndex) {
                      elements.push(
                        <Typography component="span" key={v4()} className="text-white">
                          {body.substring(lastIndex, mention.startIndex)}
                        </Typography>
                      );
                    }
                    if (!isNil(get(mention, 'url', null))) {
                      elements.push(
                        <Typography
                          component="span"
                          key={v4()}
                          sx={{
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'none' },
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            display: 'inline-block',
                            maxWidth: '100%',
                          }}
                          onClick={() => {
                            const preview = (mention as any)?.url;
                            if (preview) {
                              window.open(preview, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {(mention as any)?.url}
                        </Typography>
                      );
                    } else {
                      elements.push(
                        <Typography
                          component="span"
                          key={v4()}
                          sx={{ color: '#FFFFFF', fontWeight: 'bold' }}
                          className="cursor-pointer"
                          onClick={() => handleOpen((mention as IMention)?.userId)}
                        >
                          @{(mention as IMention)?.displayName}
                        </Typography>
                      );
                    }

                    lastIndex = mention.endIndex + 1;
                  });

                if (lastIndex < body.length) {
                  elements.push(
                    <div className="p-1.5">
                      <Typography
                        component="span"
                        key={v4()}
                        className="text-white"
                        sx={{
                          color: '#FFFFFF',
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          display: 'inline-block',
                          maxWidth: '100%',
                        }}
                      >
                        {body.substring(lastIndex)}
                      </Typography>
                    </div>
                  );
                }
                return elements;
              })()}
            </Typography>
          </div>
        )}
        {!isEmpty(previewUrl) &&
          !isNil(previewUrl) &&
          !isNil(head(previewUrl)?.thumbnailImage) &&
          get(message, 'contentType', 'text') !== 'image' && (
            <div
              className={
                head(previewUrl)?.title
                  ? 'bg-[#383434] pb-8 rounded-b-xl flex flex-col items-center'
                  : ''
              }
              onClick={() => {
                const preview = head(previewUrl)?.url;
                if (preview) {
                  window.open(preview, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <Box
                component="img"
                alt="attachment"
                src={head(previewUrl)?.thumbnailImage}
                sx={{
                  width: 400,
                  height: 'auto',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  aspectRatio: '16/11',
                  '&:hover': { opacity: 0.9 },
                }}
              />
              {head(previewUrl)?.title && (
                <p className="text-white cursor-pointer font-[700] text-[14px] w-[90%] mt-2">
                  {head(previewUrl)?.title}
                </p>
              )}
            </div>
          )}
      </Stack>
      <MessageEmoji message={message} />
    </div>
  );

  const renderActions = (
    <Stack
      direction="row"
      className="message-actions"
      sx={{
        pt: 0.5,
        left: 0,
        opacity: 0,
        top: '100%',
        position: 'absolute',
        transition: (theme) =>
          theme.transitions.create(['opacity'], { duration: theme.transitions.duration.shorter }),
        ...(me && { right: 0, left: 'unset' }),
      }}
    >
      <IconButton
        size="small"
        onClick={() =>
          setReplyMessage({
            id: message.id,
            body,
            senderName: senderDetails.firstName || (!isNil(user) && get(user, 'name', '')),
            isImage: hasImage,
          })
        }
      >
        <Iconify icon="solar:reply-bold" width={16} />
      </IconButton>

      <div>
        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:smiling-face-fill" />
        </IconButton>
        <CustomPopover
          open={popover.open}
          anchorEl={popover.anchorEl}
          onClose={popover.onClose}
          slotProps={{
            paper: { sx: { p: 0 } },
            arrow: { placement: 'top-center' },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2, pr: 1, pl: 2 }}>
            <EmojiPicker
              onSelect={(emoji) => {
                if (!isEmpty(emoji)) {
                  sendEmoji({
                    payload: {
                      emoji: emoji as string,
                      messageId: message.id,
                    },
                    onSuccess: popover.onClose,
                  });
                }
              }}
            />
          </Stack>
        </CustomPopover>
      </div>

      {me && (
        <IconButton size="small" onClick={() => setDeleteMessage(message.id)}>
          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Stack direction="row" justifyContent={me ? 'flex-end' : 'unset'} sx={{ mb: 5 }}>
      {!me && <Avatar alt={firstName} src={avatarUrl} sx={{ width: 32, height: 32, mr: 2 }} />}

      <Stack alignItems={me ? 'flex-end' : 'flex-start'}>
        {renderInfo}

        <Stack
          direction="row"
          alignItems="center"
          sx={{ position: 'relative', '&:hover': { '& .message-actions': { opacity: 1 } } }}
        >
          {renderBody}
          {renderActions}
        </Stack>
      </Stack>

      {selected && (
        <ChatRoomParticipantDialog participant={selected} open={!!selected} onClose={handleClose} />
      )}
    </Stack>
  );
}
