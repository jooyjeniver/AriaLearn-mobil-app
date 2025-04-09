declare module 'react-native-chart-kit' {
  import { ViewStyle } from 'react-native';
  
  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity: number) => string;
    style?: ViewStyle;
  }

  export interface LineChartData {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  }

  export interface LineChartProps {
    data: LineChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
  }

  export class LineChart extends React.Component<LineChartProps> {}
} 