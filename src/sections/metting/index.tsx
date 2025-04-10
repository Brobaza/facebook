import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { get, includes, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuthContext } from 'src/auth/hooks';
import { Iconify } from 'src/components/iconify';

export default function MeetingLink() {
  const { id = '' } = useParams();

  const [call, setCall] = useState<Call>();

  const client = useStreamVideoClient();
  const { user } = useAuthContext();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  useEffect(() => {
    console.log('participants', participants);
  }, [participants]);

  useEffect(() => {
    (async () => {
      if (!client) {
        return;
      }

      if (!user) {
        toast.error('User not found');
        return;
      }

      const call = client.call('default', id);

      console.log('call members', call.state.members);

      if (
        includes(
          map(get(call, 'state.members', []), (mem) => mem.user_id),
          user.id
        )
      ) {
        toast.error('You are already in the meeting');

        return;
      }

      await call.join();
      setCall(call);
    })();
  }, [client, user]);

  if (!client) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Iconify icon="line-md:loading-loop" className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="block h-screen w-full bg-white">
      <StreamCall call={call}>
        <StreamTheme className="space-y-3">
          <SpeakerLayout />
          <CallControls />
        </StreamTheme>
      </StreamCall>
    </div>
  );
}
