import { useEffect, useState } from 'react';
import { RoleInt as Role, UserInt as User } from '../utils/types';

const useAuthorization = (user: User, allowedRoles: string[], key: string) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (!allowedRoles) {
      setIsLoading(false);
      setIsAuthorized(true);
      return;
    }

    setIsAuthorized(false);
    user.roles.forEach((role: Role) => {
      role.permissions.some((permission) => {
        if (allowedRoles.includes(permission.name)) {
          setIsAuthorized(true);
          return true;
        }
      });
    });
    setIsLoading(false);
  }, [allowedRoles, key, user]);

  return { isAuthorized, isLoading };
};

export default useAuthorization;
