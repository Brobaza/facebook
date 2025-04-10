import { StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { get, isNil } from 'lodash';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from 'src/auth/hooks';
import chatService from 'src/package/services/chat.service';

export default function useInitializeVideoClient(conversationId: string) {
  const { user, loading: userLoaded } = useAuthContext();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

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
      tokenProvider: async () => {
        const { token } = await chatService.getStreamToken({ conversationId });
        return token;
      },
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [user, userLoaded]);

  return videoClient;
}
