export type orgProp = {
  id: number;
  name: string,
  price:number,
  stock:number,
  details:string,
  categories:string,
  photo:string
};

export type Cart = {
  CartItems:Array<{
    id: number,
    name: string,
    price:number,
    details:string,
    photo:string,
    quantity:number,
  }>
}