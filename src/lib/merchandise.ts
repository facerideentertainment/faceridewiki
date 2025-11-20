
export interface MerchandiseItem {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    imageHint: string;
    sizes: string[];
}

export const merchandiseItems: MerchandiseItem[] = [
  {
    id: 1,
    name: "Official Face Ride Tee",
    price: 24.99,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_ruqdawruqdawruqd.png?alt=media&token=deb247ed-9ecb-426e-8efd-2b751f51de0e",
    imageHint: "black t-shirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "The 'Big Mike' Signature Hoodie",
    price: 49.99,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_srtin1srtin1srti.png?alt=media&token=4e1a385a-60b2-4fc5-8f93-d5bd3f36fbff",
    imageHint: "black hoodie",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "John 'The Saddle' Smith Snapback",
    price: 29.99,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_celsllcelsllcels.png?alt=media&token=841bac4e-b2f2-4177-bffc-fb118697b072",
    imageHint: "black cap",
    sizes: ["One Size"],
  },
  {
    id: 4,
    name: "Wojaplers Beanie",
    price: 22.50,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_oymronoymronoymr.png?alt=media&token=7b8125d0-be2c-49f2-a4cb-02958814e150",
    imageHint: "grey beanie",
    sizes: ["One Size"],
  },
  {
    id: 5,
    name: "Velocity First Hoodie",
    price: 65.00,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_402nzo402nzo402n.png?alt=media&token=405e6cea-802e-4e1d-a7f7-50eae407c40e",
    imageHint: "windbreaker jacket",
    sizes: ["M", "L", "XL"],
  },
  {
    id: 6,
    name: "Face Ride Logo Mug",
    price: 15.99,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_rqraxgrqraxgrqra.png?alt=media&token=f3e36c97-b839-4c9c-8d5f-e7af9214b5fa",
    imageHint: "coffee mug",
    sizes: ["One Size"],
  },
];
