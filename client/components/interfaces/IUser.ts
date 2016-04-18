namespace app.i {
  export interface IUser {
    email: string;
    password: string;
    age: number;
    gender: string;
    bio: string;
    location: string;
    name: string;
    imageUrl: string;

    facebook: {
      id: string,
      token: string
    };
  }
}
