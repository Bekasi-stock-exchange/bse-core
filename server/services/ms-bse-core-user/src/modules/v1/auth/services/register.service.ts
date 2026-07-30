import { UserModel } from "../../../../models/UserModel";

export interface RegisterPayload {
  username: string;
  email?: string;
  name: string;
  password: string;
  referralCode: string;
}

export class RegisterService {
  static async register(payload: RegisterPayload) {
    return UserModel.registerUser(payload);
  }
}
