export type orgProp = {
  id: number;
  name: string;
  username:string;
  avatar: string;
  leftNotifications: number;
  progress: number;
  rightNotifications: number;
  members: number;
};

export type Cart = {
  CartItems: Array<{
    id: number;
    name: string;
    price: number;
    details: string;
    photo: string;
    quantity: number;
  }>;
};
