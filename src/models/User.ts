import { model, models, Schema, type Model } from 'mongoose';

export interface IUser {
  nome: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: [true, 'Informe seu nome.'],
      trim: true,
      maxlength: [80, 'O nome pode ter no máximo 80 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'Informe seu e-mail.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Informe sua senha.'],
      select: false,
    },
  },
  { timestamps: true },
);

export const User = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);

export default User;
