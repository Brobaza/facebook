import { StreamVideo } from '@stream-io/video-react-sdk';
import { Iconify } from 'src/components/iconify';
import useInitializeVideoClient from '../hooks/use-initialize-stream';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  const videoClient = useInitializeVideoClient('ok');

  if (!videoClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Iconify icon="line-md:loading-loop" className="mx-auto" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
