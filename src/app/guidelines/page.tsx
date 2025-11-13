
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Bot, Shield, Pencil } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">The Rules of the Ride</h1>
        <p className="mt-2 text-muted-foreground text-lg">Contribution Guidelines for the Face Ride Wiki</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="text-primary" />
            General Philosophy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Welcome, contributor. You've been deemed worthy (or just persistent enough) to add to our sacred texts. Don't mess it up. The goal of this wiki is to be the definitive, chaotic, and hilarious source of all Face Ride lore. Write with the confidence of a man explaining something he just learned five minutes ago.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil />
              Tone & Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><b>Be Bold:</b> Write with an authoritative, encyclopedic, yet slightly unhinged tone.</p>
            <p><b>Be Funny:</b> If it doesn't make you chuckle, it's not Face Ride material. Sarcasm is a plus.</p>
            <p><b>Be (Mostly) Accurate:</b> We're chronicling history here, people. Get your facts straight, but don't let them get in the way of a good story.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot />
              Using the AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>The "AI Assist" button is your co-pilot in chaos. Use it to generate foundational content or to enhance your questionable prose.</p>
            <p><b>Remember:</b> The AI is a tool, not a replacement for your own bizarre creativity. It provides the face; you're in charge of riding it.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Viewer:</strong> You are a spectator. Look, but don't touch. Your place is on the sidelines, cheering or screaming.</p>
            <p><strong>Editor:</strong> You are a chosen one. You can create and edit. Wield this power with the grace of a monster truck rally.</p>
            <p><strong>Admin:</strong> You are a god among insects. You can do anything. Try not to delete the whole wiki on a whim.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
