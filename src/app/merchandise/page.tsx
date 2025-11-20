
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Tag } from "lucide-react";

const merchandiseItems = [
  {
    id: 1,
    name: "Official Face Ride Tee",
    price: "$24.99",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_ruqdawruqdawruqd.png?alt=media&token=deb247ed-9ecb-426e-8efd-2b751f51de0e",
    imageHint: "black t-shirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "The 'Big Mike' Signature Hoodie",
    price: "$49.99",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_c8lp1lc8lp1lc8lp.png?alt=media&token=8c42448f-883a-48a0-9666-09527510d069",
    imageHint: "black hoodie",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "John 'The Saddle' Smith Snapback",
    price: "$29.99",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_celsllcelsllcels.png?alt=media&token=841bac4e-b2f2-4177-bffc-fb118697b072",
    imageHint: "black cap",
    sizes: ["One Size"],
  },
  {
    id: 4,
    name: "Wojaplers Beanie",
    price: "$22.50",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_oymronoymronoymr.png?alt=media&token=7b8125d0-be2c-49f2-a4cb-02958814e150",
    imageHint: "grey beanie",
    sizes: ["One Size"],
  },
  {
    id: 5,
    name: "Velocity First Hoodie",
    price: "$65.00",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_402nzo402nzo402n.png?alt=media&token=405e6cea-802e-4e1d-a7f7-50eae407c40e",
    imageHint: "windbreaker jacket",
    sizes: ["M", "L", "XL"],
  },
  {
    id: 6,
    name: "Face Ride Logo Mug",
    price: "$15.99",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Merchandise%2FGemini_Generated_Image_rqraxgrqraxgrqra.png?alt=media&token=f3e36c97-b839-4c9c-8d5f-e7af9214b5fa",
    imageHint: "coffee mug",
    sizes: [],
  },
];

export default function MerchandisePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Official Face Ride Gear</h1>
        <p className="mt-2 text-muted-foreground text-lg">Wear the chaos. Live the ride.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {merchandiseItems.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-xl font-headline">{item.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2 text-lg font-semibold text-primary">
                <Tag className="w-5 h-5" />
                <span>{item.price}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
              {item.sizes.length > 0 && (
                <Select>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button className="w-full flex-grow">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
