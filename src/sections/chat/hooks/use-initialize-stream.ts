import { StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { get, isNil } from 'lodash';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useChat } from 'src/auth/context/chat';
import { useAuthContext } from 'src/auth/hooks';

export default function useInitializeVideoClient(conversationId: string) {
  const { user, loading: userLoaded } = useAuthContext();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { streamToken } = useChat();

  useEffect(() => {
    console.log('Initializing video client...');

    if (userLoaded || isNil(user)) {
      toast.error('User not loaded or user is null');

      return;
    }

    const streamUser: User = {
      id: get(user, 'id'),
      name: get(user, 'name'),
      image: get(user, 'avatar'),
    };

    const apiKey = import.meta.env.VITE_STREAM_API_KEY;

    if (!apiKey) {
      throw new Error('Stream API key not set');
    }

    const client = new StreamVideoClient({
      apiKey,
      user: streamUser,
      tokenProvider: () => Promise.resolve(streamToken),
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [user, userLoaded]);

  return videoClient;
}
