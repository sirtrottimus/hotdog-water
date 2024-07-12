import {
  Anchor,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  createStyles,
  rem,
} from '@mantine/core';
import Link from 'next/link';
import React from 'react';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[6]
        : theme.colors.gray[1],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: theme.radius.md,
    height: rem(90),
    fontWeight: 700,

    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.white,
    transition: 'box-shadow 150ms ease, transform 100ms ease',

    '&:hover': {
      boxShadow: theme.shadows.md,
      transform: 'scale(1.05)',
    },
  },
}));

type Action = {
  title: string;
  icon: any;
  color: string;
  href: string;
};

export function ActionsGrid({
  actions,
  title,
  seeAll,
}: {
  actions: Action[];
  title: string;
  seeAll?: {
    title: string;
    href: string;
  };
}) {
  const { classes, theme } = useStyles();

  const items = actions.map((item) => (
    <Link key={item.title} href={item.href} className={classes.item}>
      <item.icon color={theme.colors[item.color][6]} size="2rem" />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </Link>
  ));

  return (
    <Container size={'xs'} mt={30}>
      <Card withBorder radius="md" className={classes.card}>
        <Group position="apart">
          <Text className={classes.title}>{title}</Text>
          <Link href={seeAll?.href ?? ''}>
            <Anchor
              component="span"
              size="xs"
              color="dimmed"
              sx={{ lineHeight: 1 }}
            >
              {seeAll?.title}
            </Anchor>
          </Link>
        </Group>
        <SimpleGrid cols={3} mt="md">
          {items}
        </SimpleGrid>
      </Card>
    </Container>
  );
}
