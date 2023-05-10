export type PubSubEvent = {
  source: string;
  value: Payload[];
};

export type Payload = {
  timestamp: string;
  data: any;
};
