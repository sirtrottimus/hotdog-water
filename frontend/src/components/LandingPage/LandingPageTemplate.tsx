import Script from "next/script";
import styles from "./LandingPageTemplate.module.css";
import { Container } from "./components/Container";
import { Paragraph } from "./components/Paragraph";
import { Section } from "./components/Section";
import { Subtitle } from "./components/Subtitle";
import { IconBrandDiscord } from "@tabler/icons-react";

import { H1 } from "./components/headings";
import { Button, Group } from "@mantine/core";

const LandingPageTemplate = () => {
  const onConfettiLoad = () => {
    const key = "create-next-stack-hasShownConfetti-hat-bot-dashboard";
    const hasShownConfetti = localStorage.getItem(key);
    if (hasShownConfetti != null) return;

    const duration = 10 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    (function frame() {
      const timeLeft = animationEnd - Date.now();

      (window as any).confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: Math.max(200, 500 * (timeLeft / duration)),
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors: [
          "#26ccff",
          "#a25afd",
          "#ff5e7e",
          "#88ff5a",
          "#fcff42",
          "#ffa62d",
          "#ff36ff",
        ],
        shapes: ["square", "circle"],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.8, 1.2),
        drift: randomInRange(-0.1, 0.1),
      });

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    })();

    localStorage.setItem(key, "true");
  };

  const handleLogin = () => {
    // if (process.env.NODE_ENV === 'development') {
    //   window.location.href = `${process.env.DEV_API_URL}/api/auth/discord`;
    //   return;
    // }
    window.location.href = "http://localhost:6969/api/auth/discord";
  };

  return (
    <div
      className={styles.landingPageTemplate}
      style={{
        height: "100vh",
      }}
    >
      <Script
        src="https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js"
        onLoad={onConfettiLoad}
      />
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
            line-height: 1.5;
          }
        `}
      </style>
      <main
        style={{
          height: "85%",
        }}
      >
        <Section>
          <Container center className={styles.headerSection}>
            <H1>
              <span className={styles.textGradient}>Hat Bot Dashboard</span>
            </H1>
            <Subtitle>Home of the bot, the hat bot.</Subtitle>
          </Container>
          <Container>
            <Button
              size="xl"
              variant="gradient"
              gradient={{
                from: "#6838f1",
                to: "#dc51f2",
              }}
              onClick={handleLogin}
            >
              <Group>
                <IconBrandDiscord size={24} /> Log in with Discord
              </Group>
            </Button>
          </Container>
        </Section>
      </main>
      <footer>
        <Section>
          <Container center>
            <Paragraph>
              Copywrong {new Date().getFullYear()} - All Wrongs Reserved.
            </Paragraph>
          </Container>
        </Section>
      </footer>
    </div>
  );
};

export default LandingPageTemplate;
