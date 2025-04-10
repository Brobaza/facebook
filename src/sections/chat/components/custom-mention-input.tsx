// import { styled } from "@mui/material/styles";
// import Mentions from "rc-mentions";

// const StyledMentionsInput = styled(Mentions)`
//   width: 100%;
//   .rc-mentions {
//     width: 100%;
//     border: none;
//     outline: none;
//     padding: 10px;
//     font-size: 16px;
//   }
// `;

// const { Option } = Mentions;

// interface CustomMentionInputProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   disabled?: boolean;
//   options: { id: string; name: string }[];
// }

// const CustomMentionInput = ({
//   value,
//   onChange,
//   placeholder,
//   disabled,
//   options,
// }: CustomMentionInputProps) => {
//   return (
//     <StyledMentionsInput
//       value={value}
//       onChange={(e: any) => onChange(e)}
//       disabled={disabled}
//       placeholder={placeholder}
//     >
//       {options.map((option) => (
//         <Option key={option.id} value={option.name}>
//           {option.name}
//         </Option>
//       ))}
//     </StyledMentionsInput>
//   );
// };

// export default CustomMentionInput;
