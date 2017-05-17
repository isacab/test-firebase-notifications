export class PushRegistration {
  token: string;
  enabled: boolean;
  
  constructor(init?:Partial<PushRegistration>) {
    Object.assign(this, init);
  }

}
