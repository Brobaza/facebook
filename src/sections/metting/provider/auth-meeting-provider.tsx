import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useChat } from 'src/auth/context/chat';

interface AuthMeetingProviderProps {
  children: React.ReactNode;
}

export default function AuthMeetingProvider({ children }: AuthMeetingProviderProps) {
  const { id = '' } = useParams();
  const { checkMeetingPermission } = useChat();

  const isAllowedToJoin = useMemo(() => {
    const isAllowed = checkMeetingPermission({ payload: { conversationId: id } });

    return isAllowed;
  }, [id]);

  // if (!isAllowedToJoin) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <p>You don't have permission to join this meeting.</p>
  //     </div>
  //   );
  // }

  return <div className="flex h-screen items-center justify-center">{children}</div>;
}
