
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
    imageUrl: "https://picsum.photos/seed/merch1/400/400",
    imageHint: "black t-shirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "The 'Big Mike' Signature Hoodie",
    price: "$49.99",
    imageUrl: "https://picsum.photos/seed/merch2/400/400",
    imageHint: "black hoodie",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "'Questionable Judgement' Snapback",
    price: "$29.99",
    imageUrl: "https://picsum.photos/seed/merch3/400/400",
    imageHint: "black cap",
    sizes: ["One Size"],
  },
  {
    id: 4,
    name: "Wojaplers Beanie",
    price: "$22.50",
    imageUrl: "https://picsum.photos/seed/merch4/400/400",
    imageHint: "grey beanie",
    sizes: ["One Size"],
  },
  {
    id: 5,
    name: "Velocity First Windbreaker",
    price: "$65.00",
    imageUrl: "https://picsum.photos/seed/merch5/400/400",
    imageHint: "windbreaker jacket",
    sizes: ["M", "L", "XL"],
  },
  {
    id: 6,
    name: "Face Ride Logo Mug",
    price: "$15.99",
    imageUrl: "https://picsum.photos/seed/merch6/400/400",
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
