import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useChat } from 'src/auth/context/chat';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

type Props = {
  open: boolean;
  onClose: () => void;
  messageId: string;
};

export function DeleteMessageDialog({ open, onClose, messageId }: Props) {
  const { deleteMessage } = useChat();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <DialogContent sx={{ py: 5, px: 3, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Xóa tin nhắn</Typography>
          <Typography variant="body2">Bạn có chắc muốn xóa tin nhắn này không?</Typography>
        </Stack>

        <Stack spacing={1} direction="row" className="justify-end" sx={{ pt: 1.5 }}>
          <IconButton
            size="small"
            color="info"
            sx={{
              borderRadius: 1,
              bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.08),
              '&:hover': {
                bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.16),
              },
            }}
            onClick={onClose}
          >
            <Iconify width={18} icon="material-symbols:cancel-schedule-send-outline-rounded" />
            <Typography variant="caption" sx={{ ml: 1 }}>
              Hủy bỏ
            </Typography>
          </IconButton>
          <IconButton
            size="small"
            color="error"
            sx={{
              borderRadius: 1,
              bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
              '&:hover': {
                bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
              },
            }}
            onClick={() => {
              deleteMessage({ payload: { messageId }, onSuccess: onClose });
            }}
          >
            <Iconify width={18} icon="lsicon:delete-filled" />
            <Typography variant="caption" sx={{ ml: 1 }}>
              Xóa
            </Typography>
          </IconButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
