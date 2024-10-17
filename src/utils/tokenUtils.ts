import { UserModel } from "../model/userModel";

export const invalidateUserTokens = async (userId: string) => {
  await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

export const isTokenValid = async (userId: string, tokenVersion: number) => {
  const user = await UserModel.findById(userId);
  return user && user.tokenVersion === tokenVersion;
};