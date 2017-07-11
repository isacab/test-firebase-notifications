export class PushRegistration {
  token: string;
  
  constructor(init?:Partial<PushRegistration>) {
    Object.assign(this, init);
  }

}
