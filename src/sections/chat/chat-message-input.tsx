import type { IChatParticipant } from 'src/types/chat';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fSub, today } from 'src/utils/format-time';
import { uuidv4 } from 'src/utils/uuidv4';

import { createConversation } from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';

import { filter, get, map, size } from 'lodash';
import { toast } from 'sonner';
import { useChat } from 'src/auth/context/chat';
import { useAuthContext } from 'src/auth/hooks';
import { CustomPopover, usePopover } from 'src/components/custom-popover';
import EmojiPicker from './components/emoji-picker';

import { MentionData, MentionsTextField } from '@jackstenglein/mui-mentions';
// ----------------------------------------------------------------------

type Props = {
  disabled: boolean;
  recipients: IChatParticipant[];
  selectedConversationId: string;
  onAddRecipients: (recipients: IChatParticipant[]) => void;
  replyMessage?: {
    id: string;
    body: string;
    senderName: string;
    isImage?: boolean;
  } | null;
  setReplyMessage: (
    replyMessage: {
      id: string;
      body: string;
      senderName: string;
      isImage?: boolean;
    } | null
  ) => void;
};

export function ChatMessageInput({
  disabled,
  recipients,
  onAddRecipients,
  selectedConversationId,
  replyMessage,
  setReplyMessage,
}: Props) {
  const popover = usePopover();
  const { sendMessage, sendImage, conversation } = useChat();

  const router = useRouter();

  const { user } = useAuthContext();

  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');

  const myContact = useMemo(
    () => ({
      id: `${user?.id}`,
      role: `${user?.role}`,
      email: `${user?.email}`,
      address: `${user?.address}`,
      name: `${user?.displayName}`,
      lastActivity: today(),
      avatarUrl: `${user?.photoURL}`,
      phoneNumber: `${user?.phoneNumber}`,
      status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
    }),
    [user]
  );

  useEffect(() => {
    setMessage('');
  }, [selectedConversationId]);

  const messageData = useMemo(
    () => ({
      id: uuidv4(),
      attachments: [],
      body: message,
      contentType: 'text',
      createdAt: fSub({ minutes: 1 }),
      senderId: myContact.id,
    }),
    [message, myContact.id]
  );

  const conversationData = useMemo(
    () => ({
      id: uuidv4(),
      messages: [messageData],
      participants: [...recipients, myContact],
      type: recipients.length > 1 ? 'GROUP' : 'ONE_TO_ONE',
      unreadCount: 0,
    }),
    [messageData, myContact, recipients]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedConversationId) {
      toast.error('Please select a conversation first');
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const file: File = e.target.files[0];
      sendImage({
        payload: {
          conversationId: selectedConversationId,
          file,
        },
        onSuccess: () => {
          e.target.value = '';
        },
      });
    }
  };

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const mentionDropdown = document.querySelector('.base-Popper-root');

        if (mentionDropdown) {
          return;
        }

        setReplyMessage(null);

        if (message) {
          if (selectedConversationId) {
            sendMessage({
              payload: {
                conversationId: selectedConversationId,
                content: message,
                replyInfo: {
                  id: get(replyMessage, 'id', ''),
                  body: get(replyMessage, 'body', ''),
                  senderName: get(replyMessage, 'senderName', ''),
                  isImage: get(replyMessage, 'isImage', false),
                },
              },
              onSuccess: () => {
                setMessage('');
              },
            });
          } else {
            const ids = map(
              filter(
                get(conversationData, 'participants', []),
                (participant) => participant.id !== user?.id
              ),
              'id'
            );

            const res = await createConversation({
              message,
              targetIds: ids,
            } as any);

            router.push(`${paths.dashboard.chat}?id=${res.conversation.id}`);

            onAddRecipients([]);
            setMessage('');
          }
        }
      }
    },
    [conversationData, message, messageData, onAddRecipients, router, selectedConversationId, user]
  );

  return (
    <>
      {replyMessage && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: 'action.hover',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          <Stack spacing={0.5}>
            <strong>{replyMessage.senderName}</strong>
            <div style={{ fontSize: 13, color: '#666' }}>
              {get(replyMessage, 'isImage', false) ? 'Hình ảnh' : replyMessage.body}
            </div>
          </Stack>

          <IconButton size="small" onClick={() => setReplyMessage(null)}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      )}
      <MentionsTextField
        autoComplete="off"
        dataSources={[
          {
            data:
              size(conversation?.participants) <= 2
                ? []
                : map(
                    filter(
                      conversation?.participants,
                      (participant) => participant.id !== user?.id
                    ),
                    (participant) => {
                      return {
                        id: participant.id,
                        display: participant.name,
                        avatarUrl: participant.avatarUrl,
                      };
                    }
                  ),
          },
        ]}
        name="chat-message"
        id="chat-message-input"
        value={message}
        onKeyUp={handleSendMessage}
        onChange={(newValue: string, newPlainText: string, mentions: MentionData[]) => {
          setMessage(newValue);
        }}
        placeholder="Type a message"
        disabled={disabled}
        InputProps={{
          startAdornment: (
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
                  arrow: { placement: 'bottom-left' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2, pr: 1, pl: 2 }}>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      setMessage((prev) => prev + emoji);
                    }}
                  />
                </Stack>
              </CustomPopover>
            </div>
          ),
          endAdornment: (
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <IconButton onClick={handleAttach}>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>
              <IconButton onClick={handleAttach}>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
              <IconButton>
                <Iconify icon="solar:microphone-bold" />
              </IconButton>
            </Stack>
          ),
        }}
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
        highlightColor="primary.light"
        className="chat-message-input"
      />

      <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFileChange} />
    </>
  );
}
