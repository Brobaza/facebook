import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useTheme } from '@mui/material'

type Emoji = {
  native: string
}

const EmojiPicker = ({ onSelect }: { onSelect: (value: any) => void }) => {
  const theme = useTheme();

  return (
    <Picker
      autoFocus
      data={data}
      theme={theme}
      showPreview={false}
      showSkinTones={false}
      onEmojiSelect={(emoji?: Emoji) => {
        if (!emoji?.native) return

        onSelect(emoji.native)
      }}
    />
  )
}

export default EmojiPicker
