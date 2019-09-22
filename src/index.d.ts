import * as React from "react";
import { TextInputProps } from "react-native";

type IValue = string | number;

interface IProps extends TextInputProps {
  onChangeText: (value: IValue) => void;
  delayTimeout?: number;
  minLength?: number;
  inputRef?: React.Ref<any>;
}
interface IState {
  value: IValue;
}

declare class DelayInput extends React.PureComponent<IProps, IState> {}

export default DelayInput;
