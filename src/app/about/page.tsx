
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Award, Zap, History } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">About Face Ride Entertainment</h1>
        <p className="mt-2 text-muted-foreground text-lg">The Unofficial, Unauthorized, and Unbelievable Story</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Megaphone className="text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">
            Here at Face Ride Entertainment, we believe in one thing: content so potent it rearranges your DNA. We're not just an entertainment company; we're a full-contact sport for your senses. Our mission is to push the boundaries of taste, decency, and physics to deliver experiences that you'll be telling your therapist about for years to come. This wiki is the sacred text, the codex of our chaos. Use it wisely. Or don't.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Zap className="text-primary" />
              The Spark of "Genius"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              It all started in a dimly lit garage with a questionable wiring setup and a shared dream: what if we took things just a little too far? What began as a series of escalating dares involving office chairs and expired fire extinguishers quickly snowballed into a multi-platform media empire dedicated to the art of the face ride. We are the architects of mayhem you never knew you needed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Award className="text-primary" />
              Our Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Velocity First:</strong> If it's not moving at an unsafe speed, it's not worth doing.</li>
              <li><strong>Questionable Judgement:</strong> Every great idea starts with "This is probably a bad idea."</li>
              <li><strong>Maximum Impact:</strong> We aim for memories that leave a mark, emotionally and sometimes physically.</li>
              <li><strong>No Regrets:</strong> Just a series of well-documented, often painful, learning experiences.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <History className="text-primary" />
            Why a Wiki?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            History is written by the victors. Or, in our case, by whoever is left standing. The Face Ride legacy is a sprawling, chaotic mess of legendary stunts, failed experiments, and apocryphal tales. This wiki is our attempt to bring order to that chaos. It’s a living document, a user-manual for insanity, and the official record of every glorious, ill-advised moment. From the technical specs of the "Trebuchet-a-Pult" to the complete filmography of Big Mike Cumming, if it's part of the lore, it belongs here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
