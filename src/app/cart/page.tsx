
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    toast({
      title: "Purchase Successful!",
      description: "Thank you for your order. Your face will be ridden shortly.",
    });
    clearCart();
    router.push("/merchandise");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <ShoppingCart className="w-8 h-8"/>
        <h1 className="text-3xl font-headline font-bold">Your Cart</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <h2 className="text-xl font-semibold">Your cart is empty.</h2>
            <p className="text-muted-foreground mt-2">Looks like you haven't added any gear yet. Let's fix that.</p>
            <Button asChild className="mt-6">
              <Link href="/merchandise">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map(item => (
                      <TableRow key={`${item.id}-${item.selectedSize}`}>
                        <TableCell>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <p>{item.name}</p>
                          <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id, item.selectedSize)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-4">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
