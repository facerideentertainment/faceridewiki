
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-headline font-bold">Need Help? Suck an Egg.</h1>
        <p className="mt-2 text-muted-foreground text-lg">You wanted the ride, now deal with the consequences. Here are some answers you probably won't like.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I edit an article?</AccordionTrigger>
              <AccordionContent>
                With your fingers, genius. If you're an "Editor" or "Admin," you'll see a big "Edit" button. If you can't see it, it means you're not important enough to touch things. Don't take it personally. Or do.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>I forgot my password. What now?</AccordionTrigger>
              <AccordionContent>
                Sounds like a 'you' problem. There's probably a "Forgot Password" link on the login page. Try clicking that before you waste our time. If you can't find it, maybe you weren't meant to be here.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>The AI-generated content is weird.</AccordionTrigger>
              <AccordionContent>
                Congratulations, you've discovered the point. "Weird" is our baseline. If the AI wrote something that makes you uncomfortable, it's probably working as intended. Feel free to polish the weirdness into a fine, unsettling gem.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Who is responsible for all this?</AccordionTrigger>
              <AccordionContent>
                Legally? We're not at liberty to say. Morally? We all are, for participating. For a list of potential scapegoats, see our esteemed <a href="/about" className="underline text-primary">Associates</a>.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>My submission failed. Is the site broken?</AccordionTrigger>
              <AccordionContent>
                The site isn't broken; your spirit might be. Did you try turning your brain off and on again? Check for a red error message. If it's still not working, maybe your idea just sucked. The server has standards.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
