import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface FikastalleEmail {
  userFirstName?: string;
  emailSubject?: string;
  emailDetails: string;
  //Replace notifDateAndTime with data type: Date, ginawa ko lang string for example
  notifDateAndTime?: string;
  buttonLabel: string;
  storeLocation?: string;
}

const exampleEmail: FikastalleEmail = {
  userFirstName: "Jorge Angelo",
  emailSubject: "Order Status",
  emailDetails: "Your order is being prepared in the kitchen.",
  notifDateAndTime: "October 24, 2024 at 11:11 AM",
  buttonLabel: "Go to site",
  storeLocation:
    "Pook Rd. Corner, E. Ilagan St., Unawa Rd, Brgy. Iba, Silang, Cavite, 4118",
};
export const FikastalleEmailTemplate = () => {
  return (
    <Html>
      <Head />
      <Preview>Fikastalle email</Preview>
      <Body style={main}>
        <Container>
          <Section style={logo}>
            <Img
              src={`https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/emaillogopic.webp?alt=media&token=ef03364a-d1f4-4395-a8fe-8dd340f874be`}
            />
          </Section>

          <Section style={content}>
            <Row>
              <Img
                style={image}
                width={620}
                src={`https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/emailheaderpic.webp?alt=media&token=ecbc5070-2e62-4ea3-a69d-f4318b34c4c1`}
              />
            </Row>

            <Row style={{ ...boxInfos, paddingBottom: "0" }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Hi {exampleEmail.userFirstName},
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {exampleEmail.emailSubject}
                </Heading>

                <Text style={paragraph}>
                  <b>Time: </b>
                  {exampleEmail.notifDateAndTime}
                </Text>

                <Text style={paragraph}>{exampleEmail.emailDetails}</Text>
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: "0" }}>
              <Column style={containerButton} colSpan={2}>
                <Button style={button}>{exampleEmail.buttonLabel}</Button>
              </Column>
            </Row>
          </Section>

          <Section style={containerImageFooter}>
            <Img
              style={image}
              width={620}
              src={`https://firebasestorage.googleapis.com/v0/b/testingcapstonejg.appspot.com/o/emailheaderpic.webp?alt=media&token=ecbc5070-2e62-4ea3-a69d-f4318b34c4c1`}
            />
          </Section>

          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgb(0,0,0, 0.7)",
            }}
          >
            {exampleEmail.storeLocation}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default FikastalleEmailTemplate;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  borderRadius: "30px",
};

const paragraph = {
  fontSize: 16,
};

const logo = {
  padding: "10px 10px",
  width: "10px",
  height: "10px",
};

const containerButton = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const button = {
  backgroundColor: "rgb(38, 28, 21)",
  borderRadius: 3,
  color: "#FFF",
  fontWeight: "bold",
  cursor: "pointer",
  padding: "12px 30px",
};

const content = {
  border: "1px solid rgb(0,0,0, 0.1)",
  borderRadius: "3px",
  overflow: "hidden",
};

const image = {
  maxWidth: "100%",
};

const boxInfos = {
  padding: "20px",
};

const containerImageFooter = {
  padding: "45px 0 0 0",
};
