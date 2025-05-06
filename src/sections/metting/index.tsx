import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { Popover, IconButton } from '@mui/material';
import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';

import { useAuthContext } from 'src/auth/hooks';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { isEmpty, isNil, size } from 'lodash';
import { useChat } from 'src/auth/context/chat';

export default function MeetingLink() {
  const { id = '' } = useParams();
  const searchParams = useSearchParams();

  const callType = searchParams.get('callType');

  const client = useStreamVideoClient();
  const { user } = useAuthContext();

  const call = useMemo<Call | null>(() => {
    if (!client || isNil(callType)) return null;
    return client.call(callType, id);
  }, [client, id]);

  useEffect(() => {
    if (!client || !user || !call) return;

    const joinCall = async () => {
      try {
        await call.join();
      } catch (error) {
        console.error('Error joining call:', error);
      }
    };

    joinCall();

    return () => {
      if (call) {
        call.leave();
      }
    };
  }, [client, user, call]);

  if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center">
        {isNil(callType) || (isEmpty(id) && <p>Đường link truy cập không đúng</p>)}
        <Iconify icon="line-md:loading-loop" className="mx-auto" />
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <MeetingUI conversationId={id} callType={callType} />
    </StreamCall>
  );
}

const MeetingUI = ({
  conversationId,
  callType,
}: {
  conversationId: string;
  callType: string | null;
}) => {
  const { user } = useAuthContext();
  const router = useRouter();
  const { endMeeting } = useChat();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const currentCall = useCall();

  const hasKicked = useRef(false);

  const { open, onClose, onOpen } = usePopover();
  const participantsButtonRef = useRef<HTMLButtonElement | null>(null);

  const removeMember = useCallback(
    async (user_id: string) => {
      await currentCall?.updateCallMembers({
        remove_members: [user_id],
      });
    },
    [currentCall]
  );

  useEffect(() => {
    if (!user || !currentCall || hasKicked.current) return;
    const duplicates = participants.filter((p) => p.userId === user.id);

    if (duplicates.length > 1) {
      hasKicked.current = true;
      toast.error('You are already in the meeting on another device.');
      currentCall.leave();
      removeMember(user.id);
    }
  }, [participants, user, currentCall, router]);

  return (
    <StreamTheme className="space-y-3">
      <SpeakerLayout />

      <div className="flex justify-center items-center gap-4">
        <CallControls
          onLeave={async () => {
            if (size(participants) === 1) {
              endMeeting({
                payload: { conversationId, callType: (callType || '') as any },
              });
            }

            await currentCall?.leave();

            if (size(participants) === 1) await currentCall?.delete();

            router.push('/dashboard');
          }}
        />

        <IconButton
          onClick={open ? onClose : onOpen}
          ref={participantsButtonRef}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }}
        >
          <Iconify icon="ic:round-group" width={24} color="#fff" />
        </IconButton>
      </div>

      <Popover
        id="participants-popover"
        open={open}
        anchorEl={participantsButtonRef.current}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        className="p-2"
      >
        <CallParticipantsList onClose={onClose} />
      </Popover>
    </StreamTheme>
  );
};

export { MeetingUI };
