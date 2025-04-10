import type { IChatMessage, IChatParticipant } from 'src/types/chat';

import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';

import { Lightbox, useLightBox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';
import { v4 } from 'uuid';
import { usePopover } from 'src/components/custom-popover';
import { DeleteMessageDialog } from './components/delete-message.model';
import { isEmpty } from 'lodash';
import { useCallback, useState } from 'react';

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  messages: IChatMessage[];
  participants: IChatParticipant[];
  setReplyMessage: (
    replyMessage: {
      id: string;
      body: string;
      senderName: string;
      isImage?: boolean;
    } | null
  ) => void;
};

export function ChatMessageList({ messages = [], participants, loading, setReplyMessage }: Props) {
  const { messagesEndRef } = useMessagesScroll(messages);

  const [deleteMessage, setDeleteMessage] = useState<string>('');

  const onClose = useCallback(() => {
    setDeleteMessage('');
  }, []);

  const setDeleteMessageId = useCallback((messageId: string) => {
    setDeleteMessage(messageId);
  }, []);

  const slides = messages
    .filter((message) => message.contentType === 'image')
    .map((message) => ({ src: message.body }));

  const lightbox = useLightBox(slides);

  if (loading) {
    return (
      <Stack sx={{ flex: '1 1 auto', position: 'relative' }}>
        <LinearProgress
          color="inherit"
          sx={{
            top: 0,
            left: 0,
            width: 1,
            height: 2,
            borderRadius: 0,
            position: 'absolute',
          }}
        />
      </Stack>
    );
  }

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        {messages.map((message) => (
          <ChatMessageItem
            setDeleteMessage={setDeleteMessageId}
            setReplyMessage={setReplyMessage}
            key={v4()}
            message={message}
            participants={participants}
            onOpenLightbox={() => lightbox.onOpen(message.body)}
          />
        ))}
      </Scrollbar>
      <Lightbox
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        index={lightbox.selected}
      />
      {!isEmpty(deleteMessage) && (
        <DeleteMessageDialog
          open={!isEmpty(deleteMessage)}
          onClose={onClose}
          messageId={deleteMessage}
        />
      )}
    </>
  );
}
