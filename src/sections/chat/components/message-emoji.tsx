import { get, groupBy, head, keys, map, size, sortBy, take } from "lodash";
import { useMemo } from "react";
import { IChatMessage } from "src/types/chat";

export default function MessageEmoji({ message }: { message: IChatMessage }) {
  const emojiList = useMemo(() => {
    const emojis = get(message, 'emojis', []);

    return {
      items: sortBy(map(keys(groupBy(emojis, 'emoji')), (emoji) => ({
        emoji,
        count: size(groupBy(emojis, 'emoji')[emoji]),
      })), [(o) => o.count]),
      total: size(emojis),
    };
  }, [message]);

  if (size(emojiList.items) === 0)
    return null;

  if (size(emojiList.items) === 1) {
    return <div className='absolute right-0 flex gap-0 bottom-[-8px] cursor-pointer'>
      <div className={
        `bg-[#004B50] size-4 rounded-full text-center text-[12px] flex justify-center items-center relative`}
      >
        <p className='p-0 m-0'>{head(emojiList.items)?.emoji}</p>
      </div>
    </div>
  }

  if (size(emojiList.items) === 2) {
    return <div className='absolute right-0 flex gap-0 bottom-[-8px] cursor-pointer'>
      <div className={
        `bg-[#004B50] size-4 rounded-full text-center text-[12px] flex justify-center items-center relative -right-[6px]`}
      >
        <p className='p-0 m-0'>{head(emojiList.items)?.emoji}</p>
      </div>
      <div className={
        `bg-[#004B50] size-4 rounded-full text-center text-[12px] flex justify-center items-center relative`}
      >
        <p className='p-0 m-0'>{emojiList.items[1]?.emoji}</p>
      </div>
    </div>
  }

  return <div className='absolute right-0 flex gap-0 bottom-[-8px] cursor-pointer'>
    {map(take(emojiList.items, 3), ({ emoji }, index) => {
      return <div className={
        `bg-[#004B50] size-4 rounded-full text-center text-[12px] flex justify-center items-center relative -right-${3 - index}`}
        key={index}>
        <p className='p-0 m-0'>{emoji}</p>
      </div>
    })}
    <div className={
      `bg-[#004B50] size-4 rounded-full text-center text-[7.5px] flex justify-center items-center relative`}>
      <p className='p-0 m-0'>+{emojiList.total}</p>
    </div>
  </div>
}
