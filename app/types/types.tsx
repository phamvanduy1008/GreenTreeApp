export interface IAdmin {
    _id?:string;
   email: string;
   password: string;
   name: string;
   role: "superadmin" | "admin";
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IUser {
  _id?:string;
   email: string;
   password: string;
   profile: {
     full_name: string;
     username: string;
     gender: "male" | "female" | "other" | "";
     birthday: Date | null;
     phone: string;
     avatar: string;
     address: string;
   };
   isActive: boolean;
   isVerified: boolean;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface ICategory {
  _id?:string;
   name: string;
   status: "active" | "inactive";
   image: string;
   description: string;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IPlant {
  _id?:string;
   name: string;
   avgPriceYesterday: number;
   avgPriceNow: number;
   category:string;
   description: string;
   image: string;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IInforPlant {
  _id?:string;
   climate: string;
   land: string;
   target: string;
   time: string;
   water: string;
   fertilize: string;
   grass: string;
   insect: string;
   disease: string;
   harvest: string;
   preserve: string;
   plant:string;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IProduct {
  _id?:string;
   name: string;
   price: number;
   info: string;
   image: string;
   status: "available" | "out_of_stock";
   description: string;
   evaluate: number;
   sold : number;
   category:string;
   plant:string;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IUserCart {
  _id?:string;
   product:string;
   quantity: number;
   user:string;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface ISeller {
  _id?:string;
   user:string;
   product:string;
   quantity: number;
   price: number;
   status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
   orderCode: string;
   dateOrder: Date;
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IContact {
  _id?:string;
   content: string;
   user:string;
   status: "pending" | "resolved";
   createdAt?: Date;
   updatedAt?: Date;
 }
 
 export interface IFavourite {
  _id?:string;
   user:string;
   products: string[]; 
   createdAt?: Date;
   updatedAt?: Date;
 }
 