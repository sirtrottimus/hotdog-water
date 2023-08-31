import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group,
} from '@mantine/core';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 120,
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 220,
    lineHeight: 1,
    marginBottom: `${Number(theme.spacing.xl) * 1.5}px`,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.gray[2]
        : theme.colors.dark[4],

    [theme.fn.smallerThan('sm')]: {
      fontSize: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 38,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,

    [theme.fn.smallerThan('sm')]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 540,
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `${Number(theme.spacing.xl) * 1.5}px`,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.gray[4]
        : theme.colors.gray[7],
  },
}));

export function ServerError({ error }: { error?: string }) {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <Container>
        {!error && (
          <>
            <div className={classes.label}>500</div>

            <Title className={classes.title}>
              Something bad just happened...
            </Title>
            <Text size="lg" align="center" className={classes.description}>
              Our servers could not handle your request. Don&apos;t worry, our
              development team was already notified. Try refreshing the page.
            </Text>
            <Group position="center">
              <Button variant="gradient" size="md">
                Refresh the page
              </Button>
            </Group>
          </>
        )}
        {error && (
          <>
            <Text size="lg" align="center" className={classes.description}>
              {error}
            </Text>
            <Group position="center">
              <Button variant="gradient" size="md">
                Go to Dashboard
              </Button>
            </Group>
          </>
        )}
      </Container>
    </div>
  );
}
