export type Destination = "谷上" | "新神戸";

export interface TrainTime {
  hour: number;
  minute: number;
  dest: Destination;
}
