import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import chatService from 'src/package/services/chat.service';

interface AuthMeetingProviderProps {
  children: React.ReactNode;
}

export default function AuthMeetingProvider({ children }: AuthMeetingProviderProps) {
  const { id = '' } = useParams();
  const [isAllowedToJoin, setIsAllowedToJoin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      const { isAllowed } = await chatService.getPermissionInMeeting({
        conversationId: id,
      });

      setIsAllowedToJoin(isAllowed);
    };

    checkPermission();
  }, [id]);

  if (isAllowedToJoin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Checking permission...</p>
      </div>
    );
  }

  if (!isAllowedToJoin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You don't have permission to join this meeting.</p>
      </div>
    );
  }

  return <div className="h-screen w-full relative overflow-hidden">{children}</div>;
}
