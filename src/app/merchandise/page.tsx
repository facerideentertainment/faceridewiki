
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingBag, Tag, X } from "lucide-react";
import { MerchandiseItem, merchandiseItems } from "@/lib/merchandise";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MerchandiseCard = ({ item }: { item: MerchandiseItem }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState(item.sizes[0] || "One Size");

  const handleAddToCart = () => {
    addToCart({ ...item, selectedSize });
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };
  
  return (
    <Dialog key={item.id}>
      <Card className="flex flex-col">
        <CardHeader className="p-0">
          <DialogTrigger asChild>
            <div className="relative aspect-square w-full overflow-hidden rounded-t-lg cursor-pointer">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint={item.imageHint}
              />
            </div>
          </DialogTrigger>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-headline">{item.name}</CardTitle>
          <div className="flex items-center gap-2 mt-2 text-lg font-semibold text-primary">
            <Tag className="w-5 h-5" />
            <span>${item.price.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          {item.sizes.length > 1 && (
            <Select onValueChange={setSelectedSize} defaultValue={selectedSize}>
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
          <Button className="w-full flex-grow" onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
      <DialogContent className="p-0 border-0 max-w-2xl bg-transparent shadow-none">
        <div className="relative aspect-square">
           <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-contain rounded-lg"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function MerchandisePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Official Face Ride Gear</h1>
        <p className="mt-2 text-muted-foreground text-lg">Wear the chaos. Live the ride.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {merchandiseItems.map((item) => (
          <MerchandiseCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
