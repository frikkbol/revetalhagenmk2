import React from "react";
import {
  Button,
  Column,
  Font,
  Heading,
  Hr,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const osloDateFormatter = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type BookingPaidTemplateProps = {
  totalPrice: number;
  name: string;
  item: {
    name: string;
  };
  from: Date;
  to: Date;
  bookingReference: string;
};

function BookingPaidTemplate({
  from = new Date(),
  item = { name: "Ukjent gjenstand" },
  name = "John Doe",
  to = new Date(),
  totalPrice = 600,
  bookingReference,
}: BookingPaidTemplateProps) {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <Html lang="no">
      <Tailwind>
        <Font fontFamily={"Poppins"} fallbackFontFamily={"Arial"} />

        <Section className="my-[16px]">
          <Img
            alt="Låhnehuset"
            className="w-full rounded-[12px] object-cover"
            height="320"
            src="https://www.revetalhagen.no/images/laahnehuset.jpg"
          />
          <Section className="mt-[32px] text-center">
            <Text className="my-[16px] text-[18px] leading-[28px] font-semibold text-indigo-600">
              Hei, {name.split(" ")[0]}
            </Text>
            <Heading
              as="h1"
              className="m-0 mt-[8px] text-[36px] leading-[36px] font-semibold text-gray-900"
            >
              Betaling mottatt!
            </Heading>
            <Text className="text-[16px] leading-[24px] text-gray-500">
              Vi har nå registrert betalingen for bookingen din, og alt er klart
              til oppholdet ditt. Vi gleder oss til å se deg!
            </Text>
            <Hr className="my-[16px] border-t-2 border-gray-300" />

            <Section className="w-fit">
              <Row className="w-fit" cellSpacing={10}>
                <Column>
                  <Text className="rounded-md border border-solid border-gray-300 bg-gray-100 px-3 py-1">
                    <strong>Objekt:</strong> {item.name}
                  </Text>
                </Column>
                <Column>
                  <Text className="rounded-md border border-solid border-gray-300 bg-gray-100 px-3 py-1">
                    <strong>Dato:</strong> {osloDateFormatter.format(from)} -{" "}
                    {osloDateFormatter.format(to)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Hr className="my-[16px] border-t-2 border-gray-300" />
            <Section>
              <Text>Betalt beløp</Text>
              <Text className="text-3xl font-black">{totalPrice} kr</Text>
            </Section>

            <Button
              className="mt-[16px] rounded-[8px] bg-indigo-600 px-[40px] py-[12px] font-semibold text-white"
              href={`${isDev ? "http://localhost:3000" : "https://www.revetalhagen.no"}/booking/status/${bookingReference}`}
            >
              Se status
            </Button>
          </Section>
        </Section>
      </Tailwind>
    </Html>
  );
}

export default BookingPaidTemplate;
