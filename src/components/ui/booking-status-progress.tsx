import type { booking } from "@/server/db/schema";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "./stepper";

type BookingStatusProgressProps = {
  status: typeof booking.$inferSelect.status;
  isPaid?: boolean;
};

const steps: { step: number; title: string; description: string }[] = [
  {
    step: 1,
    title: "Forespørsel mottatt",
    description:
      "Vi har mottatt bookingforespørselen din, og et frivillig medlem vil ta en titt på den i løpet av de neste dagene.",
  },
  {
    step: 2,
    title: "Godkjent",
    description:
      "Bookingforespørselen din er blitt godkjent, og du kan nå betale",
  },
  {
    step: 3,
    title: "Velkommen!",
    description:
      "Betalinga er mottatt, og vi gleder oss til å se deg! Hvis du har noen spørsmål, ikke nøl med å ta kontakt.",
  },
];

const StatusStepMap: Partial<
  Record<typeof booking.$inferSelect.status, number>
> = {
  pending: 1,
  confirmed: 2,
  completed: 4,
};

function BookingStatusProgress({
  status,
  isPaid = false,
}: BookingStatusProgressProps) {
  const stepValue =
    status === "confirmed" && isPaid ? 4 : (StatusStepMap[status] ?? 1);

  return (
    <div className="mx-auto">
      <Stepper defaultValue={1} orientation="vertical" value={stepValue}>
        {steps.map(({ step, description, title }) => (
          <StepperItem
            className="relative items-start [&:not(:last-child)]:flex-1"
            key={step}
            step={step}
          >
            <StepperTrigger className="items-start pb-12 last:pb-0">
              <StepperIndicator />
              <div className="mt-0.5 space-y-0.5 px-2 text-left">
                <StepperTitle>{title}</StepperTitle>
                <StepperDescription className="w-full max-w-96">
                  {description}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}

export default BookingStatusProgress;
