/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IChatParticipant } from 'src/types/chat';

import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { EmptyContent } from 'src/components/empty-content';

import { useAuthContext } from 'src/auth/hooks';

import { useChat } from 'src/auth/context/chat';
import { keyBy } from 'src/utils/helper';
import { ChatHeaderCompose } from '../chat-header-compose';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatMessageInput } from '../chat-message-input';
import { ChatMessageList } from '../chat-message-list';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { useCollapseNav } from '../hooks/use-collapse-nav';
import { Layout } from '../layout';

// ----------------------------------------------------------------------

export function ChatView() {
  const router = useRouter();

  const { user } = useAuthContext();

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const [recipients, setRecipients] = useState<IChatParticipant[]>([]);

  const [replyMessage, setReplyMessage] = useState<{
    id: string;
    body: string;
    senderName: string;
    isImage?: boolean;
  } | null>(null);

  const {
    conversations: conversationList,
    conversationsLoading,
    conversation,
    error: conversationError,
    loadingConversation: conversationLoading,
    contacts,
  } = useChat();
  const { items } = conversationList;
  const conversations = {
    byId: keyBy(items, 'id'),
    allIds: Object.keys(keyBy(items, 'id')),
  };

  const roomNav = useCollapseNav();

  const conversationsNav = useCollapseNav();

  const participants: IChatParticipant[] = conversation
    ? conversation.participants.filter(
        (participant: IChatParticipant) => participant.id !== `${user?.id}`
      )
    : [];

  useEffect(() => {
    if (conversationError || !selectedConversationId) {
      router.push(paths.dashboard.chat);
    }
  }, [conversationError, router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected: IChatParticipant[]) => {
    setRecipients(selected);
  }, []);

  return (
    <Layout
      sx={{
        minHeight: 0,
        flex: '1 1 0',
        position: 'relative',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.customShadows.card,
      }}
      slots={{
        header: selectedConversationId ? (
          <ChatHeaderDetail
            collapseNav={roomNav}
            participants={participants}
            loading={conversationLoading}
          />
        ) : (
          <ChatHeaderCompose
            contacts={contacts.items as IChatParticipant[]}
            onAddRecipients={handleAddRecipients}
          />
        ),
        nav: (
          <ChatNav
            contacts={contacts.items as IChatParticipant[]}
            conversations={conversations}
            loading={conversationsLoading}
            selectedConversationId={selectedConversationId}
            collapseNav={conversationsNav}
            setReplyMessage={setReplyMessage}
          />
        ),
        main: (
          <>
            {selectedConversationId ? (
              <ChatMessageList
                messages={conversation?.messages ?? []}
                participants={participants}
                loading={conversationLoading}
                setReplyMessage={setReplyMessage}
              />
            ) : (
              <EmptyContent
                imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                title="Good morning!"
                description="Write something awesome..."
              />
            )}

            <ChatMessageInput
              recipients={recipients}
              onAddRecipients={handleAddRecipients}
              selectedConversationId={selectedConversationId}
              disabled={!recipients.length && !selectedConversationId}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
            />
          </>
        ),
        details: selectedConversationId && (
          <ChatRoom
            collapseNav={roomNav}
            participants={participants}
            loading={conversationLoading}
            messages={conversation?.messages ?? []}
          />
        ),
      }}
    />
    // </DashboardContent>
  );
}
