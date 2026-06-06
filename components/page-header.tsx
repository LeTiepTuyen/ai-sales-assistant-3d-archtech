import { Badge } from "@/components/ui/badge";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description: string;
  status?: string;
};

export function PageHeader({ title, description, status }: PageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-border/80 bg-card/95 p-5 shadow-sm shadow-black/5 sm:p-6">
      <AnimatedGridPattern
        className={cn(
          "text-primary/25 [mask-image:linear-gradient(to_right,white,transparent_72%)]",
          "inset-x-0 inset-y-[-40%] h-[180%] skew-y-6"
        )}
        duration={8}
        maxOpacity={0.08}
        numSquares={32}
        width={38}
        height={38}
      />
      <BorderBeam
        colorFrom="#f06423"
        colorTo="#fbbf24"
        duration={9}
        size={90}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <BlurFade delay={0.02}>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </BlurFade>
        {status ? (
          <BlurFade delay={0.08} direction="left">
            <Badge
              variant="outline"
              className="w-fit border-primary/30 bg-primary/10 text-primary"
            >
              <AnimatedShinyText className="mx-0 text-primary">
                {status}
              </AnimatedShinyText>
            </Badge>
          </BlurFade>
        ) : null}
      </div>
    </div>
  );
}
