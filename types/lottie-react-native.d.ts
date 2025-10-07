declare module "lottie-react-native" {
  import * as React from "react";
    import { StyleProp, ViewStyle } from "react-native";

  export interface LottieViewProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    style?: StyleProp<ViewStyle>;
    onAnimationFinish?: () => void;
  }

  export default class LottieView extends React.Component<LottieViewProps> {}
}
