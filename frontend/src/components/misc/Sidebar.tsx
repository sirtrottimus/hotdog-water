import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ActionIcon,
  Box,
  Flex,
  ThemeIcon,
  createStyles,
  Tooltip,
  rem,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { UserInt } from '../../utils/types';
import useAuthorization from '../../hooks/useAuthorization';

interface ColorProps {
  color: string;
  depth: number;
  isDirectlyActive: boolean;
  index: number;
}

const useStyles = createStyles((theme, { color, depth }: ColorProps) => {
  const isDark = theme.colorScheme === 'dark';
  const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[3];
  const backgroundColor = isDark ? theme.colors.dark[5] : theme.colors.gray[1];
  const textColor = isDark ? theme.colors.dark[0] : theme.colors.gray[7];
  const activeBorderColor = theme.colors[color][4];
  const activeBackgroundColor = isDark
    ? theme.colors.dark[6]
    : theme.colors.gray[0];
  const activeTextColor = isDark ? theme.white : theme.black;
  const width = depth > 0 ? rem(`${depth * 10}%`) : undefined;
  const border = `${rem(2)} solid ${borderColor}`;

  return {
    common: {
      fontWeight: 500,
      display: 'block',
      padding: `${rem(theme.spacing.sm)} ${rem(theme.spacing.md)}`,
      fontSize: rem(theme.fontSizes.sm),
      position: 'relative',
      ':after': {
        content: depth > 0 ? '""' : undefined,
        position: 'absolute',
        left: rem(-0),
        top: rem(-25),
        width: width,
        height: rem('100%'),
        borderBottom: border,
      },
      '&:hover': {
        backgroundColor,
        color: isDark ? theme.white : theme.black,
      },
    },
    control: {
      color: isDark ? theme.colors.dark[0] : theme.black,
      borderLeft: depth > 0 ? border : undefined,
    },
    link: {
      textDecoration: 'none',
      color: textColor,
      borderLeft: border,
    },
    activeChild: {
      color: activeTextColor,
      position: 'relative',
      ':after': {
        content: '""',
        position: 'absolute',
        left: rem(-1),
        top: rem(-22),
        width: width,
        height: '100%',
        borderBottom: `${rem(2)} solid ${activeBorderColor}`,
      },
    },
    activeParent: {
      backgroundColor: activeBackgroundColor,
      color: activeTextColor,
      position: 'relative',
      ':after': {
        content: '""',
        position: 'absolute',
        left: rem(-0),
        top: rem(-25),
        width: width,
        height: rem('100%'),
        borderBottom: `${rem(2)} solid ${activeBorderColor}`,
      },
    },
    chevron: {
      transition: 'transform 200ms ease',
    },
  };
});

type SidebarProps = {
  links: Link[];
  depth?: number;
  index?: number;
  mini?: boolean;
  setMini?: (mini: boolean) => void;
  user: UserInt;
};

type SidebarItemProps = {
  link: Link;
  depth: number;
  index: number;
  mini?: boolean;
  setMini?: (mini: boolean) => void;
  user: UserInt;
};

export type Link = {
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  children: any;
  parent?: string;
  perms: string[];
  isActive?: boolean;
};

// Sidebar component
const Sidebar = ({ links, depth = 0, mini, setMini, user }: SidebarProps) => {
  if (!links) return null;

  return (
    <ul>
      {links.map((link, index) => {
        return (
          <SidebarItem
            key={link.path}
            link={link}
            depth={depth}
            index={index}
            mini={mini}
            setMini={setMini}
            user={user}
          />
        );
      })}
    </ul>
  );
};

// Sidebar item component
const SidebarItem = ({
  link,
  depth,
  index,
  mini,
  setMini,
  user,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isDirectlyActive, setIsDirectlyActive] = useState(false);
  const router = useRouter();
  const { classes, theme } = useStyles({
    color: link.color,
    depth: depth,
    isDirectlyActive,
    index,
  });
  const { isAuthorized } = useAuthorization(user, link.perms, 'sidebar');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Check if has a parent
  const hasParent = link.parent !== undefined;

  useEffect(() => {
    // Check if any child is active including grandchildren
    if (
      link.children?.some((child: Link) => {
        const hasActiveGrandchild = child.children?.some(
          (grandChild: Link) =>
            grandChild.path === router.pathname || grandChild.isActive
        );
        return (
          (child.path === router.pathname || child.isActive) ??
          hasActiveGrandchild
        );
      }) ||
      link.path === router.pathname
    ) {
      // log the last part of the path
      setIsDirectlyActive(
        router.pathname.split('/').pop() === link.path.split('/').pop()
      );
      setIsOpen(true);
      setIsActive(true);
    } else {
      setIsDirectlyActive(false);
      setIsOpen(false);
      setIsActive(false);
    }
  }, [router.pathname, link.children, link.path]);

  if (!isAuthorized) return null;

  return (
    <Box>
      <Flex
        justify={'space-between'}
        style={{
          paddingLeft: `${rem(depth > 0 ? depth * 30 : 20)}`,
          marginLeft: `${rem(depth > 0 ? 35 : 0)}`,
          borderLeft: `${rem(depth > 0 ? 2 : 0)} solid ${
            isActive
              ? theme.colors[link.color][4]
              : theme.colorScheme === 'dark'
              ? theme.colors.dark[4]
              : theme.colors.gray[3]
          }
          }`,
        }}
        className={`${classes.common} ${
          link.children ? classes.control : classes.link
        } ${
          isDirectlyActive && !hasParent
            ? classes.activeParent
            : isDirectlyActive && hasParent
            ? classes.activeChild
            : null
        } `}
      >
        <Link href={link.path}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {link.icon && (
              <Tooltip
                label={link.label}
                position="right"
                zIndex={100}
                transitionProps={{ duration: 300 }}
                sx={{
                  position: 'absolute',
                  overflow: 'visible',
                }}
              >
                <ThemeIcon variant="light" size={30} color={link.color}>
                  {link.icon}
                </ThemeIcon>
              </Tooltip>
            )}
            {!mini && <Box ml="xs">{link.label}</Box>}
          </Box>
        </Link>
        {link.children && (
          <>
            <ActionIcon onClick={handleToggle} disabled={isActive}>
              <IconChevronRight
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                }}
                className={classes.chevron}
              />
            </ActionIcon>
          </>
        )}
      </Flex>

      {isOpen && (
        <Box>
          <Sidebar
            links={link.children}
            depth={depth + 1}
            mini={mini}
            setMini={setMini}
            user={user}
          />{' '}
        </Box>
      )}
    </Box>
  );
};
export default Sidebar;
